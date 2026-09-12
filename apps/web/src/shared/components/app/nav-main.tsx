'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/shared/utils';
import { usePermission } from '@/modules/auth/hooks/permission-provider';

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
  const { hasAnyPermission } = usePermission();

  const visibleItems = React.useMemo(() => {
    return items
      .map((item) => {
        // Group with sub-items
        if ('items' in item && Array.isArray(item.items)) {
          if (
            item.requiredPermissions &&
            !hasAnyPermission(item.requiredPermissions)
          ) {
            return null;
          }

          const allowedSubItems = item.items.filter((sub) => {
            if (
              sub.requiredPermissions &&
              !hasAnyPermission(sub.requiredPermissions)
            ) {
              return false;
            }
            return true;
          });

          if (allowedSubItems.length === 0) {
            return null;
          }

          return {
            ...item,
            items: allowedSubItems,
          };
        }

        // Single Nav Item
        if (
          item.requiredPermissions &&
          !hasAnyPermission(item.requiredPermissions)
        ) {
          return null;
        }

        return item;
      })
      .filter((item): item is NavItem => item !== null);
  }, [items, hasAnyPermission]);

  return (
    <div className="flex flex-col gap-2">
      {visibleItems.map((item) => {
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
                          render={({ ref, ...props }) => (
                            <Link
                              ref={ref as React.Ref<HTMLAnchorElement>}
                              href={sub.url}
                              {...props}
                            />
                          )}
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
        const url = item.url ?? '#';
        const isActive = pathname === url;
        return (
          <SidebarGroup key={item.id} className="py-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    href={url}
                    tooltip={item.name}
                    render={({ ref, ...props }) => (
                      <Link
                        ref={ref as React.Ref<HTMLAnchorElement>}
                        href={url}
                        {...props}
                      />
                    )}
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
