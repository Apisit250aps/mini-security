'use client';

import React, { useMemo } from 'react';
import UserDataTable from '../components/table/user-data-table';
import PageLayout from '@/shared/components/layouts/page-layout';
import UserCreateAction from '../components/user-create-action';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';
import { Users, UserCheck, MailCheck, ShieldCheck } from 'lucide-react';
import { useUserListQueries } from '../hooks/user-queries';

export default function UserListView() {
  const usersQuery = useUserListQueries();
  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);

  const activeCount = useMemo(
    () => users.filter((u) => u.isActive).length,
    [users],
  );
  const verifiedCount = useMemo(
    () => users.filter((u) => u.emailVerified).length,
    [users],
  );
  const adminCount = useMemo(
    () => users.filter((u) => u.isAdmin).length,
    [users],
  );

  return (
    <PageLayout pageId="user" actions={<UserCreateAction />}>
      <div className="flex flex-col gap-6">
        <DashboardStatsGrid columns={4}>
          <MetricCard
            title="ผู้ใช้ทั้งหมด"
            value={`${users.length} บัญชี`}
            icon={Users}
            description="บัญชีผู้ใช้งานทั้งหมดในระบบ"
          />
          <MetricCard
            title="เปิดใช้งาน (Active)"
            value={`${activeCount} บัญชี`}
            icon={UserCheck}
            trend={{
              value: `${activeCount}`,
              isPositive: true,
              label: 'สถานะปกติ',
            }}
            description="ผู้ใช้ที่สามารถเข้าสู่ระบบได้"
          />
          <MetricCard
            title="ยืนยันอีเมลแล้ว"
            value={`${verifiedCount} บัญชี`}
            icon={MailCheck}
            description="บัญชีที่ผ่านการตรวจสอบอีเมล"
          />
          <MetricCard
            title="ผู้ดูแลระบบ (Admin)"
            value={`${adminCount} บัญชี`}
            icon={ShieldCheck}
            description="บัญชีที่มีสิทธิ์ระดับผู้ดูแลระบบ"
          />
        </DashboardStatsGrid>

        <UserDataTable />
      </div>
    </PageLayout>
  );
}

