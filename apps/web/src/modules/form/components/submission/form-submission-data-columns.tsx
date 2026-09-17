import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormSubmissionItem } from '@repo/client';
import { Badge } from '@repo/ui/components/badge';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import FormSubmissionColumnActions from './form-submission-column-actions';

interface FormSubmissionColumnsOptions {
  companyId: string;
}

export const formSubmissionDataColumns = ({
  companyId,
}: FormSubmissionColumnsOptions): ColumnDef<FormSubmissionItem>[] => [
  {
    id: 'planAndTemplate',
    header: 'แผนงาน / แบบฟอร์ม',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <Link
          href={`/company/forms/submissions/${item.id}`}
          className="flex flex-col group cursor-pointer max-w-[260px]"
        >
          <span className="font-semibold text-sm text-primary group-hover:underline transition-colors truncate">
            {item.planName || 'แบบฟอร์มตรวจสอบ'}
          </span>
          {item.templateName && (
            <span className="text-xs text-muted-foreground truncate">
              แบบฟอร์ม: {item.templateName}
            </span>
          )}
        </Link>
      );
    },
  },
  {
    id: 'occurrenceAndRecipient',
    header: 'รอบตรวจ / ผู้รับมอบหมาย',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          <Badge variant="outline" className="w-fit text-[10px] font-normal">
            {item.recipientLabel || 'งานของตำแหน่ง'}
          </Badge>
          {item.occurrenceDueAt ? (
            <span className="text-muted-foreground mt-0.5">
              กำหนด: {formatDateTime(item.occurrenceDueAt)}
            </span>
          ) : item.occurrenceOpensAt ? (
            <span className="text-muted-foreground mt-0.5">
              รอบเปิด: {formatDate(item.occurrenceOpensAt)}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'sequence',
    header: 'ลำดับฉบับ',
    cell: ({ row }) => {
      const item = row.original;
      const seq = item.submissionSequence || 1;
      const isLatest = item.isLatest !== false;
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium">
            {seq === 1 ? 'ฉบับที่ 1' : `ฉบับแก้ไข (ฉบับที่ ${seq})`}
          </span>
          {isLatest && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              ล่าสุด
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'submitter',
    header: 'ผู้บันทึกข้อมูล',
    cell: ({ row }) => {
      const item = row.original;
      const name =
        item.submittedByName || item.startedByName || 'ไม่ระบุผู้ส่ง';
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-foreground">{name}</span>
          {item.submittedAt ? (
            <span className="text-muted-foreground">
              ส่งเมื่อ {formatDateTime(item.submittedAt)}
            </span>
          ) : (
            <span className="text-muted-foreground">
              เริ่มบันทึก {formatDate(item.createdAt)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'สถานะ / ผลการตรวจ',
    cell: ({ row }) => {
      const item = row.original;
      if (!item.submittedAt) {
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          >
            ฉบับร่าง (Draft)
          </Badge>
        );
      }

      if (item.finalReviewAction === 'APPROVE') {
        return (
          <div className="flex flex-col gap-0.5">
            <Badge
              variant="default"
              className="w-fit text-xs bg-emerald-600 hover:bg-emerald-600"
            >
              อนุมัติแล้ว
            </Badge>
            {item.reviewerName && (
              <span className="text-[11px] text-muted-foreground">
                โดย {item.reviewerName}
              </span>
            )}
          </div>
        );
      }

      if (item.finalReviewAction === 'RETURN') {
        return (
          <div className="flex flex-col gap-0.5 max-w-[200px]">
            <Badge
              variant="secondary"
              className="w-fit text-xs bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
            >
              ส่งกลับแก้ไข
            </Badge>
            {item.finalReviewNote && (
              <span
                className="text-[11px] text-muted-foreground truncate"
                title={item.finalReviewNote}
              >
                {item.finalReviewNote}
              </span>
            )}
          </div>
        );
      }

      return (
        <Badge
          variant="secondary"
          className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
        >
          รอตรวจรับ
        </Badge>
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
