'use client';

import React from 'react';
import { useActiveOrganization } from '../hooks/use-active-organization';
import OrganizationEditForm from '@/modules/organization/components/form/organization-edit-form';
import SiteDataTable from '@/modules/organization/components/sites/site-data-table';
import SiteAddAction from '@/modules/organization/components/sites/site-add-action';
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
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@repo/ui/components/empty';
import { Building2, MapPin } from 'lucide-react';

export default function OrganizationSettingsView() {
  const { activeOrganization, activeOrganizationId, isLoading } =
    useActiveOrganization();

  return (
    <PageLayout pageId="organizationSettings" isLoading={isLoading}>
      {!activeOrganization ? (
        <Empty className="py-16 border rounded-xl bg-card">
          <EmptyMedia variant="icon">
            <Building2 className="size-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>ไม่พบข้อมูลองค์กร</EmptyTitle>
            <EmptyDescription>
              กรุณาเลือกหรือสร้างองค์กรก่อนเข้าสู่การตั้งค่าองค์กร
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Tabs defaultSelectedKey="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
            <TabsTrigger id="profile" className="gap-2">
              <Building2 className="size-4" />
              ข้อมูลทั่วไป
            </TabsTrigger>
            <TabsTrigger id="sites" className="gap-2">
              <MapPin className="size-4" />
              จัดการไซต์
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile */}
          <TabsContent id="profile">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>ข้อมูลทั่วไป (Organization Profile)</CardTitle>
                <CardDescription>
                  ข้อมูลนี้จะถูกนำไปใช้ในระบบเอกสารและพื้นที่ทำงานของพนักงานทุกคน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationEditForm organization={activeOrganization} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Sites */}
          <TabsContent id="sites">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>ไซต์ขององค์กร (Organization Sites)</CardTitle>
                  <CardDescription>
                    จัดการรายชื่อไซต์ สำนักงานใหญ่ และสถานที่ตั้งขององค์กร{' '}
                    {activeOrganization.name}
                  </CardDescription>
                </div>
                <CardAction>
                  <SiteAddAction organizationId={activeOrganizationId} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <SiteDataTable organizationId={activeOrganizationId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
