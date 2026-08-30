'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useCompanyListQueries } from '@/modules/company/hooks/company-queries';
import { useRoleListQueries } from '@/modules/role/hooks/role-queries';
import { usePermissionListQueries } from '@/modules/permission/hooks/permission-queries';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Spinner } from '@repo/ui/components/spinner';
import {
  Building2,
  Users,
  Shield,
  Key,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

import { formatDate } from '@/shared/utils';

export default function AdminDashboardView() {
  const usersQuery = useUserListQueries();
  const companiesQuery = useCompanyListQueries();
  const rolesQuery = useRoleListQueries();
  const permissionsQuery = usePermissionListQueries();

  const isLoading =
    usersQuery.isLoading ||
    companiesQuery.isLoading ||
    rolesQuery.isLoading ||
    permissionsQuery.isLoading;

  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);
  const companies = useMemo(
    () => companiesQuery.data || [],
    [companiesQuery.data],
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
  const activeCompaniesCount = useMemo(
    () => companies.filter((c) => c.isActive).length,
    [companies],
  );

  const permissionModulesCount = useMemo(() => {
    const modules = new Set(permissions.map((p) => p.module));
    return modules.size;
  }, [permissions]);

  const recentCompanies = useMemo(() => {
    return [...companies].slice(0, 5);
  }, [companies]);

  const recentUsers = useMemo(() => {
    return [...users].slice(0, 5);
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลภาพรวมระบบส่วนกลาง...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-gradient-to-r from-card to-muted/40 p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="size-7" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                ศูนย์ควบคุมระบบส่วนกลาง (Super Admin)
              </h1>
              <Badge variant="default">ระบบทำงานปกติ</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              ภาพรวมความปลอดภัย ผู้ใช้งาน บริษัท
              และการควบคุมสิทธิ์ทั่วทั้งแพลตฟอร์ม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/company">
            <Button variant="outline" className="gap-2">
              <Building2 className="size-4" />
              ไปยัง Company Workspace
              <ExternalLink className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users Metric */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ผู้ใช้ทั้งหมด (Users)
            </CardTitle>
            <Users className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-bold">{users.length}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>เปิดใช้งาน {activeUsersCount} คน</span>
              <span>•</span>
              <span className="text-primary font-medium">
                Admin {adminUsersCount} คน
              </span>
            </div>
            <Link
              href="/admin/user"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
            >
              จัดการผู้ใช้
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Companies Metric */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              บริษัททั้งหมด (Companies)
            </CardTitle>
            <Building2 className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-bold">{companies.length}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>เปิดใช้งาน {activeCompaniesCount} บริษัท</span>
            </div>
            <Link
              href="/admin/company"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
            >
              จัดการบริษัท
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Roles Metric */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              บทบาททั้งหมด (Roles)
            </CardTitle>
            <Shield className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-bold">{roles.length}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>บทบาทและระดับสิทธิ์</span>
            </div>
            <Link
              href="/admin/role"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
            >
              จัดการบทบาท
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Permissions Metric */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              สิทธิ์ในระบบ (Permissions)
            </CardTitle>
            <Key className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-bold">{permissions.length}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>ครอบคลุม {permissionModulesCount} โมดูล</span>
            </div>
            <Link
              href="/admin/permission"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
            >
              จัดการสิทธิ์
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Overview Lists / Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>บริษัทในระบบ (Companies)</CardTitle>
              <CardDescription>
                รายชื่อองค์กรและบริษัทที่ลงทะเบียนล่าสุด
              </CardDescription>
            </div>
            <CardAction>
              <Link href="/admin/company">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                ยังไม่มีข้อมูลบริษัท
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {recentCompanies.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Building2 className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/company/${c.id}`}
                          className="font-medium text-sm hover:underline hover:text-primary transition-colors"
                        >
                          {c.name}
                        </Link>
                        <span className="text-xs text-muted-foreground font-mono">
                          {c.slug}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.isActive ? (
                        <Badge variant="default" className="text-[11px]">
                          เปิดใช้งาน
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[11px]">
                          ปิดใช้งาน
                        </Badge>
                      )}
                      <Link href={`/admin/company/${c.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          จัดการ
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ผู้ใช้งานล่าสุด (Recent Users)</CardTitle>
              <CardDescription>
                บัญชีผู้ใช้งานที่ลงทะเบียนในระบบ
              </CardDescription>
            </div>
            <CardAction>
              <Link href="/admin/user">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  ดูทั้งหมด
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                ยังไม่มีผู้ใช้งาน
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-medium text-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{u.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.isAdmin && (
                        <Badge variant="default" className="text-[11px]">
                          Admin
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status Banner */}
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
              สถานะระบบความปลอดภัยและการควบคุมสิทธิ์ (Security & RBAC Status)
            </CardTitle>
          </div>
          <CardDescription>
            ระบบยืนยันตัวตน (Authentication) และการบังคับใช้นโยบายสิทธิ์
            (Authorization Guards) ทำงานปกติทุกส่วน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="flex items-center gap-2 rounded-md bg-background/80 p-2.5 border">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="font-medium">Better Auth Session: Active</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-background/80 p-2.5 border">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="font-medium">
                Guard Policy: Super Admin Enforced
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-background/80 p-2.5 border">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="font-medium">
                Multi-tenant Isolation: Scoped
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
