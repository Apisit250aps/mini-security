'use client';

import React from 'react';
import Link from 'next/link';
import { useOrganizationDetailQueries } from '../hooks/organization-queries';
import OrganizationEditForm from '../components/form/organization-edit-form';
import OrganizationMemberDataTable from '../components/members/organization-member-data-table';
import OrganizationMemberAddAction from '../components/members/organization-member-add-action';
import SiteDataTable from '../components/sites/site-data-table';
import SiteAddAction from '../components/sites/site-add-action';
import OrganizationFeatureManager from '../components/features/organization-feature-manager';
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
import { ArrowLeft, Building2, MapPin, Sparkles, Users2 } from 'lucide-react';
import { buildPageUrl } from '@/shared/utils';

export default function OrganizationDetailView({
  organizationId,
  id,
}: {
  organizationId?: string;
  id?: string;
}) {
  const orgId = organizationId || id || '';
  const organizationQuery = useOrganizationDetailQueries(orgId);
  const organization = organizationQuery.data;

  return (
    <PageLayout
      title={organization?.name || 'รายละเอียดองค์กร'}
      description={
        organization
          ? `Slug: ${organization.slug}`
          : 'จัดการข้อมูล สมาชิก และไซต์ขององค์กร'
      }
      isLoading={organizationQuery.isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Link href={buildPageUrl('organization')}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft />
              กลับหน้ารายการ
            </Button>
          </Link>
          {organization &&
            (organization.isActive ? (
              <Badge variant="default">เปิดใช้งาน</Badge>
            ) : (
              <Badge variant="destructive">ปิดใช้งาน</Badge>
            ))}
        </div>
      }
    >
      {!organization ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <p className="text-lg text-muted-foreground">
            ไม่พบข้อมูลองค์กรที่ระบุ
          </p>
          <Link href={buildPageUrl('organization')}>
            <Button variant="outline">
              <ArrowLeft />
              กลับหน้ารายการองค์กร
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
            <TabsTrigger id="sites" className="gap-2">
              <MapPin className="size-4" />
              ไซต์ในองค์กร
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
                  <CardTitle>สมาชิกในองค์กร (Organization Members)</CardTitle>
                  <CardDescription>
                    จัดการรายชื่อสมาชิก เจ้าของ ไซต์สังกัด
                    และการมอบหมายบทบาทการทำงานในองค์กรนี้
                  </CardDescription>
                </div>
                <CardAction>
                  <OrganizationMemberAddAction
                    organizationId={organization.id}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                <OrganizationMemberDataTable organizationId={organization.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Sites */}
          <TabsContent id="sites" className="pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>ไซต์ขององค์กร (Organization Sites)</CardTitle>
                  <CardDescription>
                    จัดการรายชื่อไซต์ สำนักงานใหญ่ และสถานที่ตั้งขององค์กร
                  </CardDescription>
                </div>
                <CardAction>
                  <SiteAddAction organizationId={organization.id} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <SiteDataTable organizationId={organization.id} />
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
                  กำหนดว่าองค์กรนี้ได้รับสิทธิ์ในฟีเจอร์ใดบ้าง
                  และเปิดหรือปิดการใช้งานสำหรับองค์กรนี้
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationFeatureManager organizationId={organization.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: General Info Form */}
          <TabsContent id="general" className="pt-4">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>ข้อมูลทั่วไปขององค์กร</CardTitle>
                <CardDescription>
                  แก้ไขข้อมูลพื้นฐาน เช่น ชื่อองค์กร, Slug, Logo URL
                  และสถานะเปิด/ปิดใช้งาน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationEditForm organization={organization} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
