'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { ModalTitle } from './dialog/render-dialog';
import { ModalContent } from './content/render-content';
import { ConfirmModal } from './alert/render-alert';
import type {
  ModalProps,
  AlertDialogProps,
  OverlayContextState,
} from './types';

export type { ModalProps, AlertDialogProps } from './types';

const keyStore = () => {
  let id = 0;
  return () => ++id;
};
const getKey = keyStore();

/** Provides access to dialog and alert controls within the overlay provider. */
const OverlayContext = createContext<OverlayContextState | null>(null);

function Overlay({ children }: { children: React.ReactNode }) {
  const dialogStack = useRef<string[]>([]);
  const alertStack = useRef<string[]>([]);

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

  /** Opens a confirmation alert. */
  const openAlert = useCallback((props: AlertDialogProps): void => {
    const id = `alert-${getKey()}`;
    NiceModal.register(id, ConfirmModal);
    NiceModal.show(id, props);
    alertStack.current.push(id);
  }, []);

  const closeAlert = useCallback(() => {
    const last = alertStack.current.pop();
    if (last) NiceModal.hide(last);
  }, []);

  const hideAll = useCallback(() => {
    dialogStack.current.forEach((id) => NiceModal.hide(id));
    alertStack.current.forEach((id) => NiceModal.hide(id));
    dialogStack.current = [];
    alertStack.current = [];
  }, []);

  return (
    <OverlayContext.Provider
      value={{
        isOpen: false,
        open: openContent,
        close: closeDialog,
        hideAll,
        dialog: {
          open: openDialog,
          close: closeDialog,
        },
        alert: {
          open: openAlert,
          close: closeAlert,
        },
      }}
    >
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
