'use client';

import React from 'react';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from '@/shared/components/app/app-sidebar';
import { SiteHeader } from '@/shared/components/app/site-header';
import { CompanyGuard } from '@/shared/components/guards/company-guard';
import { useCompanySidebarNav } from '@/modules/company-workspace/hooks/use-company-sidebar-nav';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarItems } = useCompanySidebarNav();

  return (
    <CompanyGuard>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar
          variant="inset"
          brandTitle="พื้นที่ทำงานบริษัท"
          items={sidebarItems}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 p-4">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CompanyGuard>
  );
}
