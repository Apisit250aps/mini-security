'use client';

import React from 'react';
import { useActiveCompany } from '../hooks/use-active-company';
import CompanyEditForm from '@/modules/company/components/form/company-edit-form';
import CompanyBranchDataTable from '@/modules/company/components/branches/company-branch-data-table';
import CompanyBranchAddAction from '@/modules/company/components/branches/company-branch-add-action';
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
import { Building2, GitBranch } from 'lucide-react';

export default function CompanySettingsView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();

  return (
    <PageLayout pageId="companySettings" isLoading={isLoading}>
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Building2 className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบข้อมูลบริษัท</h2>
        </div>
      ) : (
        <Tabs defaultSelectedKey="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
            <TabsTrigger id="profile" className="gap-2">
              <Building2 className="size-4" />
              ข้อมูลทั่วไป
            </TabsTrigger>
            <TabsTrigger id="branches" className="gap-2">
              <GitBranch className="size-4" />
              จัดการสาขา
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile */}
          <TabsContent id="profile">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>ข้อมูลทั่วไป (Company Profile)</CardTitle>
                <CardDescription>
                  ข้อมูลนี้จะถูกนำไปใช้ในระบบเอกสารและพื้นที่ทำงานของพนักงานทุกคน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyEditForm company={activeCompany} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Branches */}
          <TabsContent id="branches">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>สาขาขององค์กร (Company Branches)</CardTitle>
                  <CardDescription>
                    จัดการรายชื่อสาขา สำนักงานใหญ่ และสถานที่ตั้งขององค์กร{' '}
                    {activeCompany.name}
                  </CardDescription>
                </div>
                <CardAction>
                  <CompanyBranchAddAction companyId={activeCompanyId} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <CompanyBranchDataTable companyId={activeCompanyId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
