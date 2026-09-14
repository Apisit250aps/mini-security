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

export type OverlayContextState = {
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

export interface OverlayRenderState {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
