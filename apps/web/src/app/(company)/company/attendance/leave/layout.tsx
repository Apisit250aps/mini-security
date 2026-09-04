'use client';

import React from 'react';
import CompanyFeatureGuard from '@/shared/components/guards/company-feature-guard';

export default function LeaveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyFeatureGuard
      featureCode="LEAVE_MANAGEMENT"
      fallbackTitle="โมดูลการลาและวันหยุดยังไม่เปิดใช้งาน"
      fallbackDescription="บริษัทของคุณยังไม่ได้รับสิทธิ์หรือถูกปิดการใช้งานฟีเจอร์ Leave Management จากผู้ดูแลระบบ"
    >
      {children}
    </CompanyFeatureGuard>
  );
}
