'use client';

import React, { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormSubmission, FormTemplate } from '@repo/domains/entities';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { CheckCircle2, ClipboardCheck, FileText, Search } from 'lucide-react';
import { formatDate } from '@/shared/utils/date';

interface ActiveFormTableProps {
  templates: FormTemplate[];
  activeDraftsByTemplate: Map<string, FormSubmission>;
  onStartOrJoin: (templateId: string) => void;
  pendingTemplateId?: string;
  isLoading?: boolean;
}

export default function ActiveFormTable({
  templates,
  activeDraftsByTemplate,
  onStartOrJoin,
  pendingTemplateId,
  isLoading = false,
}: ActiveFormTableProps) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    );
  }, [templates, search]);

  const columns = useMemo<ColumnDef<FormTemplate>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'ชื่อแบบฟอร์มตรวจสอบ',
        cell: ({ row }) => {
          const template = row.original;
          return (
            <div className="flex items-start gap-3 py-1">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <ClipboardCheck className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">
                  {template.name}
                </span>
                {template.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {template.description}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'collaborativeStatus',
        header: 'สถานะ',
        cell: ({ row }) => {
          const draft = activeDraftsByTemplate.get(row.original.id);
          if (draft) {
            return (
              <div className="flex flex-col gap-1 items-start">
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 text-[11px] gap-1.5"
                >
                  <FileText className="size-3 text-amber-600" />
                  กำลังทำฟอร์ม (Rev. #{draft.revision})
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  เริ่มเมื่อ {formatDate(draft.startedAt)}
                </span>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-1 items-start">
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-[11px] gap-1.5"
              >
                <CheckCircle2 className="size-3" />
                พร้อมทำแบบฟอร์ม
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                ยังไม่มีฉบับร่าง
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'การดำเนินการ',
        cell: ({ row }) => {
          const templateId = row.original.id;
          const draft = activeDraftsByTemplate.get(templateId);
          const isPending = pendingTemplateId === templateId;

          if (draft) {
            return (
              <ButtonLoading
                size="sm"
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                isLoading={isPending}
                onPress={() => onStartOrJoin(templateId)}
              >
                <FileText className="size-3.5" />
                ทำแบบฟอร์มต่อ
              </ButtonLoading>
            );
          }

          return (
            <ButtonLoading
              size="sm"
              variant="default"
              className="gap-1.5"
              isLoading={isPending}
              onPress={() => onStartOrJoin(templateId)}
            >
              <FileText className="size-3.5" />
              ทำแบบฟอร์ม
            </ButtonLoading>
          );
        },
      },
    ],
    [activeDraftsByTemplate, pendingTemplateId, onStartOrJoin],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/60">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาแบบฟอร์มตรวจสอบ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          พร้อมใช้งาน {filteredData.length} แบบฟอร์ม
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} isLoading={isLoading} />
    </div>
  );
}
