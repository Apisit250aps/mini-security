'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormSubmission, FormTemplate } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils/date';
import FormSubmissionColumnActions from './form-submission-column-actions';

interface FormSubmissionColumnsOptions {
  companyId: string;
  templatesMap: Map<string, FormTemplate>;
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
  templatesMap,
}: FormSubmissionColumnsOptions): ColumnDef<FormSubmission>[] => [
  {
    accessorKey: 'formTemplateId',
    header: 'แบบฟอร์ม',
    cell: ({ row }) => {
      const template = templatesMap.get(row.original.formTemplateId);
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {template?.name ||
              `Template #${row.original.formTemplateId.slice(0, 8)}`}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            ID: #{row.original.id.slice(0, 8)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'สถานะ',
    cell: ({ getValue }) => {
      const status = getValue<string>();
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
    accessorKey: 'startedAt',
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
