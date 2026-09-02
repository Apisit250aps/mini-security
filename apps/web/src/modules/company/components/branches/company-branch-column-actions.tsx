'use client';

import React, { useCallback } from 'react';
import type { CellContext } from '@tanstack/react-table';
import type { CompanyBranch } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useCompanyBranchDelete } from '../../hooks/company-mutations';
import { useOverlay } from '@repo/ui/hooks';
import CompanyBranchEditForm from './company-branch-edit-form';

interface CompanyBranchColumnActionsProps<T extends CompanyBranch> {
  cell: CellContext<T, unknown>;
  companyId: string;
}

export default function CompanyBranchColumnActions<T extends CompanyBranch>({
  cell,
  companyId,
}: CompanyBranchColumnActionsProps<T>) {
  const ui = useOverlay();
  const deleteMutation = useCompanyBranchDelete(companyId);

  const branch = cell.row.original;

  const handleDelete = useCallback(
    async (branchId: string) => {
      await deleteMutation.mutateAsync(branchId);
    },
    [deleteMutation],
  );

  const actionDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบสาขา',
      description: `คุณแน่ใจหรือไม่ว่าต้องการลบสาขา "${branch.name}"? (หากยังมีพนักงานสังกัดอยู่จะไม่สามารถลบได้)`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await handleDelete(branch.id);
        ui.hideAll();
      },
    });
  };

  const actionEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขข้อมูลสาขา',
      description: 'ปรับปรุงชื่อ สถานที่ตั้ง หรือสถานะการใช้งานของสาขา',
      size: 'md',
      children: <CompanyBranchEditForm companyId={companyId} branch={branch} />,
    });
  };

  return (
    <ColumnActions
      actions={{
        แก้ไขข้อมูลสาขา: {
          onAction: actionEdit,
        },
        ลบสาขา: {
          onAction: actionDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}
