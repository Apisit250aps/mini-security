'use client';

import { useModal } from '@ebay/nice-modal-react';

export function useModalControls(onAfterClose?: () => void) {
  const modal = useModal();
  const close = () => {
    modal.hide();
    modal.remove();
    onAfterClose?.();
  };

  return {
    isOpen: modal.visible,
    onOpenChange: (open: boolean) => {
      if (!open) close();
    },
    close,
  };
}
