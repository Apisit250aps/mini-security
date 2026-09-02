'use client';

import React from 'react';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import PageLayout from '@/shared/components/layouts/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { useAttendancePoliciesQueries } from '../hooks/attendance-queries';
import PolicyCard from '../components/policies/policy-card';
import PolicyCreateAction from '../components/policies/policy-create-action';
import RolePolicyAction from '../components/policies/role-policy-action';
import LocationTable from '../components/policies/location-table';
import LocationCreateAction from '../components/policies/location-create-action';
import { MapPin, ShieldAlert } from 'lucide-react';

export default function AttendancePoliciesView() {
  const {
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const { data: policies = [], isLoading: isPoliciesLoading } =
    useAttendancePoliciesQueries(activeCompanyId);

  const isLoading = isCompanyLoading || isPoliciesLoading;

  return (
    <PageLayout
      pageId="companyAttendancePolicies"
      isLoading={isLoading}
      actions={
        activeCompany && (
          <div className="flex items-center gap-2">
            <RolePolicyAction companyId={activeCompanyId} />
            <LocationCreateAction companyId={activeCompanyId} />
            <PolicyCreateAction companyId={activeCompanyId} />
          </div>
        )
      }
    >
      {!activeCompany ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <ShieldAlert className="size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">ไม่พบบริษัทที่สังกัด</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            กรุณาเลือกหรือสร้างบริษัทก่อนดำเนินการจัดการนโยบายการลงเวลา
          </p>
        </div>
      ) : (
        <Tabs defaultSelectedKey="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger id="policies">นโยบาย & จุดเช็คชื่อ</TabsTrigger>
            <TabsTrigger id="locations">สถานที่ & พิกัด GPS</TabsTrigger>
          </TabsList>

          <TabsContent id="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  นโยบายและจุดเช็คชื่อ (Attendance Policies & Checkpoints)
                </CardTitle>
                <CardDescription>
                  กำหนดเงื่อนไขการเช็คชื่อตามประเภท (เข้างาน, ออกงาน, เบรก)
                  เงื่อนไขเวลา และการบังคับ GPS/ถ่ายภาพ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policies.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    ยังไม่มีนโยบายการลงเวลา กดปุ่ม &quot;สร้างนโยบายใหม่&quot;
                    เพื่อเริ่มต้น
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        companyId={activeCompanyId}
                        policy={policy}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent id="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-primary" />
                  <div>
                    <CardTitle>สถานที่ลงเวลาและรัศมี GPS</CardTitle>
                    <CardDescription>
                      รายการสถานที่และขอบเขตพื้นที่ที่อนุญาตให้พนักงานลงเวลาทำงาน
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LocationTable companyId={activeCompanyId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
