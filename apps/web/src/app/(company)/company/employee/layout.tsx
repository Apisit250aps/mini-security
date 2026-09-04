'use client';

import React from 'react';
import CompanyFeatureGuard from '@/shared/components/guards/company-feature-guard';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyFeatureGuard
      featureCode="EMPLOYEE_MANAGEMENT"
      fallbackTitle="โมดูลจัดการพนักงานยังไม่เปิดใช้งาน"
      fallbackDescription="บริษัทของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Employee Directory จากผู้ดูแลระบบ"
    >
      {children}
    </CompanyFeatureGuard>
  );
}
