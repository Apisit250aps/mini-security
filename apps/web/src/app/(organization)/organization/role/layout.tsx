'use client';

import React from 'react';
import OrganizationFeatureGuard from '@/shared/components/guards/organization-feature-guard';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationFeatureGuard
      featureCode="ROLE_PERMISSION_MANAGEMENT"
      fallbackTitle="โมดูลจัดการบทบาทและสิทธิ์ยังไม่เปิดใช้งาน"
      fallbackDescription="องค์กรของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Role & Permission Management จากผู้ดูแลระบบ"
    >
      {children}
    </OrganizationFeatureGuard>
  );
}
