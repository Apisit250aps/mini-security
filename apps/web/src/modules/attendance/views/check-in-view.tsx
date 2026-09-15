'use client';

import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@repo/ui/components/card';
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@repo/ui/components/empty';
import { Building2, CalendarCheck, ShieldAlert } from 'lucide-react';
import CheckInForm from '../components/logs/check-in-form';

export default function CheckInView() {
  const { activeCompany, activeCompanyId, isLoading } = useActiveCompany();
  return (
    <PageLayout
      title="ลงเวลาเข้างาน"
      description="เลือกรอบและบันทึกเวลาเข้างานประจำวัน"
      isLoading={isLoading}
    >
      {activeCompany ? (
        <Card className="max-w-2xl border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarCheck className="size-5" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-xl">{activeCompany.name}</CardTitle>
                <CardDescription className="text-xs">
                  ลงชื่อหลังเวลาสิ้นสุดรอบจะถือว่ามาสาย ระบบยืนยันสถานะจากเวลาที่บันทึก
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeCompany.isActive ? (
              <CheckInForm key={activeCompanyId} companyId={activeCompanyId} />
            ) : (
              <Empty className="py-8">
                <EmptyMedia variant="icon">
                  <ShieldAlert className="size-6 text-destructive" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>บริษัทนี้ปิดใช้งานอยู่</EmptyTitle>
                  <EmptyDescription>
                    บริษัทของคุณถูกระงับหรือปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอเปิดใช้งาน
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl border shadow-sm">
          <CardContent className="py-8">
            <Empty className="border-0">
              <EmptyMedia variant="icon">
                <Building2 className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>ยังไม่มีบริษัทที่คุณสามารถลงเวลาได้</EmptyTitle>
                <EmptyDescription>
                  คุณยังไม่ได้เป็นสมาชิกของบริษัทใด หรือยังไม่มีสิทธิ์ในการลงเวลา กรุณาติดต่อผู้ดูแลระบบ
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

