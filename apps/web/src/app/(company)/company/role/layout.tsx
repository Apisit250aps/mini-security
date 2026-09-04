'use client';

import React from 'react';
import CompanyFeatureGuard from '@/shared/components/guards/company-feature-guard';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyFeatureGuard
      featureCode="ROLE_PERMISSION_MANAGEMENT"
      fallbackTitle="โมดูลจัดการบทบาทและสิทธิ์ยังไม่เปิดใช้งาน"
      fallbackDescription="บริษัทของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Role & Permission Management จากผู้ดูแลระบบ"
    >
      {children}
    </CompanyFeatureGuard>
  );
}
