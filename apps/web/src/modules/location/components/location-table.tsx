'use client';

import type { ReactNode } from 'react';
import type { Location } from '@repo/client';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Badge } from '@repo/ui/components/badge';

export default function LocationTable({
  locations,
  branches,
  actions,
}: {
  locations: Location[];
  branches: { id: string; name: string }[];
  actions?: (location: Location) => ReactNode;
}) {
  const columns: ColumnDef<Location>[] = [
    { accessorKey: 'name', header: 'สถานที่' },
    {
      id: 'branch',
      header: 'สาขา',
      cell: ({ row }) => {
        const branch = branches.find(
          (b) => b.id === row.original.companyBranchId,
        );
        return (
          branch?.name ?? (row.original.companyBranchId ? 'สาขาหลัก' : '-')
        );
      },
    },
    { accessorKey: 'address', header: 'ที่อยู่' },
    {
      id: 'coordinates',
      header: 'พิกัด',
      cell: ({ row }) => `${row.original.latitude}, ${row.original.longitude}`,
    },
    { accessorKey: 'radiusMeters', header: 'รัศมี (เมตร)' },
    {
      id: 'status',
      header: 'สถานะ',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.original.isActive ? 'default' : 'outline'}>
            {row.original.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </Badge>
          {row.original.isPrimary ? (
            <Badge variant="secondary">สถานที่หลัก</Badge>
          ) : null}
        </div>
      ),
    },
  ];
  if (actions)
    columns.push({
      id: 'actions',
      header: 'จัดการ',
      cell: ({ row }) => actions(row.original),
    });
  return <DataTable data={locations} columns={columns} />;
}
