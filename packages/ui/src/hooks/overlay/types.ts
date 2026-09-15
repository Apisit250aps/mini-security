import type { ReactNode } from 'react';

export type DialogSize =
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
  children?: ReactNode;
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

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

export interface SheetOverlayProps {
  title: string;
  description?: string;
  children?: ReactNode;
  side?: SheetSide;
  size?: DialogSize;
  closeOnClickOutside?: boolean;
}

export type OverlayContextState = {
  isOpen: boolean;
  open: (props: Omit<ModalProps, 'title' | 'description'>) => void;
  close: () => void;
  hideAll: () => void;
  dialog: {
    open: (props: ModalProps) => void;
    close: () => void;
  };
  sheet: {
    open: (props: SheetOverlayProps) => void;
    close: () => void;
  };
  alert: AlertControls & {
    info: AlertControls;
  };
};

export interface OverlayRenderState {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Internal notification used to remove a dismissed overlay from its stack. */
export interface OverlayLifecycleProps {
  onAfterClose?: () => void;
}

/** Shared controls supported by each alert variant. */
export interface AlertControls {
  open: (props: AlertDialogProps) => void;
  close: () => void;
}
