'use client';

import * as React from 'react';

import { NavMain } from '@/shared/components/app/nav-main';
import { NavUser } from '@/shared/components/app/nav-user';
import type { NavItem } from '@/shared/utils/side-bar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { CommandIcon } from 'lucide-react';

const defaultUser = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  items?: NavItem[];
};

export function AppSidebar({ items = [], ...props }: AppSidebarProps) {
  const navMainItems = items.map((item) => ({
    title: item.name,
    url: 'url' in item ? (item.url ?? '#') : '#',
    icon: item.icon,
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              href="#"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={defaultUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
