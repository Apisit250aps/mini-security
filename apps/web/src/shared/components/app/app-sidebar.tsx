'use client';

import * as React from 'react';
import Link from 'next/link';
import { NavMain } from '@/shared/components/app/nav-main';
import { NavUser } from '@/shared/components/app/nav-user';
import type { NavItem } from '@/shared/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { Shield } from 'lucide-react';

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  items?: NavItem[];
  brandTitle?: string;
};

export function AppSidebar({
  items = [],
  brandTitle = 'Mini Security',
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="/"
              render={({ ref, ...linkProps }) => (
                <Link
                  ref={ref as React.Ref<HTMLAnchorElement>}
                  href="/"
                  {...linkProps}
                />
              )}
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Shield className="size-5 text-primary" />
              <span className="text-base font-semibold">{brandTitle}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
