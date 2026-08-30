'use client';

import React from 'react';
import Link from 'next/link';
import { useActiveCompany } from '../hooks/use-active-company';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useRoleListQueries } from '@/modules/role/hooks/role-queries';
import {
  Card,
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
  ShieldCheck,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export default function CompanyDashboardView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();
  const membersQuery = useCompanyMembersQueries(activeCompanyId);
  const rolesQuery = useRoleListQueries();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลภาพรวมองค์กร...
        </span>
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Building2 className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">ยังไม่มีข้อมูลบริษัท</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          คุณยังไม่ได้สังกัดหรือสร้างบริษัท
          กรุณาติดต่อผู้ดูแลระบบเพื่อรับคำเชิญเข้าสู่บริษัท
        </p>
      </div>
    );
  }

  const memberCount = membersQuery.data?.length || 0;
  const roleCount = rolesQuery.data?.length || 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-7" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {activeCompany.name}
              </h1>
              {activeCompany.isActive ? (
                <Badge variant="default">เปิดใช้งาน</Badge>
              ) : (
                <Badge variant="destructive">ปิดใช้งาน</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Slug: {activeCompany.slug}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/company/employee/new">
            <Button className="gap-2">
              <UserPlus className="size-4" />
              เพิ่มพนักงานใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              จำนวนพนักงานทั้งหมด
            </CardTitle>
            <Users className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="text-3xl font-bold">{memberCount} คน</div>
            <p className="text-xs text-muted-foreground">
              สมาชิกที่สังกัดในองค์กรนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              บทบาทและตำแหน่ง (Roles)
            </CardTitle>
            <ShieldCheck className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="text-3xl font-bold">{roleCount} บทบาท</div>
            <p className="text-xs text-muted-foreground">
              ตำแหน่งและสิทธิ์ที่ใช้งานได้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              สถานะองค์กร
            </CardTitle>
            <Building2 className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="text-2xl font-bold text-emerald-600">
              พร้อมใช้งาน
            </div>
            <p className="text-xs text-muted-foreground">
              ระบบความปลอดภัยและสิทธิ์เปิดทำงานปกติ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>จัดการพนักงานในองค์กร</CardTitle>
            <CardDescription>
              ตรวจสอบรายชื่อพนักงาน มอบหมายบทบาท และแก้ไขสถานะการทำงาน
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/company/employee">
              <Button variant="outline" className="gap-2">
                ดูรายชื่อพนักงาน
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>กำหนดบทบาทและสิทธิ์ (Roles & Permissions)</CardTitle>
            <CardDescription>
              สร้างตำแหน่งใหม่และกำหนดสิทธิ์การเข้าถึงเมนูต่างๆ ในบริษัท
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/company/role">
              <Button variant="outline" className="gap-2">
                จัดการสิทธิ์และบทบาท
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
