'use client';

import React from 'react';
import OrganizationFeatureGuard from '@/shared/components/guards/organization-feature-guard';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationFeatureGuard
      featureCode="ORGANIZATION_MANAGEMENT"
      fallbackTitle="โมดูลการตั้งค่าองค์กรยังไม่เปิดใช้งาน"
      fallbackDescription="องค์กรของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Organization Management จากผู้ดูแลระบบ"
    >
      {children}
    </OrganizationFeatureGuard>
  );
}
