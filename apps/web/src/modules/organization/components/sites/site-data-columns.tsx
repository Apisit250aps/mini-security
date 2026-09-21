import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Site } from '@repo/client';
import { Badge } from '@repo/ui/components/badge';
import { useOverlay } from '@repo/ui/hooks';
import { formatDate } from '@/shared/utils';
import SiteColumnActions from './site-column-actions';
import SiteEditForm from './site-edit-form';
import { MapPin } from 'lucide-react';

interface SiteColumnsOptions {
  organizationId?: string;
}

function SiteNameCell({
  site,
  organizationId,
}: {
  site: Site;
  organizationId: string;
}) {
  const ui = useOverlay();

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขข้อมูลไซต์',
      description: 'ปรับปรุงชื่อ สถานที่ตั้ง หรือสถานะการใช้งานของไซต์',
      size: 'md',
      children: <SiteEditForm organizationId={organizationId} site={site} />,
    });
  };

  return (
    <button
      type="button"
      onClick={handleEdit}
      className="flex flex-col text-left group cursor-pointer"
    >
      <span className="font-semibold text-sm text-primary hover:underline transition-colors">
        {site.name}
      </span>
      {site.address && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="size-3 shrink-0" />
          {site.address}
        </span>
      )}
    </button>
  );
}

export const siteListColumns = ({
  organizationId,
}: SiteColumnsOptions): ColumnDef<Site>[] => {
  const orgId = organizationId || '';
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อไซต์',
      cell: ({ row }) => (
        <SiteNameCell site={row.original} organizationId={orgId} />
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
      cell: (cell) => <SiteColumnActions cell={cell} organizationId={orgId} />,
    },
  ];
};
export default siteListColumns;
