'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useOrganizationListQueries } from '@/modules/organization/hooks/organization-queries';
import { useRoleListQueries } from '@/modules/role/hooks/role-queries';
import { usePermissionListQueries } from '@/modules/permission/hooks/permission-queries';
import PageLayout from '@/shared/components/layouts/page-layout';
import { Card, CardContent } from '@repo/ui/components/card';
import {
  MetricCard,
  DashboardStatsGrid,
  RecentActivityCard,
} from '@repo/ui/components/shared/dashboard';
import { Button } from '@repo/ui/components/button';
import {
  Building2,
  Users,
  Shield,
  Key,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

import {
  buildPageUrl,
  roleKeys,
  userKeys,
  organizationKeys,
  permissionKeys,
} from '@/shared/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminDashboardView() {
  const client = useQueryClient();

  const usersQuery = useUserListQueries();
  const rolesQuery = useRoleListQueries();
  const organizationsQuery = useOrganizationListQueries();
  const permissionsQuery = usePermissionListQueries();
  const isLoading =
    client.isFetching({
      queryKey: [
        ...userKeys.lists(),
        ...roleKeys.lists(),
        ...organizationKeys.lists(),
        ...permissionKeys.lists(),
      ],
    }) > 0;

  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);
  const organizations = useMemo(
    () => organizationsQuery.data || [],
    [organizationsQuery.data],
  );
  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);
  const permissions = useMemo(
    () => permissionsQuery.data || [],
    [permissionsQuery.data],
  );

  const activeUsersCount = useMemo(
    () => users.filter((u) => u.isActive).length,
    [users],
  );
  const adminUsersCount = useMemo(
    () => users.filter((u) => u.isAdmin).length,
    [users],
  );
  const activeOrganizationsCount = useMemo(
    () => organizations.filter((c) => c.isActive).length,
    [organizations],
  );

  const permissionModulesCount = useMemo(() => {
    const modules = new Set(permissions.map((p) => p.module));
    return modules.size;
  }, [permissions]);

  const recentOrganizations = useMemo(() => {
    return [...organizations].slice(0, 5);
  }, [organizations]);

  const recentUsers = useMemo(() => {
    return [...users].slice(0, 5);
  }, [users]);

  const organizationActivityItems = useMemo(
    () =>
      recentOrganizations.map((c) => ({
        id: c.id,
        title: (
          <Link
            href={buildPageUrl('organization', [c.id])}
            className="hover:text-primary hover:underline transition-colors"
          >
            {c.name}
          </Link>
        ),
        subtitle: c.slug,
        icon: <Building2 className="size-4" />,
        badge: {
          label: c.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
          variant: (c.isActive ? 'default' : 'destructive') as
            | 'default'
            | 'destructive',
          className: 'text-[11px]',
        },
      })),
    [recentOrganizations],
  );

  const userActivityItems = useMemo(
    () =>
      recentUsers.map((u) => ({
        id: u.id,
        title: u.name || 'ไม่ระบุชื่อ',
        subtitle: u.email,
        avatarText: u.name ? u.name.slice(0, 2).toUpperCase() : 'US',
        badge: u.isAdmin
          ? {
              label: 'Super Admin',
              variant: 'secondary' as const,
              className: 'text-[11px]',
            }
          : undefined,
        value: u.isActive ? (
          <span
            className="flex size-2 rounded-full bg-emerald-500"
            title="Active"
          />
        ) : (
          <span
            className="flex size-2 rounded-full bg-destructive"
            title="Inactive"
          />
        ),
      })),
    [recentUsers],
  );

  return (
    <PageLayout
      pageId="adminDashboard"
      isLoading={isLoading}
      actions={
        <Link href={buildPageUrl('organizationDashboard')}>
          <Button variant="outline" className="gap-2">
            <Building2 className="size-4" />
            <span>Organization Workspace</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 4 Metrics Cards */}
        <DashboardStatsGrid columns={4}>
          <MetricCard
            title="ผู้ใช้ทั้งหมด (Users)"
            value={users.length}
            icon={Users}
            description={`เปิดใช้งาน ${activeUsersCount} คน • Admin ${adminUsersCount} คน`}
            footerAction={
              <Link
                href={buildPageUrl('user')}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
              >
                จัดการผู้ใช้
                <ArrowRight className="size-3" />
              </Link>
            }
          />

          <MetricCard
            title="องค์กรทั้งหมด (Organizations)"
            value={organizations.length}
            icon={Building2}
            description={`เปิดใช้งาน ${activeOrganizationsCount} องค์กร`}
            footerAction={
              <Link
                href={buildPageUrl('organization')}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
              >
                จัดการองค์กร
                <ArrowRight className="size-3" />
              </Link>
            }
          />

          <MetricCard
            title="บทบาททั้งหมด (Roles)"
            value={roles.length}
            icon={Shield}
            description="บทบาทและระดับสิทธิ์"
            footerAction={
              <Link
                href={buildPageUrl('role')}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
              >
                จัดการบทบาท
                <ArrowRight className="size-3" />
              </Link>
            }
          />

          <MetricCard
            title="สิทธิ์ในระบบ (Permissions)"
            value={permissions.length}
            icon={Key}
            description={`ครอบคลุม ${permissionModulesCount} โมดูล`}
            footerAction={
              <Link
                href={buildPageUrl('permission')}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
              >
                จัดการสิทธิ์
                <ArrowRight className="size-3" />
              </Link>
            }
          />
        </DashboardStatsGrid>

        {/* Overview Lists / Activity */}
        <div className="grid gap-4 lg:grid-cols-2">
          <RecentActivityCard
            title="องค์กรในระบบ (Organizations)"
            description="รายชื่อองค์กรและบริษัทที่ลงทะเบียนล่าสุด"
            items={organizationActivityItems}
            emptyMessage="ยังไม่มีข้อมูลองค์กร"
            headerAction={
              <Link href={buildPageUrl('organization')}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            }
          />

          <RecentActivityCard
            title="ผู้ใช้งานล่าสุด (Recent Users)"
            description="บัญชีผู้ใช้งานที่ลงทะเบียนในระบบ"
            items={userActivityItems}
            emptyMessage="ยังไม่มีผู้ใช้งาน"
            headerAction={
              <Link href={buildPageUrl('user')}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            }
          />
        </div>

        {/* Security Health / RBAC Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  ระบบจัดการสิทธิ์ RBAC ทำงานเต็มประสิทธิภาพ
                </h3>
                <p className="text-xs text-muted-foreground">
                  สิทธิ์ทั้งหมดถูกควบคุมผ่าน Role-Based Access Control
                  และเชื่อมกับ API Gateway แบบเรียลไทม์
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={buildPageUrl('permission')}>
                <Button variant="outline" size="sm" className="text-xs">
                  ตรวจสอบ Matrix สิทธิ์
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
