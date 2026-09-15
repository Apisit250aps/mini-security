'use client';

import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import NiceModal, { unregister } from '@ebay/nice-modal-react';
import { ModalTitle } from './dialog/render-dialog';
import { ModalContent } from './content/render-content';
import { ModalSheet } from './sheet/render-sheet';
import { alertVariants, type AlertVariant } from './alert/variants';
import type {
  ModalProps,
  AlertDialogProps,
  SheetOverlayProps,
  OverlayContextState,
} from './types';

export type { ModalProps, AlertDialogProps, SheetOverlayProps } from './types';

const keyStore = () => {
  let id = 0;
  return () => ++id;
};
const getKey = keyStore();

/** Provides access to dialog, sheet and alert controls within the overlay provider. */
const OverlayContext = createContext<OverlayContextState | null>(null);

function Overlay({ children }: { children: React.ReactNode }) {
  const dialogStack = useRef<string[]>([]);
  const sheetStack = useRef<string[]>([]);
  const alertStack = useRef<{ id: string; variant: AlertVariant }[]>([]);

  /** Opens a dialog with a title and optional description. */
  const openDialog = useCallback((props: ModalProps): void => {
    const id = `dialog-${getKey()}`;
    NiceModal.register(id, ModalTitle);
    NiceModal.show(id, props);
    dialogStack.current.push(id);
  }, []);

  /** Opens a content dialog without a visible header. */
  const openContent = useCallback(
    (props: Omit<ModalProps, 'title' | 'description'>): void => {
      const id = `dialog-${getKey()}`;
      NiceModal.register(id, ModalContent);
      NiceModal.show(id, props);
      dialogStack.current.push(id);
    },
    [],
  );

  const closeDialog = useCallback(() => {
    const last = dialogStack.current.pop();
    if (last) NiceModal.hide(last);
  }, []);

  /** Opens a sheet/offcanvas drawer from the side. */
  const openSheet = useCallback((props: SheetOverlayProps): void => {
    const id = `sheet-${getKey()}`;
    NiceModal.register(id, ModalSheet);
    NiceModal.show(id, props);
    sheetStack.current.push(id);
  }, []);

  const closeSheet = useCallback(() => {
    const last = sheetStack.current.pop();
    if (last) NiceModal.hide(last);
  }, []);

  /** Opens an alert and removes its stack entry when dismissed. */
  const openAlertVariant = useCallback(
    (variant: AlertVariant, props: AlertDialogProps): void => {
      const id = `alert-${getKey()}`;
      NiceModal.register(id, alertVariants[variant]);
      NiceModal.show(id, {
        ...props,
        onAfterClose: () => {
          alertStack.current = alertStack.current.filter(
            (entry) => entry.id !== id,
          );
          unregister(id);
        },
      });
      alertStack.current.push({ id, variant });
    },
    [],
  );

  /** Closes the latest alert, optionally restricted to a specific variant. */
  const closeAlertVariant = useCallback((variant?: AlertVariant) => {
    let index = alertStack.current.length - 1;
    while (
      index >= 0 &&
      variant !== undefined &&
      alertStack.current[index]?.variant !== variant
    ) {
      index -= 1;
    }
    if (index < 0) return;
    const [entry] = alertStack.current.splice(index, 1);
    if (!entry) return;
    NiceModal.hide(entry.id);
    NiceModal.remove(entry.id);
    unregister(entry.id);
  }, []);

  const openAlert = useCallback(
    (props: AlertDialogProps) => openAlertVariant('confirm', props),
    [openAlertVariant],
  );
  const closeAlert = useCallback(
    () => closeAlertVariant(),
    [closeAlertVariant],
  );
  const openInfoAlert = useCallback(
    (props: AlertDialogProps) => openAlertVariant('info', props),
    [openAlertVariant],
  );
  const closeInfoAlert = useCallback(
    () => closeAlertVariant('info'),
    [closeAlertVariant],
  );

  const hideAll = useCallback(() => {
    dialogStack.current.forEach((id) => NiceModal.hide(id));
    sheetStack.current.forEach((id) => NiceModal.hide(id));
    alertStack.current.forEach(({ id }) => {
      NiceModal.hide(id);
      NiceModal.remove(id);
      unregister(id);
    });
    dialogStack.current = [];
    sheetStack.current = [];
    alertStack.current = [];
  }, []);

  const value = useMemo<OverlayContextState>(
    () => ({
      isOpen: false,
      open: openContent,
      close: closeDialog,
      hideAll,
      dialog: { open: openDialog, close: closeDialog },
      sheet: { open: openSheet, close: closeSheet },
      alert: {
        open: openAlert,
        close: closeAlert,
        info: { open: openInfoAlert, close: closeInfoAlert },
      },
    }),
    [
      openContent,
      closeDialog,
      hideAll,
      openDialog,
      openSheet,
      closeSheet,
      openAlert,
      closeAlert,
      openInfoAlert,
      closeInfoAlert,
    ],
  );

  return (
    <OverlayContext.Provider value={value}>
      <NiceModal.Provider>{children}</NiceModal.Provider>
    </OverlayContext.Provider>
  );
}

/**
 * Returns the overlay controls from the nearest provider.
 * @throws If called outside an OverlayProvider.
 */
export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};

const OverlayProvider = ({ children }: { children: React.ReactNode }) => {
  return <Overlay>{children}</Overlay>;
};

export default OverlayProvider;
