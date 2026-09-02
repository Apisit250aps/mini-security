'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import {
  useAttendanceCheckpointsQueries,
  useAttendanceLocationsQueries,
  useAttendanceLogsQueries,
  useCurrentRoleWorkScheduleQueries,
  useMemberAttendanceRecordByDateQueries,
  useRoleAttendancePoliciesQueries,
  useWorkShiftDetailQueries,
} from '../../hooks/attendance-queries';
import RealtimeClock from './realtime-clock';
import GPSStatusBadge, { type GPSState } from './gps-status-badge';
import CheckinActionCard from './checkin-action-card';
import CheckpointTimeline from './checkpoint-timeline';
import TodayShiftCard from './today-shift-card';
import UnauthenticatedCheckinCard from './unauthenticated-checkin-card';
import { buildPageUrl } from '@/shared/utils';
import { useQueryClient } from '@tanstack/react-query';
import { attendanceKeys } from '@/shared/utils';

export default function CheckinDashboard() {
  const queryClient = useQueryClient();
  const { data: sessionData, status, signOut } = useSession();
  const {
    activeCompany,
    activeCompanyId,
    isLoading: isCompanyLoading,
  } = useActiveCompany();

  const [gpsState, setGpsState] = useState<GPSState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    nearestLocation: null,
    distanceMeters: null,
    isWithinRadius: false,
    isLoading: true,
    error: null,
  });

  const userId = sessionData?.user?.id || '';
  const userName = sessionData?.user?.name || 'พนักงาน';
  const userEmail = sessionData?.user?.email || '';

  // 1. Fetch Company Members
  const { data: members = [], isLoading: isMembersLoading } =
    useCompanyMembersQueries(activeCompanyId);

  const currentMember = useMemo(
    () => members.find((m) => m.userId === userId) || null,
    [members, userId],
  );

  // 2. Fetch Roles
  const { data: roles = [] } = useCompanyRolesQueries(activeCompanyId);
  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentMember?.roleId) || null,
    [roles, currentMember?.roleId],
  );

  // 3. Fetch Role Work Schedule & Shift
  const { data: currentRoleSchedule } = useCurrentRoleWorkScheduleQueries(
    currentMember?.roleId || '',
  );
  const { data: currentShift } = useWorkShiftDetailQueries(
    currentRoleSchedule?.workShiftId || '',
  );

  // 4. Fetch Role Attendance Policy & Checkpoints
  const { data: rolePolicies = [] } = useRoleAttendancePoliciesQueries(
    currentMember?.roleId || '',
  );
  const activePolicyId = rolePolicies[0]?.policyId || '';
  const { data: checkpoints = [] } =
    useAttendanceCheckpointsQueries(activePolicyId);

  // 5. Fetch Allowed GPS Locations
  const { data: locations = [] } =
    useAttendanceLocationsQueries(activeCompanyId);

  // 6. Fetch Today's Attendance Record & Logs
  const todayStr = useMemo(
    () => new Date().toISOString().split('T')[0] || '',
    [],
  );
  const { data: todayRecord } = useMemberAttendanceRecordByDateQueries(
    currentMember?.id || '',
    todayStr,
  );
  const { data: logs = [] } = useAttendanceLogsQueries(todayRecord?.id || '');

  const handleCheckinSuccess = () => {
    if (currentMember?.id) {
      queryClient.invalidateQueries({
        queryKey: ['ATTENDANCE', 'RECORD_BY_DATE', currentMember.id, todayStr],
      });
    }
    if (todayRecord?.id) {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.recordLogs(todayRecord.id),
      });
    }
  };

  const isInitialLoading =
    status === 'loading' ||
    (status === 'authenticated' && (isCompanyLoading || isMembersLoading));

  return (
    <main className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FBFBFA]">
      {/* Ambient background blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0,0,0,0.02) 0%, transparent 70%)',
        }}
      />

      {/* Top Bar Navigation */}
      <header className="relative z-10 w-full border-b border-[#EAEAEA] bg-[#FFFFFF]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-base sm:text-lg font-bold tracking-tight text-[#111111] no-underline font-serif"
            >
              Mini Security
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA] uppercase">
              Check-In Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-[#111111]">
                    {userName}
                  </span>
                  <span className="text-[11px] font-mono text-[#787774]">
                    {activeCompany?.name || 'องค์กร'} ·{' '}
                    {currentRole?.name || 'พนักงาน'}
                  </span>
                </div>
                <Link
                  href={buildPageUrl('companyDashboard')}
                  className="py-1.5 px-3 rounded-md border border-[#EAEAEA] bg-[#FFFFFF] text-[#111111] text-xs font-medium hover:bg-[#F9F9F8] transition-colors"
                >
                  แดชบอร์ด
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="py-1.5 px-2 text-xs text-[#787774] hover:text-[#9F2F2D] transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={buildPageUrl('signIn')}
                  className="py-1.5 px-3.5 rounded-md bg-[#111111] text-[#FFFFFF] text-xs font-medium hover:bg-[#2F3437] transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="size-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#787774]">
              กำลังเตรียมระบบลงเวลา...
            </span>
          </div>
        ) : status !== 'authenticated' ? (
          <UnauthenticatedCheckinCard />
        ) : (
          <div className="space-y-6">
            {/* Top Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] font-serif">
                  ระบบลงเวลาทำงาน
                </h1>
                <p className="text-xs text-[#787774] pt-0.5">
                  สังกัด: {activeCompany?.name || '-'} · บทบาท:{' '}
                  {currentRole?.name || 'Member'}
                </p>
              </div>

              <GPSStatusBadge locations={locations} onGPSUpdate={setGpsState} />
            </div>

            {/* Bento Grid Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Primary Action & Realtime Clock (7 Cols) */}
              <div className="md:col-span-7 flex flex-col gap-6">
                {/* Main Check-In Bento Box */}
                <div className="flex flex-col items-center justify-between p-6 sm:p-8 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF] shadow-none gap-8">
                  <RealtimeClock />

                  {currentMember ? (
                    <CheckinActionCard
                      companyId={activeCompanyId}
                      currentMember={currentMember}
                      currentShift={currentShift}
                      checkpoints={checkpoints}
                      todayRecord={todayRecord}
                      logs={logs}
                      gpsState={gpsState}
                      onCheckinSuccess={handleCheckinSuccess}
                    />
                  ) : (
                    <div className="p-4 rounded-lg bg-[#FBF3DB] text-[#956400] text-xs font-mono text-center w-full">
                      คุณยังไม่ได้ถูกเพิ่มเป็นสมาชิกในบริษัท{' '}
                      {activeCompany?.name || 'นี้'} กรุณาติดต่อผู้ดูแลระบบ
                    </div>
                  )}
                </div>

                {/* Quick Actions Strip */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={buildPageUrl('companyAttendanceLeave')}
                    className="flex flex-col p-4 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF] transition-all hover:bg-[#F9F9F8] no-underline group"
                  >
                    <span className="text-[10px] font-mono uppercase text-[#787774]">
                      คำขอลาหยุด
                    </span>
                    <span className="text-sm font-semibold text-[#111111] group-hover:text-primary pt-1">
                      ยื่นใบลา (Leave Request) →
                    </span>
                  </Link>

                  <Link
                    href={buildPageUrl('companyAttendance')}
                    className="flex flex-col p-4 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF] transition-all hover:bg-[#F9F9F8] no-underline group"
                  >
                    <span className="text-[10px] font-mono uppercase text-[#787774]">
                      ประวัติการลงเวลา
                    </span>
                    <span className="text-sm font-semibold text-[#111111] group-hover:text-primary pt-1">
                      ดูบันทึกเวลาย้อนหลัง →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Shift Info & Timeline (5 Cols) */}
              <div className="md:col-span-5 flex flex-col gap-6">
                <TodayShiftCard
                  shift={currentShift}
                  roleName={currentRole?.name}
                />

                <div className="p-6 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF]">
                  <CheckpointTimeline checkpoints={checkpoints} logs={logs} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#EAEAEA] bg-[#FFFFFF] px-6 py-6 text-center text-xs text-[#BBBAB8] font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Mini Security · Clean Architecture</span>
          <span>{new Date().getFullYear()} · Attendance Check-In Portal</span>
        </div>
      </footer>
    </main>
  );
}
