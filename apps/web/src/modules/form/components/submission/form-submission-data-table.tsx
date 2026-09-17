'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Input } from '@repo/ui/components/input';
import { useFormSubmissionsQueries } from '../../hooks/form-queries';
import formSubmissionDataColumns from './form-submission-data-columns';
import type { FormSubmissionItem } from '@repo/client';

interface FormSubmissionDataTableProps {
  companyId?: string;
}

const STATUS_FILTERS = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว' },
  { value: 'IN_REVIEW', label: 'รอตรวจรับ' },
  { value: 'RETURNED', label: 'ส่งกลับแก้ไข' },
  { value: 'DRAFT', label: 'ฉบับร่าง' },
];

export default function FormSubmissionDataTable({
  companyId,
}: FormSubmissionDataTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyLatest, setOnlyLatest] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const submissionsQuery = useFormSubmissionsQueries(
    companyId ? { companyId } : undefined,
  );

  const columns = useMemo(
    () => formSubmissionDataColumns({ companyId: companyId ?? '' }),
    [companyId],
  );

  const rawData: FormSubmissionItem[] = useMemo(
    () => (submissionsQuery.data || []) as FormSubmissionItem[],
    [submissionsQuery.data],
  );

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      // 1. Filter only latest revision
      if (onlyLatest && !item.isLatest) {
        return false;
      }

      // 2. Filter status
      if (selectedStatus === 'DRAFT') {
        if (item.submittedAt) return false;
      } else if (selectedStatus === 'APPROVED') {
        if (item.finalReviewAction !== 'APPROVE') return false;
      } else if (selectedStatus === 'RETURNED') {
        if (item.finalReviewAction !== 'RETURN') return false;
      } else if (selectedStatus === 'IN_REVIEW') {
        if (!item.submittedAt || item.finalReviewAction) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const plan = (item.planName || '').toLowerCase();
        const template = (item.templateName || '').toLowerCase();
        const submitter = (
          item.submittedByName ||
          item.startedByName ||
          ''
        ).toLowerCase();
        if (!plan.includes(q) && !template.includes(q) && !submitter.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [rawData, onlyLatest, selectedStatus, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-3 rounded-xl border">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setSelectedStatus(f.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Right side: Lineage Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Latest only toggle */}
          <button
            type="button"
            onClick={() => setOnlyLatest(!onlyLatest)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              onlyLatest
                ? 'bg-background border-primary/50 text-primary'
                : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {onlyLatest ? '✓ เฉพาะฉบับล่าสุด' : 'แสดงทุกฉบับที่เคยส่ง'}
          </button>

          {/* Search box */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          แสดงผล {filteredData.length} จากทั้งหมด {rawData.length} ฉบับ
        </span>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        isLoading={submissionsQuery.isLoading}
      />
    </div>
  );
}
