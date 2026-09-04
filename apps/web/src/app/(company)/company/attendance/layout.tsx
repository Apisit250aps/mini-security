'use client';

import React from 'react';
import CompanyFeatureGuard from '@/shared/components/guards/company-feature-guard';

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyFeatureGuard
      featureCode="ATTENDANCE_MANAGEMENT"
      fallbackTitle="โมดูลบันทึกเวลาทำงานยังไม่เปิดใช้งาน"
      fallbackDescription="บริษัทของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Attendance Management จากผู้ดูแลระบบ"
    >
      {children}
    </CompanyFeatureGuard>
  );
}
