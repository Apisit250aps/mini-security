'use client';

import React from 'react';
import CompanyFeatureGuard from '@/shared/components/guards/company-feature-guard';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyFeatureGuard
      featureCode="COMPANY_MANAGEMENT"
      fallbackTitle="โมดูลการตั้งค่าบริษัทยังไม่เปิดใช้งาน"
      fallbackDescription="บริษัทของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Company Management จากผู้ดูแลระบบ"
    >
      {children}
    </CompanyFeatureGuard>
  );
}
