'use client';

import React, { useMemo } from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import type { AttendanceLocation } from '@repo/domains/entities';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useAttendanceLocationsQueries } from '../../hooks/attendance-queries';
import { useAttendanceLocationDelete } from '../../hooks/attendance-mutations';
import { Badge } from '@repo/ui/components/badge';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';
import { useOverlay } from '@repo/ui/hooks';
import LocationForm from './location-form';

function LocationColumnActions<T extends AttendanceLocation>({
  row,
}: CellContext<T, unknown>) {
  const ui = useOverlay();
  const loc = row.original;
  const deleteMutation = useAttendanceLocationDelete(loc.companyId);

  const handleEdit = () => {
    ui.dialog.open({
      title: 'แก้ไขสถานที่ลงเวลา',
      description: 'ปรับปรุงข้อมูลพิกัดและรัศมี GPS',
      size: 'lg',
      children: <LocationForm companyId={loc.companyId} location={loc} />,
    });
  };

  const handleDelete = () => {
    ui.alert.open({
      title: 'ยืนยันการลบสถานที่',
      description: `คุณต้องการลบ "${loc.name}" หรือไม่?`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(loc.id);
        ui.hideAll();
      },
    });
  };

  return (
    <ColumnActions
      actions={{
        แก้ไข: {
          onAction: handleEdit,
        },
        ลบ: {
          onAction: handleDelete,
          variant: 'destructive',
        },
      }}
    />
  );
}

const locationColumns = (): ColumnDef<AttendanceLocation>[] => [
  {
    accessorKey: 'name',
    header: 'ชื่อสถานที่',
    cell: ({ getValue }) => (
      <span className="font-semibold text-foreground">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'locationType',
    header: 'ประเภท',
    cell: ({ getValue }) => {
      const type = getValue<string>();
      return (
        <Badge variant="outline" className="font-mono text-xs">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'radiusMeters',
    header: 'รัศมี (เมตร)',
    cell: ({ getValue }) => {
      const radius = getValue<number | null>();
      return radius ? (
        <span className="font-mono text-xs font-medium">{radius} ม.</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: 'address',
    header: 'ที่อยู่ / พิกัด',
    cell: ({ row }) => {
      const loc = row.original;
      return (
        <div className="text-xs text-muted-foreground space-y-0.5">
          {loc.address && <p className="line-clamp-1">{loc.address}</p>}
          {(Boolean(loc.latitude) || Boolean(loc.longitude)) && (
            <p className="font-mono text-[11px] text-primary/80">
              {loc.latitude}, {loc.longitude}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'สถานะ',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          เปิดใช้งาน
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          ปิดใช้งาน
        </Badge>
      ),
  },
  {
    id: 'actions',
    header: 'จัดการ',
    cell: LocationColumnActions,
  },
];

export default function LocationTable({ companyId }: { companyId: string }) {
  const { data = [], isLoading } = useAttendanceLocationsQueries(companyId);
  const columns = useMemo(() => locationColumns(), []);

  const table = useMemo(
    () => ({
      data,
      columns,
      isLoading,
    }),
    [data, columns, isLoading],
  );

  return <DataTable {...table} />;
}
