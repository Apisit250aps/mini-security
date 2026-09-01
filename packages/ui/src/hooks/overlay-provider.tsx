'use client';

import { createContext, useCallback, useContext, useRef } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#components/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#components/alert-dialog';
import { cn } from '#lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DialogSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | 'full';

export interface ModalProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  size?: DialogSize;
  closeOnClickOutside?: boolean;
  stickyFooter?: boolean;
}

export interface AlertDialogProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  onConfirm: () => void;
  onCancel?: () => void;
}

type OverlayContextState = {
  isOpen: boolean;
  open: (props: Omit<ModalProps, 'title' | 'description'>) => void;
  close: () => void;
  hideAll: () => void;
  dialog: {
    open: (props: ModalProps) => void;
    close: () => void;
  };
  alert: {
    open: (props: AlertDialogProps) => void;
    close: () => void;
  };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DIALOG_SIZE: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  full: 'sm:max-w-[90vw]',
} as const;

const keyStore = () => {
  let id = 0;
  return () => ++id;
};
const getKey = keyStore();

// ---------------------------------------------------------------------------
// NiceModal components — react-aria-components / shadcn compatible
// ---------------------------------------------------------------------------

/** Dialog with title + description in the header */
const ModalTitle = NiceModal.create<ModalProps>(
  ({
    children,
    title,
    description,
    size = 'md',
    closeOnClickOutside = true,
    stickyFooter = false,
  }) => {
    const modal = useModal();

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        modal.hide();
        modal.remove();
      }
    };

    return (
      <Dialog
        isOpen={modal.visible}
        onOpenChange={handleOpenChange}
        isDismissable={closeOnClickOutside}
        className={cn(DIALOG_SIZE[size], 'max-h-[90vh]')}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && (
          <div
            className={cn(
              'flex-1 overflow-y-auto overflow-x-hidden',
              stickyFooter &&
                '[&_#footer]:sticky [&_#footer]:bottom-0 [&_#footer]:z-10 [&_#footer]:bg-card',
            )}
          >
            {children}
          </div>
        )}
      </Dialog>
    );
  },
);

/** Dialog with raw children (no built-in header) */
const ModalContent = NiceModal.create<
  Omit<ModalProps, 'title' | 'description'>
>(({ children, size = 'md', closeOnClickOutside = true }) => {
  const modal = useModal();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      modal.hide();
      modal.remove();
    }
  };

  return (
    <Dialog
      isOpen={modal.visible}
      onOpenChange={handleOpenChange}
      isDismissable={closeOnClickOutside}
      className={cn(DIALOG_SIZE[size], 'max-h-[90vh]')}
    >
      {children}
    </Dialog>
  );
});

/** Confirmation dialog (AlertDialog) */
const ConfirmModal = NiceModal.create<AlertDialogProps>(
  ({
    title,
    description,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    confirmVariant = 'default',
    onConfirm,
    onCancel,
  }) => {
    const modal = useModal();

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        modal.hide();
        modal.remove();
      }
    };

    const handleCancel = () => {
      onCancel?.();
      modal.hide();
      modal.remove();
    };

    const handleConfirm = () => {
      onConfirm();
      modal.hide();
      modal.remove();
    };

    return (
      <AlertDialog
        isOpen={modal.visible}
        onOpenChange={handleOpenChange}
        isDismissable={false}
        className="sm:max-w-md"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onPress={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    );
  },
);

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const OverlayContext = createContext<OverlayContextState | null>(null);

function Overlay({ children }: { children: React.ReactNode }) {
  const dialogStack = useRef<string[]>([]);
  const alertStack = useRef<string[]>([]);

  /** Open dialog with title + description */
  const openDialog = useCallback((props: ModalProps): void => {
    const id = `dialog-${getKey()}`;
    NiceModal.register(id, ModalTitle);
    NiceModal.show(id, props);
    dialogStack.current.push(id);
  }, []);

  /** Open dialog with raw children (no header) */
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

  /** Open confirmation alert */
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

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

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
