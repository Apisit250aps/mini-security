'use client';

import React from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormPlan, FormTemplate } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import FormPlanColumnActions from './form-plan-column-actions';

interface FormPlanColumnsOptions {
  companyId: string;
  templatesMap?: Map<string, FormTemplate>;
}

export const formPlanDataColumns = ({
  companyId,
  templatesMap,
}: FormPlanColumnsOptions): ColumnDef<FormPlan>[] => [
  {
    accessorKey: 'name',
    header: 'ชื่อแผนการตรวจ',
    cell: ({ row }) => {
      const template = templatesMap?.get(row.original.formTemplateId);
      return (
        <Link
          href={`/company/forms/plans/${row.original.id}`}
          className="flex flex-col group hover:underline cursor-pointer"
        >
          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
            {row.original.name}
          </span>
          {template && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              แบบฟอร์ม: {template.name}
            </span>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: 'scheduleKind',
    header: 'กำหนดการและรอบเวลา',
    cell: ({ row }) => {
      const plan = row.original;
      if (plan.scheduleKind === 'RECURRING') {
        const cfg = plan.scheduleConfig as Record<string, unknown> | null;
        const frequency = (cfg?.frequency as string) || 'DAILY';
        const openTime = (cfg?.openLocalTime as string) || '08:00';
        const dueOffset = cfg?.dueOffset as
          | { amount?: number; unit?: string }
          | undefined;
        const dueHours = dueOffset?.amount || 8;

        const freqLabel: Record<string, string> = {
          DAILY: 'ทุกวัน',
          WEEKLY: 'ทุกสัปดาห์',
          MONTHLY: 'ทุกเดือน',
          YEARLY: 'ทุกปี',
        };

        return (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-medium text-foreground">
              {freqLabel[frequency] || frequency} เวลา {openTime} น.
            </span>
            <span className="text-muted-foreground">
              ส่งภายใน {dueHours} ชม. ({plan.timezone})
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-medium text-foreground">
            กำหนดช่วงเวลาเฉพาะ
          </span>
          <span className="text-muted-foreground">ระบุช่วงเปิดและกำหนดส่ง</span>
        </div>
      );
    },
  },
  {
    id: 'status',
    header: 'สถานะ',
    cell: ({ row }) => {
      const plan = row.original;
      const isActive = Boolean(plan.effectiveFrom && !plan.effectiveUntil);
      const isPaused = Boolean(plan.effectiveUntil);

      if (isActive) {
        return (
          <Badge
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
          >
            เปิดใช้งาน
          </Badge>
        );
      }
      if (isPaused) {
        return (
          <Badge variant="secondary" className="text-xs">
            พักแผนชั่วคราว
          </Badge>
        );
      }
      return (
        <Badge
          variant="outline"
          className="text-xs border-amber-400 text-amber-600 dark:text-amber-400"
        >
          ยังไม่เปิดใช้งาน (ร่าง)
        </Badge>
      );
    },
  },
  {
    accessorKey: 'revision',
    header: 'Revision',
    cell: ({ getValue }) => (
      <Badge variant="outline" className="text-xs font-mono">
        v{getValue<number>()}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: (cell) => <FormPlanColumnActions cell={cell} companyId={companyId} />,
  },
];

export default formPlanDataColumns;
