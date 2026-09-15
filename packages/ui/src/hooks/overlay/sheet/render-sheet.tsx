'use client';

import React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { useModalControls } from '../use-modal-controls';
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#components/sheet';
import { DIALOG_SIZE } from '../dialog-size';
import { cn } from '#lib/utils';
import type { SheetOverlayProps, OverlayRenderState } from '../types';

function SheetView({
  children,
  title,
  description,
  side = 'right',
  size = 'lg',
  closeOnClickOutside = true,
  isOpen,
  onOpenChange,
}: SheetOverlayProps & OverlayRenderState) {
  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={closeOnClickOutside}
      side={side}
      className={cn(
        DIALOG_SIZE[size],
        'w-full max-w-full sm:w-auto',
      )}
    >
      <SheetHeader className="border-b border-border/50 pb-4">
        <SheetTitle>{title}</SheetTitle>
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
      {children && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-4">
          {children}
        </div>
      )}
    </Sheet>
  );
}

export function renderSheet(props: SheetOverlayProps & OverlayRenderState) {
  return <SheetView {...props} />;
}

export const ModalSheet = NiceModal.create<SheetOverlayProps>((props) => {
  const controls = useModalControls();
  return renderSheet({ ...props, ...controls });
});
