'use client';

import NiceModal from '@ebay/nice-modal-react';
import { useModalControls } from '../use-modal-controls';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#components/dialog';
import { DIALOG_SIZE } from '../dialog-size';
import { cn } from '#lib/utils';
import type { ModalProps, OverlayRenderState } from '../types';

function DialogView({
  children,
  title,
  description,
  size = 'md',
  closeOnClickOutside = true,
  stickyFooter = false,
  isOpen,
  onOpenChange,
}: ModalProps & OverlayRenderState) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
}

/** Returns an element so React owns the private component lifecycle. */
function renderDialog(props: ModalProps & OverlayRenderState) {
  return <DialogView {...props} />;
}

export const ModalTitle = NiceModal.create<ModalProps>((props) => {
  const controls = useModalControls();
  return renderDialog({ ...props, ...controls });
});
