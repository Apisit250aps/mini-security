'use client';

import React, { useMemo, useState } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useCompanyFormTemplatesQueries,
  useFormSubmissionsQueries,
} from '../../hooks/form-queries';
import formSubmissionDataColumns from './form-submission-data-columns';

interface FormSubmissionDataTableProps {
  companyId: string;
}

const STATUS_FILTERS = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'DRAFT', label: 'ฉบับร่าง (Draft)' },
  { value: 'SUBMITTED', label: 'รอพิจารณา (Submitted)' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว (Approved)' },
  { value: 'REJECTED', label: 'ไม่อนุมัติ (Rejected)' },
];

export default function FormSubmissionDataTable({
  companyId,
}: FormSubmissionDataTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const submissionsQuery = useFormSubmissionsQueries({ companyId });
  const templatesQuery = useCompanyFormTemplatesQueries(companyId);

  const templatesMap = useMemo(() => {
    return new Map((templatesQuery.data || []).map((t) => [t.id, t]));
  }, [templatesQuery.data]);

  const columns = useMemo(
    () => formSubmissionDataColumns({ companyId, templatesMap }),
    [companyId, templatesMap],
  );

  const filteredData = useMemo(() => {
    const list = submissionsQuery.data || [];
    if (selectedStatus === 'ALL') return list;
    return list.filter((s) => s.status === selectedStatus);
  }, [submissionsQuery.data, selectedStatus]);

  const isLoading = submissionsQuery.isLoading || templatesQuery.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            กรองตามสถานะ:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const isSelected = selectedStatus === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setSelectedStatus(f.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          ทั้งหมด {filteredData.length} รายการ
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} isLoading={isLoading} />
    </div>
  );
}
