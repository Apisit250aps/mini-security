import React from 'react';

import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { adminSidebarConfig } from '@/configs/contains/sidebar-configs/admin-sidebar';
import { AppSidebar } from '@/shared/components/app/app-sidebar';
import { SiteHeader } from '@/shared/components/app/site-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" items={adminSidebarConfig} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-2">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
