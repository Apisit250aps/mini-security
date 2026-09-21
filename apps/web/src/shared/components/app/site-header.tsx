'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Separator } from '@repo/ui/components/separator';
import { SidebarTrigger } from '@repo/ui/components/sidebar';

import { OrganizationSwitcher } from './organization-switcher';

export function SiteHeader() {
  const pathname = usePathname();
  const isOrganizationSection = pathname.startsWith('/organization');

  const sectionTitle = React.useMemo(() => {
    if (pathname.startsWith('/admin')) {
      return 'ศูนย์ควบคุมผู้ดูแลระบบสูงสุด';
    }
    if (pathname.startsWith('/organization')) {
      return 'พื้นที่ทำงานองค์กร';
    }
    return 'ศูนย์กลางความปลอดภัย';
  }, [pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 data-vertical:self-auto"
          />
          <h1 className="text-base font-medium text-foreground">
            {sectionTitle}
          </h1>
        </div>

        {isOrganizationSection && (
          <div className="flex items-center gap-2">
            <OrganizationSwitcher />
          </div>
        )}
      </div>
    </header>
  );
}
