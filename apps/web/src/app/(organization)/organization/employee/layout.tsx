'use client';

import React from 'react';
import OrganizationFeatureGuard from '@/shared/components/guards/organization-feature-guard';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationFeatureGuard
      featureCode="EMPLOYEE_MANAGEMENT"
      fallbackTitle="โมดูลจัดการพนักงานยังไม่เปิดใช้งาน"
      fallbackDescription="องค์กรของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Employee Directory จากผู้ดูแลระบบ"
    >
      {children}
    </OrganizationFeatureGuard>
  );
}
