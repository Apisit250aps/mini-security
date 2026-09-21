'use client';

import React from 'react';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from '@/shared/components/app/app-sidebar';
import { SiteHeader } from '@/shared/components/app/site-header';
import { OrganizationGuard } from '@/shared/components/guards/organization-guard';
import { useOrganizationSidebarNav } from '@/modules/organization-workspace/hooks/use-organization-sidebar-nav';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarItems } = useOrganizationSidebarNav();

  return (
    <OrganizationGuard>
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
          brandTitle="พื้นที่ทำงานองค์กร"
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
    </OrganizationGuard>
  );
}
