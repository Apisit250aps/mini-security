'use client';

import React from 'react';
import { useSession } from '@/modules/auth/hooks/session-provider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/ui/components/sidebar';
import {
  Building2Icon,
  EllipsisVerticalIcon,
  LogOutIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { toast } from '@repo/ui/components/sonner';
import { useRouter } from 'next/navigation';
import { getInitials, getErrorMessage, buildPageUrl } from '@/shared/utils';

export default function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const session = useSession();
  const user = session.data?.user;

  if (session.status === 'loading') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger>
          <SidebarMenuButton size="lg" className="aria-expanded:bg-muted">
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? ''}
              />
              <AvatarFallback className="rounded-lg">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {user?.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </SidebarMenuButton>
          <DropdownMenu
            className="min-w-56"
            placement={isMobile ? 'bottom end' : 'right bottom'}
            offset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={user?.image ?? undefined}
                      alt={user?.name ?? ''}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {session.isSuperAdmin && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onAction={() => router.push(buildPageUrl('adminDashboard'))}
                  >
                    <ShieldCheckIcon />
                    ไปหน้าผู้ดูแลระบบสูงสุด
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onAction={() =>
                      router.push(buildPageUrl('companyDashboard'))
                    }
                  >
                    <Building2Icon />
                    ไปหน้าพื้นที่ทำงานบริษัท
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              variant="destructive"
              onAction={() => {
                session
                  .signOut()
                  .then(() => {
                    toast.success('ออกจากระบบสำเร็จ');
                    router.push(buildPageUrl('signIn'));
                  })
                  .catch((error) => {
                    toast.error(
                      getErrorMessage(error, 'เกิดข้อผิดพลาดในการออกจากระบบ'),
                    );
                  });
              }}
            >
              <LogOutIcon />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export { NavUser };
