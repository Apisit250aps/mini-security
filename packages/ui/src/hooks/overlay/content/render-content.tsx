'use client';

import NiceModal from '@ebay/nice-modal-react';
import { useModalControls } from '../use-modal-controls';
import { Dialog, DialogTitle } from '#components/dialog';
import { DIALOG_SIZE } from '../dialog-size';
import { cn } from '#lib/utils';
import type { ModalProps, OverlayRenderState } from '../types';

function ContentView({
  children,
  size = 'md',
  closeOnClickOutside = true,
  isOpen,
  onOpenChange,
}: Omit<ModalProps, 'title' | 'description'> & OverlayRenderState) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={closeOnClickOutside}
      className={cn(DIALOG_SIZE[size], 'max-h-[90vh]')}
    >
      <DialogTitle className="sr-only">Dialog</DialogTitle>
      {children}
    </Dialog>
  );
}

/** Returns an element so React owns the private component lifecycle. */
function renderContent(
  props: Omit<ModalProps, 'title' | 'description'> & OverlayRenderState,
) {
  return <ContentView {...props} />;
}

export const ModalContent = NiceModal.create<
  Omit<ModalProps, 'title' | 'description'>
>((props) => {
  const controls = useModalControls();
  return renderContent({ ...props, ...controls });
});
