import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormSubmission, FormTemplate, User } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils/date';
import FormSubmissionColumnActions from './form-submission-column-actions';

interface FormSubmissionColumnsOptions {
  companyId: string;
  templatesMap: Map<string, FormTemplate>;
  usersMap?: Map<string, User>;
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  DRAFT: { label: 'ฉบับร่าง (Draft)', variant: 'secondary' },
  SUBMITTED: { label: 'รอพิจารณา (Submitted)', variant: 'default' },
  APPROVED: { label: 'อนุมัติแล้ว (Approved)', variant: 'default' },
  REJECTED: { label: 'ไม่อนุมัติ (Rejected)', variant: 'destructive' },
};

export const formSubmissionDataColumns = ({
  companyId,
  templatesMap: _templatesMap,
  usersMap,
}: FormSubmissionColumnsOptions): ColumnDef<FormSubmission>[] => [
  {
    id: 'formTemplateId',
    header: 'แบบฟอร์ม',
    cell: ({ row }) => (
      <Link
        href={`/company/forms/submissions/${row.original.id}`}
        className="flex flex-col group cursor-pointer"
      >
        <span className="font-semibold text-sm text-primary hover:underline transition-colors">
          แบบฟอร์มบันทึกข้อมูล #{row.original.id.slice(0, 8)}
        </span>
        <span className="text-xs text-muted-foreground">
          ฉบับแก้ไขที่ {row.original.revision}
        </span>
      </Link>
    ),
  },
  {
    id: 'submitter',
    header: 'ผู้บันทึกข้อมูล',
    cell: ({ row }) => {
      const userId = row.original.submittedBy || row.original.startedBy;
      const user = userId ? usersMap?.get(userId) : undefined;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {user?.name ||
              (userId ? `ผู้ใช้ #${userId.slice(0, 6)}` : 'ไม่ระบุผู้ส่ง')}
          </span>
          {user?.email && (
            <span className="text-xs text-muted-foreground">{user.email}</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'สถานะ',
    cell: ({ row }) => {
      const isDraft = !row.original.submittedAt;
      const status = isDraft ? 'DRAFT' : 'SUBMITTED';
      const info = STATUS_MAP[status] || {
        label: status,
        variant: 'outline',
      };
      return <Badge variant={info.variant}>{info.label}</Badge>;
    },
  },
  {
    accessorKey: 'revision',
    header: 'การแก้ไข',
    cell: ({ getValue }) => {
      const rev = getValue<number>();
      return <Badge variant="outline">Rev #{rev}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'เริ่มบันทึกเมื่อ',
    cell: ({ getValue }) => {
      const date = getValue<string | Date>();
      return (
        <span className="text-xs text-muted-foreground">
          {formatDate(date)}
        </span>
      );
    },
  },
  {
    accessorKey: 'submittedAt',
    header: 'ส่งข้อมูลเมื่อ',
    cell: ({ getValue }) => {
      const date = getValue<string | Date | null | undefined>();
      return (
        <span className="text-xs text-muted-foreground">
          {date ? formatDate(date) : '-'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: (cell) => (
      <FormSubmissionColumnActions cell={cell} companyId={companyId} />
    ),
  },
];

export default formSubmissionDataColumns;
