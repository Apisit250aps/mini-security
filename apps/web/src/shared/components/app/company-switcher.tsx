'use client';

import * as React from 'react';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Building2 } from 'lucide-react';

export function CompanySwitcher({ className }: { className?: string }) {
  const { activeCompanyId, companies, setActiveCompanyId, isLoading } =
    useActiveCompany();

  if (isLoading || companies.length === 0) {
    return null;
  }

  if (companies.length === 1) {
    return (
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-md border bg-muted/40 text-xs font-medium text-foreground ${
          className ?? ''
        }`}
      >
        <Building2 className="size-3.5 text-muted-foreground shrink-0" />
        <span className="truncate max-w-44">{companies[0]?.name}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Select
        aria-label="เลือกองค์กร"
        selectedKey={activeCompanyId || null}
        onSelectionChange={(key) => {
          if (key) setActiveCompanyId(String(key));
        }}
        className="w-44 sm:w-56"
      >
        <SelectTrigger className="h-8 text-xs gap-2">
          <Building2 className="size-3.5 text-muted-foreground shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {companies.map((company) => (
              <SelectItem key={company.id} id={company.id} textValue={company.name}>
                {company.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
