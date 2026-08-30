'use client';

import React from 'react';
import Link from 'next/link';
import { useCompanyDetailQueries } from '../hooks/company-queries';
import CompanyEditForm from '../components/form/company-edit-form';
import CompanyMemberDataTable from '../components/members/company-member-data-table';
import CompanyMemberAddAction from '../components/members/company-member-add-action';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@repo/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Badge } from '@repo/ui/components/badge';
import { Spinner } from '@repo/ui/components/spinner';
import { Button } from '@repo/ui/components/button';
import { ArrowLeft, Building2, Users2 } from 'lucide-react';

export default function CompanyDetailView({
  companyId,
}: {
  companyId: string;
}) {
  const companyQuery = useCompanyDetailQueries(companyId);
  const company = companyQuery.data;

  if (companyQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดข้อมูลบริษัท...
        </span>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-lg text-muted-foreground">
          ไม่พบข้อมูลบริษัทที่ระบุ
        </p>
        <Link href="/admin/company">
          <Button variant="outline">
            <ArrowLeft />
            กลับหน้ารายการบริษัท
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link href="/admin/company">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft />
              กลับหน้ารายการ
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {company.name}
              </h1>
              {company.isActive ? (
                <Badge variant="default">เปิดใช้งาน</Badge>
              ) : (
                <Badge variant="destructive">ปิดใช้งาน</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Slug: {company.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultSelectedKey="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger id="members" className="gap-2">
            <Users2 className="size-4" />
            สมาชิกและบทบาท
          </TabsTrigger>
          <TabsTrigger id="general" className="gap-2">
            <Building2 className="size-4" />
            ข้อมูลทั่วไป
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Members & Roles */}
        <TabsContent id="members" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>สมาชิกในองค์กร (Company Members)</CardTitle>
                <CardDescription>
                  จัดการรายชื่อสมาชิก เจ้าของ
                  และการมอบหมายบทบาทการทำงานในบริษัทนี้
                </CardDescription>
              </div>
              <CardAction>
                <CompanyMemberAddAction companyId={company.id} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <CompanyMemberDataTable companyId={company.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: General Info Form */}
        <TabsContent id="general" className="pt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไปของบริษัท</CardTitle>
              <CardDescription>
                แก้ไขข้อมูลพื้นฐาน เช่น ชื่อบริษัท, Slug, Logo URL
                และสถานะเปิด/ปิดใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyEditForm company={company} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
