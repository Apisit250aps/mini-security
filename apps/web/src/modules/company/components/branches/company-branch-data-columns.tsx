import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompanyBranch } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { formatDate } from '@/shared/utils';
import CompanyBranchColumnActions from './company-branch-column-actions';
import CompanyBranchEditForm from './company-branch-edit-form';
import { MapPin } from 'lucide-react';

interface CompanyBranchColumnsOptions {
  companyId: string;
}

function BranchNameCell({
  branch,
  companyId,
}: {
  branch: CompanyBranch;
  companyId: string;
}) {
  const ui = useOverlay();

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขข้อมูลสาขา',
      description: 'ปรับปรุงชื่อ สถานที่ตั้ง หรือสถานะการใช้งานของสาขา',
      size: 'md',
      children: <CompanyBranchEditForm companyId={companyId} branch={branch} />,
    });
  };

  return (
    <button
      type="button"
      onClick={handleEdit}
      className="flex flex-col text-left group cursor-pointer"
    >
      <span className="font-semibold text-sm text-primary hover:underline transition-colors">
        {branch.name}
      </span>
      {branch.address && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="size-3 shrink-0" />
          {branch.address}
        </span>
      )}
    </button>
  );
}

export const companyBranchListColumns = ({
  companyId,
}: CompanyBranchColumnsOptions): ColumnDef<CompanyBranch>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อสาขา',
      cell: ({ row }) => (
        <BranchNameCell branch={row.original} companyId={companyId} />
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'สถานะ',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="default">เปิดใช้งาน</Badge>
        ) : (
          <Badge variant="destructive">ปิดใช้งาน</Badge>
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'วันที่สร้าง',
      cell: ({ getValue }) => formatDate(getValue<Date>()),
    },
    {
      id: 'actions',
      header: 'จัดการ',
      cell: (cell) => (
        <CompanyBranchColumnActions cell={cell} companyId={companyId} />
      ),
    },
  ];
};

export default companyBranchListColumns;
