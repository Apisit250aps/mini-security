'use client';

import React, { useMemo, useState } from 'react';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Input } from '@repo/ui/components/input';
import { Search } from 'lucide-react';
import { useCompanyFormTemplatesQueries } from '../../hooks/form-queries';
import formTemplateDataColumns from './form-template-data-columns';

interface FormTemplateDataTableProps {
  companyId: string;
}

export default function FormTemplateDataTable({
  companyId,
}: FormTemplateDataTableProps) {
  const [search, setSearch] = useState('');
  const templatesQuery = useCompanyFormTemplatesQueries(companyId);

  const columns = useMemo(
    () => formTemplateDataColumns({ companyId }),
    [companyId],
  );

  const filteredData = useMemo(() => {
    const list = templatesQuery.data || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    );
  }, [templatesQuery.data, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือคำอธิบายแบบฟอร์ม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          ทั้งหมด {filteredData.length} แบบฟอร์ม
        </div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        isLoading={templatesQuery.isLoading}
      />
    </div>
  );
}
