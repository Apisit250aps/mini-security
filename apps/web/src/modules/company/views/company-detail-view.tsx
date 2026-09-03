'use client';

import React from 'react';
import Link from 'next/link';
import { useCompanyDetailQueries } from '../hooks/company-queries';
import CompanyEditForm from '../components/form/company-edit-form';
import CompanyMemberDataTable from '../components/members/company-member-data-table';
import CompanyMemberAddAction from '../components/members/company-member-add-action';
import CompanyBranchDataTable from '../components/branches/company-branch-data-table';
import CompanyBranchAddAction from '../components/branches/company-branch-add-action';
import PageLayout from '@/shared/components/layouts/page-layout';
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
import { Button } from '@repo/ui/components/button';
import { ArrowLeft, Building2, GitBranch, Sparkles, Users2 } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';
import CompanyFeatureManager from '../components/features/company-feature-manager';

export default function CompanyDetailView({
  companyId,
}: {
  companyId: string;
}) {
  const companyQuery = useCompanyDetailQueries(companyId);
  const company = companyQuery.data;

  return (
    <PageLayout
      title={company?.name || 'รายละเอียดบริษัท'}
      description={
        company
          ? `Slug: ${company.slug}`
          : 'จัดการข้อมูล สมาชิก และสาขาขององค์กร'
      }
      isLoading={companyQuery.isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Link href={buildPageUrl('company')}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft />
              กลับหน้ารายการ
            </Button>
          </Link>
          {company &&
            (company.isActive ? (
              <Badge variant="default">เปิดใช้งาน</Badge>
            ) : (
              <Badge variant="destructive">ปิดใช้งาน</Badge>
            ))}
        </div>
      }
    >
      {!company ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <p className="text-lg text-muted-foreground">
            ไม่พบข้อมูลบริษัทที่ระบุ
          </p>
          <Link href={buildPageUrl('company')}>
            <Button variant="outline">
              <ArrowLeft />
              กลับหน้ารายการบริษัท
            </Button>
          </Link>
        </div>
      ) : (
        /* Tabs Layout */
        <Tabs defaultSelectedKey="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger id="members" className="gap-2">
              <Users2 className="size-4" />
              สมาชิกและบทบาท
            </TabsTrigger>
            <TabsTrigger id="branches" className="gap-2">
              <GitBranch className="size-4" />
              สาขาในองค์กร
            </TabsTrigger>
            <TabsTrigger id="features" className="gap-2">
              <Sparkles className="size-4" />
              ฟีเจอร์และสิทธิ์
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
                    จัดการรายชื่อสมาชิก เจ้าของ สาขาสังกัด
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

          {/* Tab 2: Branches */}
          <TabsContent id="branches" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>สาขาขององค์กร (Company Branches)</CardTitle>
                  <CardDescription>
                    จัดการรายชื่อสาขา สำนักงานใหญ่ และสถานที่ตั้งขององค์กร
                  </CardDescription>
                </div>
                <CardAction>
                  <CompanyBranchAddAction companyId={company.id} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <CompanyBranchDataTable companyId={company.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Features & Entitlements */}
          <TabsContent id="features" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  ฟีเจอร์และแพ็กเกจการใช้งาน (Features & Modules)
                </CardTitle>
                <CardDescription>
                  กำหนดว่าบริษัทนี้ได้รับสิทธิ์ในฟีเจอร์ใดบ้าง และเปิดหรือปิดการใช้งานสำหรับบริษัทนี้
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyFeatureManager companyId={company.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: General Info Form */}
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
      )}
    </PageLayout>
  );
}
