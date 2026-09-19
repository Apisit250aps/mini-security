'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DetailPageLayout from '@/shared/components/layouts/detail-page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import {
  useRoleDetailQueries,
  useRolePermissionsQueries,
} from '../hooks/role-queries';
import { useRoleFeaturesQueries } from '@/modules/feature/hooks/feature-queries';
import RoleEditForm from '../components/form/role-edit-form';
import RolePermissionManager from '../components/permission-manager/role-permission-manager';
import RoleFeatureManager from '../components/feature-delegation/role-feature-manager';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@repo/ui/components/tabs';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import EmptyState from '@/shared/components/app/empty-state';
import MetricStatCard from '@/shared/components/app/metric-stat-card';
import { Button } from '@repo/ui/components/button';
import { Shield, KeyRound, Layers, Info } from 'lucide-react';

interface RoleDetailViewProps {
  roleId: string;
}

export default function RoleDetailView({ roleId }: RoleDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const { activeCompanyId } = useActiveCompany();
  const { isSuperAdmin } = usePermission();
  const basePath = activeCompanyId ? '/company/role' : '/admin/role';

  const roleQuery = useRoleDetailQueries(roleId);
  const permissionsQuery = useRolePermissionsQueries(roleId);
  const roleFeaturesQuery = useRoleFeaturesQueries(roleId);

  const role = roleQuery.data;
  const isReadOnly = Boolean(role?.isSystemDefault && !isSuperAdmin);

  const permissionsCount = useMemo(
    () => permissionsQuery.data?.length ?? 0,
    [permissionsQuery.data],
  );

  const featuresCount = useMemo(
    () => roleFeaturesQuery.data?.length ?? 0,
    [roleFeaturesQuery.data],
  );

  if (roleQuery.isLoading) {
    return (
      <DetailPageLayout
        title="กำลังโหลดข้อมูลบทบาท..."
        backHref={basePath}
        isLoading
      >
        <div />
      </DetailPageLayout>
    );
  }

  if (!role) {
    return (
      <DetailPageLayout title="ไม่พบบทบาท" backHref={basePath}>
        <EmptyState
          icon={Shield}
          title="ไม่พบบทบาทที่ระบุ"
          description="บทบาทนี้อาจถูกลบหรือไม่มีสิทธิ์เข้าถึง"
          action={
            <Button onPress={() => router.push(basePath)}>
              กลับสู่หน้ารายการบทบาท
            </Button>
          }
        />
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout
      title={role.name}
      description={
        role.description ||
        'จัดการรายละเอียดบทบาท สิทธิ์การเข้าถึงระดับโมดูล และฟีเจอร์ที่มอบหมาย'
      }
      backHref={basePath}
      backLabel="กลับสู่หน้ารายชื่อบทบาท"
      badges={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{role.roleType}</Badge>
          {role.isSystemDefault ? (
            <Badge variant="secondary">บทบาทมาตรฐานระบบ (System Default)</Badge>
          ) : (
            <Badge variant="outline">บทบาทเฉพาะองค์กร (Custom Role)</Badge>
          )}
          {isReadOnly && (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-300"
            >
              อ่านอย่างเดียว (Read Only)
            </Badge>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricStatCard
            title="ประเภทบทบาท (Role Type)"
            value={role.roleType}
            icon={Shield}
            description={
              role.isSystemDefault ? 'กำหนดโดยระบบกลาง' : 'กำหนดโดยองค์กร'
            }
          />
          <MetricStatCard
            title="สิทธิ์การใช้งานที่ได้รับ"
            value={`${permissionsCount} สิทธิ์`}
            icon={KeyRound}
            description="สิทธิ์การเข้าถึงข้อมูลและการดำเนินการ"
          />
          <MetricStatCard
            title="ฟีเจอร์ที่ดูแล"
            value={`${featuresCount} ฟีเจอร์`}
            icon={Layers}
            description="โมดูลการทำงานที่มอบหมายให้บทบาทนี้"
          />
        </div>

        {/* Tab Navigation */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-xl mb-4">
            <TabsTrigger id="general" className="gap-2">
              <Info className="size-4" />
              ข้อมูลทั่วไป
            </TabsTrigger>
            <TabsTrigger id="permissions" className="gap-2">
              <KeyRound className="size-4" />
              สิทธิ์การเข้าถึง ({permissionsCount})
            </TabsTrigger>
            <TabsTrigger id="features" className="gap-2">
              <Layers className="size-4" />
              ฟีเจอร์ที่ดูแล ({featuresCount})
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: General Info */}
          <TabsContent id="general" className="mt-2">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-base font-semibold text-foreground">
                      แก้ไขข้อมูลบทบาท
                    </h3>
                    <RoleEditForm
                      role={role}
                      readOnly={isReadOnly}
                      onSuccess={() => roleQuery.refetch()}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-4 lg:col-span-1">
                <Card className="border-border/80 bg-muted/20">
                  <CardContent className="flex flex-col gap-3 p-5 text-sm">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Info className="size-4 text-muted-foreground" />
                      ข้อมูลบทบาท
                    </div>
                    <div className="flex flex-col gap-1 border-t border-border/50 pt-2 text-xs">
                      <span className="text-muted-foreground">
                        รหัสอ้างอิงบทบาท:
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        #{role.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-muted-foreground">สถานะ:</span>
                      <span className="font-medium text-foreground">
                        {role.isSystemDefault
                          ? 'บทบาทระบบ (ล็อกการแก้ไขสิทธิ์หลัก)'
                          : 'บทบาทกำหนดเอง'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Granular Permissions Matrix */}
          <TabsContent id="permissions" className="mt-2">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    กำหนดสิทธิ์การเข้าถึงระดับโมดูล (Granular Permissions)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    เลือกสิทธิ์การอ่าน บันทึก แก้ไข
                    หรือลบข้อมูลในแต่ละฟังก์ชันของระบบสำหรับบทบาทนี้
                  </p>
                </div>
                <RolePermissionManager role={role} readOnly={isReadOnly} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Feature Delegation */}
          <TabsContent id="features" className="mt-2">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    การมอบหมายฟีเจอร์ (Feature Delegation)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    เลือกฟีเจอร์ขององค์กรที่ต้องการให้บทบาทนี้สามารถมองเห็นและเข้าถึงเมนูได้
                  </p>
                </div>
                <RoleFeatureManager
                  role={role}
                  companyId={role.companyId || activeCompanyId || ''}
                  readOnly={!activeCompanyId && !isSuperAdmin}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DetailPageLayout>
  );
}
