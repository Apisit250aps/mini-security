'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FormPageLayout from '@/shared/components/layouts/form-page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import RoleCreateForm from '../components/form/role-create-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@repo/ui/components/card';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

export default function RoleCreateView() {
  const router = useRouter();
  const { activeOrganizationId, isLoading: isOrgLoading } =
    useActiveOrganization();
  const { isSuperAdmin } = usePermission();
  const basePath = activeOrganizationId ? '/organization/role' : '/admin/role';
  const isPageLoading = isOrgLoading && !isSuperAdmin;

  return (
    <FormPageLayout
      title="เพิ่มบทบาทใหม่"
      description={
        activeOrganizationId
          ? 'กำหนดบทบาทและตำแหน่งพนักงานสำหรับองค์กรนี้ พร้อมระบุประเภทสิทธิ์เริ่มต้น'
          : 'สร้างบทบาทใหม่ในระบบ กำหนดระดับสิทธิ์และขอบเขตการใช้งาน'
      }
      backHref={basePath}
      isLoading={isPageLoading}
      maxWidth="3xl"
      sidebar={
        <div className="flex flex-col gap-4">
          <Card className="border-border/80 bg-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <CardTitle className="text-base">คำแนะนำประเภทบทบาท</CardTitle>
              </div>
              <CardDescription>
                การกำหนดประเภทส่งผลต่อสิทธิ์พื้นฐานในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 text-primary shrink-0" />
                <div>
                  <strong className="text-foreground">ADMIN:</strong>{' '}
                  เหมาะสำหรับผู้จัดการสาขาหรือหัวหน้างาน
                  สามารถดูและจัดการข้อมูลส่วนใหญ่ขององค์กรได้
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 text-primary shrink-0" />
                <div>
                  <strong className="text-foreground">MEMBER:</strong>{' '}
                  เหมาะสำหรับเจ้าหน้าที่ปฏิบัติการหรือรปภ.
                  มีสิทธิ์ลงเวลาและตรวจสอบตารางงานตนเอง
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 text-primary shrink-0" />
                <div>
                  <strong className="text-foreground">VIEWER:</strong>{' '}
                  มีสิทธิ์อ่านข้อมูลเท่านั้น ไม่สามารถแก้ไขหรือลบข้อมูลได้
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-muted/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">
                  การจัดการสิทธิ์เชิงลึก
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              หลังจากสร้างบทบาทเสร็จสิ้น
              คุณสามารถกำหนดสิทธิ์อย่างละเอียดระดับโมดูล (Granular Permissions)
              และมอบหมายฟีเจอร์ที่หน้าจัดการบทบาทได้ทันที
            </CardContent>
          </Card>
        </div>
      }
    >
      <Card>
        <CardContent className="p-6">
          <RoleCreateForm
            organizationId={activeOrganizationId || undefined}
            onSuccess={() => router.push(basePath)}
          />
        </CardContent>
      </Card>
    </FormPageLayout>
  );
}
