'use client';

import NiceModal from '@ebay/nice-modal-react';
import { useModalControls } from '../../use-modal-controls';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#components/alert-dialog';
import type {
  AlertDialogProps,
  OverlayRenderState,
  OverlayLifecycleProps,
} from '../../types';

function InfoAlertView({
  title,
  description,
  confirmText = 'รับทราบ',
  confirmVariant = 'default',
  onConfirm,
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
        <AlertDialogAction variant={confirmVariant} onPress={onConfirm}>
          {confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialog>
  );
}

/** Returns an element so React owns the private component lifecycle. */
function renderInfoAlert(props: AlertDialogProps & OverlayRenderState) {
  return <InfoAlertView {...props} />;
}

export const InfoModal = NiceModal.create<
  AlertDialogProps & OverlayLifecycleProps
>((props) => {
  const controls = useModalControls(props.onAfterClose);
  return renderInfoAlert({
    ...props,
    ...controls,
    onConfirm: () => {
      props.onConfirm();
      controls.close();
    },
  });
});
