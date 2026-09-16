'use client';

import React, { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormSubmission } from '@repo/domains/entities';
import type { MyAssignmentItem } from '@repo/domains/applications/form';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import {
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  Search,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import { useRouter } from 'next/navigation';

interface ActiveFormTableProps {
  assignments: MyAssignmentItem[];
  activeDraftsByAssignment: Map<string, FormSubmission>;
  onStartOrJoin: (assignmentId: string) => void;
  pendingAssignmentId?: string;
  isLoading?: boolean;
}

export default function ActiveFormTable({
  assignments,
  activeDraftsByAssignment,
  onStartOrJoin,
  pendingAssignmentId,
  isLoading = false,
}: ActiveFormTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search.trim()) return assignments;
    const q = search.toLowerCase();
    return assignments.filter(
      (a) =>
        (a.templateName && a.templateName.toLowerCase().includes(q)) ||
        (a.templateDescription && a.templateDescription.toLowerCase().includes(q)) ||
        (a.roleName && a.roleName.toLowerCase().includes(q)),
    );
  }, [assignments, search]);

  const columns = useMemo<ColumnDef<MyAssignmentItem>[]>(
    () => [
      {
        accessorKey: 'templateName',
        header: 'ชื่อแบบฟอร์มตรวจสอบ',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-start gap-3 py-1">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <ClipboardCheck className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">
                  {item.templateName || 'แบบฟอร์มตรวจสอบ'}
                </span>
                {item.templateDescription && (
                  <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.templateDescription}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'target',
        header: 'ผู้รับงาน',
        cell: ({ row }) => {
          const item = row.original;
          if (item.companyMemberId) {
            return <Badge variant="outline" className="text-[11px]">งานส่วนตัว</Badge>;
          }
          return (
            <Badge variant="secondary" className="text-[11px]">
              {item.roleName ? `ตำแหน่ง: ${item.roleName}` : 'งานของตำแหน่ง'}
            </Badge>
          );
        },
      },
      {
        id: 'dueAt',
        header: 'กำหนดส่ง',
        cell: ({ row }) => {
          const item = row.original;
          if (item.dueAt) {
            return (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="size-3.5" />
                {formatDateTime(item.dueAt)}
              </span>
            );
          }
          return (
            <span className="text-xs text-muted-foreground">
              {item.createdAt ? formatDate(item.createdAt) : '-'}
            </span>
          );
        },
      },
      {
        id: 'collaborativeStatus',
        header: 'สถานะ',
        cell: ({ row }) => {
          const draft = activeDraftsByAssignment.get(row.original.id);
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
                  เริ่มเมื่อ {formatDate(draft.createdAt)}
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
                พร้อมเริ่มทำ
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
          const assignmentId = row.original.id;
          const draft = activeDraftsByAssignment.get(assignmentId);
          const isPending = pendingAssignmentId === assignmentId;

          if (draft) {
            return (
              <ButtonLoading
                size="sm"
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                isLoading={isPending}
                onPress={() => onStartOrJoin(assignmentId)}
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
              onPress={() => onStartOrJoin(assignmentId)}
            >
              <FileText className="size-3.5" />
              เริ่มทำแบบฟอร์ม
            </ButtonLoading>
          );
        },
      },
    ],
    [activeDraftsByAssignment, pendingAssignmentId, onStartOrJoin],
  );

  if (!isLoading && assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl border-dashed bg-muted/10">
        <ClipboardList className="size-10 text-muted-foreground mb-3" />
        <h3 className="text-base font-semibold">ยังไม่มีแบบฟอร์มที่ต้องตรวจในขณะนี้</h3>
        <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
          คุณยังไม่มีงานที่ได้รับมอบหมายตามรอบงาน (Occurrences) หากคุณเป็นผู้ดูแลระบบ ให้สร้างแผนงานและเปิดรอบงานก่อนเริ่มบันทึกแบบฟอร์ม
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push('/company/forms/tasks')}
          >
            ไปที่หน้างานของฉัน
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={() => router.push('/company/forms/templates')}
          >
            จัดการแม่แบบฟอร์ม
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/60">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาแบบฟอร์มที่ได้รับมอบหมาย..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          พร้อมใช้งาน {filteredData.length} รายการ
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} isLoading={isLoading} />
    </div>
  );
}
