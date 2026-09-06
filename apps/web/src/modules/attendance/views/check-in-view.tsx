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
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{activeCompany.name}</CardTitle>
            <CardDescription>
              ลงชื่อหลังเวลาสิ้นสุดรอบจะถือว่ามาสาย
              ระบบยืนยันสถานะจากเวลาที่บันทึก
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeCompany.isActive ? (
              <CheckInForm key={activeCompanyId} companyId={activeCompanyId} />
            ) : (
              <p>บริษัทนี้ปิดใช้งานอยู่ กรุณาติดต่อผู้ดูแลระบบ</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <p>ยังไม่มีบริษัทที่คุณสามารถลงเวลาได้ กรุณาติดต่อผู้ดูแลระบบ</p>
      )}
    </PageLayout>
  );
}
