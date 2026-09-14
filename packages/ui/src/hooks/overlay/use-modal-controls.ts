'use client';

import { useModal } from '@ebay/nice-modal-react';

export function useModalControls() {
  const modal = useModal();
  const close = () => {
    modal.hide();
    modal.remove();
  };

  return {
    isOpen: modal.visible,
    onOpenChange: (open: boolean) => {
      if (!open) close();
    },
    close,
  };
}
