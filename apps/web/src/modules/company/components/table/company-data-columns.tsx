import { ColumnDef } from '@tanstack/react-table';
import { Company } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import CompanyColumnActions from './company-column-actions';

const companyListColumns = (): ColumnDef<Company>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'ชื่อบริษัท',
    },
    {
      accessorKey: 'slug',
      header: 'รหัสบริษัท (Slug)',
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
      cell: CompanyColumnActions,
    },
  ];
};

export default companyListColumns;
