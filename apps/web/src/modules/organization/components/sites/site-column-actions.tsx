'use client';

import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { Site } from '@repo/client';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useSiteDelete } from '../../hooks/organization-mutations';
import { useOverlay } from '@repo/ui/hooks';
import SiteEditForm from './site-edit-form';

interface SiteColumnActionsProps<T extends Site> {
  cell: CellContext<T, unknown>;
  organizationId?: string;
}

export default function SiteColumnActions<T extends Site>({
  cell,
  organizationId,
}: SiteColumnActionsProps<T>) {
  const orgId = organizationId || '';
  const ui = useOverlay();
  const deleteMutation = useSiteDelete(orgId);

  const site = cell.row.original;

  const handleDelete = useCallback(
    async (siteId: string) => {
      await deleteMutation.mutateAsync(siteId);
    },
    [deleteMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบไซต์',
      description: `คุณแน่ใจหรือไม่ว่าต้องการลบไซต์ "${site.name}"? (หากยังมีพนักงานสังกัดอยู่จะไม่สามารถลบได้)`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleDelete(site.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขข้อมูลไซต์',
      description: 'ปรับปรุงชื่อ สถานที่ตั้ง หรือสถานะการใช้งานของไซต์',
      size: 'md',
      children: <SiteEditForm organizationId={orgId} site={site} />,
    });
  };

  return (
    <ColumnActions
      actions={{
        แก้ไขข้อมูลไซต์: {
          onAction: actionEdit,
        },
        ลบไซต์: {
          onAction: actionDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}
