'use client';

import NiceModal from '@ebay/nice-modal-react';
import { useModalControls } from '../use-modal-controls';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#components/alert-dialog';
import type { AlertDialogProps, OverlayRenderState } from '../types';

function AlertView({
  title,
  description,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
  isOpen,
  onOpenChange,
}: AlertDialogProps & OverlayRenderState) {
  return (
    <AlertDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
        <AlertDialogCancel onPress={onCancel}>{cancelText}</AlertDialogCancel>
        <AlertDialogAction variant={confirmVariant} onPress={onConfirm}>
          {confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialog>
  );
}

/** Returns an element so React owns the private component lifecycle. */
function renderAlert(props: AlertDialogProps & OverlayRenderState) {
  return <AlertView {...props} />;
}

export const ConfirmModal = NiceModal.create<AlertDialogProps>((props) => {
  const controls = useModalControls();
  return renderAlert({
    ...props,
    ...controls,
    onConfirm: () => {
      props.onConfirm();
      controls.close();
    },
    onCancel: () => {
      props.onCancel?.();
      controls.close();
    },
  });
});
