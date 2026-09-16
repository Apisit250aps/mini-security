'use client';

import React, { useMemo, useState } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Input } from '@repo/ui/components/input';
import { Search } from 'lucide-react';
import type { FormPlan, FormTemplate } from '@repo/domains/entities';
import {
  useCompanyFormTemplatesQueries,
  useFormPlansQueries,
} from '../../hooks/form-queries';
import formPlanDataColumns from './form-plan-data-columns';

interface FormPlanDataTableProps {
  companyId: string;
}

export default function FormPlanDataTable({
  companyId,
}: FormPlanDataTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'PAUSED'>('ALL');

  const plansQuery = useFormPlansQueries(companyId);
  const templatesQuery = useCompanyFormTemplatesQueries(companyId);

  const templatesMap = useMemo(() => {
    const map = new Map<string, FormTemplate>();
    (templatesQuery.data || []).forEach((t) => map.set(t.id, t));
    return map;
  }, [templatesQuery.data]);

  const columns = useMemo(
    () => formPlanDataColumns({ companyId, templatesMap }),
    [companyId, templatesMap],
  );

  const filteredData = useMemo(() => {
    let list: FormPlan[] = plansQuery.data || [];

    // Filter by status
    if (statusFilter === 'ACTIVE') {
      list = list.filter((p) => Boolean(p.effectiveFrom && !p.effectiveUntil));
    } else if (statusFilter === 'DRAFT') {
      list = list.filter((p) => !p.effectiveFrom);
    } else if (statusFilter === 'PAUSED') {
      list = list.filter((p) => Boolean(p.effectiveUntil));
    }

    // Filter by search
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) => {
      const planNameMatches = p.name.toLowerCase().includes(q);
      const templateName = templatesMap.get(p.formTemplateId)?.name || '';
      const templateMatches = templateName.toLowerCase().includes(q);
      return planNameMatches || templateMatches;
    });
  }, [plansQuery.data, statusFilter, search, templatesMap]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อแผน หรือแม่แบบฟอร์ม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5 bg-background text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              เปิดใช้งาน
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'DRAFT'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ฉบับร่าง
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PAUSED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                statusFilter === 'PAUSED'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              พักแผน
            </button>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap pl-2">
            ทั้งหมด {filteredData.length} แผน
          </div>
        </div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        isLoading={plansQuery.isLoading || templatesQuery.isLoading}
      />
    </div>
  );
}
