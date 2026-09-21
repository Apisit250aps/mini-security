'use client';

import * as React from 'react';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Building2 } from 'lucide-react';

export function OrganizationSwitcher({ className }: { className?: string }) {
  const {
    activeOrganizationId,
    organizations,
    setActiveOrganizationId,
    isLoading,
  } = useActiveOrganization();

  if (isLoading || organizations.length === 0) {
    return null;
  }

  if (organizations.length === 1) {
    return (
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-md border bg-muted/40 text-xs font-medium text-foreground ${
          className ?? ''
        }`}
      >
        <Building2 className="size-3.5 text-muted-foreground shrink-0" />
        <span className="truncate max-w-44">{organizations[0]?.name}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Select
        aria-label="เลือกองค์กร"
        selectedKey={activeOrganizationId || null}
        onSelectionChange={(key) => {
          if (key) setActiveOrganizationId(String(key));
        }}
        className="w-44 sm:w-56"
      >
        <SelectTrigger className="h-8 text-xs gap-2">
          <Building2 className="size-3.5 text-muted-foreground shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {organizations.map((org) => (
              <SelectItem key={org.id} id={org.id} textValue={org.name}>
                {org.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
