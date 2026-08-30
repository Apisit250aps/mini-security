'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/shared/utils';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        // Group with sub-items
        if ('items' in item && Array.isArray(item.items)) {
          return (
            <SidebarGroup key={item.id}>
              {item.name && <SidebarGroupLabel>{item.name}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((sub) => {
                    const isActive = pathname === sub.url;
                    return (
                      <SidebarMenuItem key={sub.id}>
                        <SidebarMenuButton
                          href={sub.url}
                          tooltip={sub.name}
                          isActive={isActive}
                        >
                          {sub.icon}
                          <span>{sub.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        }

        // Single Nav Item
        const isActive = pathname === item.url;
        return (
          <SidebarGroup key={item.id} className="py-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    href={item.url || '#'}
                    tooltip={item.name}
                    isActive={isActive}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </div>
  );
}
