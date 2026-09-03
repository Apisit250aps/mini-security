'use client';

import React, { useMemo } from 'react';
import type {
  AttendanceCheckpoint,
  AttendanceLog,
  AttendanceRecord,
  CompanyMember,
  WorkShift,
} from '@repo/domains/entities';
import type { GPSState } from './gps-status-badge';
import {
  useAttendanceRecordCreate,
  useAttendanceLogCreate,
} from '../../hooks/attendance-mutations';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage } from '@/shared/utils';

export default function CheckinActionCard({
  companyId,
  currentMember,
  currentShift,
  checkpoints = [],
  todayRecord,
  logs = [],
  gpsState,
  onCheckinSuccess,
}: {
  companyId: string;
  currentMember: CompanyMember;
  currentShift?: WorkShift | null;
  checkpoints?: AttendanceCheckpoint[];
  todayRecord?: AttendanceRecord | null;
  logs?: AttendanceLog[];
  gpsState: GPSState;
  onCheckinSuccess?: () => void;
}) {
  const createRecordMutation = useAttendanceRecordCreate(companyId);
  const createLogMutation = useAttendanceLogCreate(todayRecord?.id || '');

  const isSubmitting =
    createRecordMutation.isPending || createLogMutation.isPending;

  const sortedCheckpoints = useMemo(
    () => [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex),
    [checkpoints],
  );

  const loggedCheckpointIds = useMemo(
    () => new Set(logs.map((l) => l.checkpointId)),
    [logs],
  );

  const nextCheckpoint = useMemo(
    () => sortedCheckpoints.find((cp) => !loggedCheckpointIds.has(cp.id)),
    [sortedCheckpoints, loggedCheckpointIds],
  );

  const isAllCompleted =
    sortedCheckpoints.length > 0 &&
    loggedCheckpointIds.size >= sortedCheckpoints.length;

  const performCheckin = async () => {
    if (!nextCheckpoint) return;

    let recordId = todayRecord?.id;

    // If no record exists for today, create one first
    if (!recordId) {
      const newRecordRes = await createRecordMutation.mutateAsync({
        companyId,
        companyMemberId: currentMember.id,
        workShiftId: currentShift?.id || '00000000-0000-0000-0000-000000000000',
        workDate: new Date(),
        status: 'APPROVED',
        totalWorkMinutes: 480,
        overtimeMinutes: 0,
        lateMinutes: 0,
        note: 'Auto created via Check-in portal',
      });
      recordId =
        (newRecordRes as { data?: { data?: { id?: string }; id?: string } })
          ?.data?.data?.id ||
        (newRecordRes as { data?: { id?: string } })?.data?.id;
    }

    if (!recordId) {
      throw new Error(
        'ไม่สามารถสร้างหรือค้นหา Attendance Record สำหรับวันนี้ได้',
      );
    }

    await createLogMutation.mutateAsync({
      attendanceRecordId: recordId,
      checkpointId: nextCheckpoint.id,
      checkType: nextCheckpoint.checkType,
      checkedAt: new Date(),
      locationId: gpsState.nearestLocation?.id || null,
      latitude: gpsState.latitude !== null ? Number(gpsState.latitude) : null,
      longitude:
        gpsState.longitude !== null ? Number(gpsState.longitude) : null,
      accuracyMeters: gpsState.accuracy ? Number(gpsState.accuracy) : null,
      isLocationValid: gpsState.isWithinRadius,
      photoUrl: null,
      photoVerified: false,
      deviceId: null,
      ipAddress: null,
      isManual: !gpsState.isWithinRadius,
      manualReason: !gpsState.isWithinRadius ? 'ลงเวลานอกรัศมีที่กำหนด' : null,
    });

    toast.success(`ลงเวลา "${nextCheckpoint.label}" สำเร็จ`);
    onCheckinSuccess?.();
  };

  const handleAction = () => {
    if (!nextCheckpoint) {
      toast.info('คุณได้ทำการลงเวลาครบทุกจุดสำหรับวันนี้แล้ว');
      return;
    }

    if (nextCheckpoint.requireLocation && !gpsState.isWithinRadius) {
      const confirmOutside = window.confirm(
        'คุณอยู่นอกพื้นที่ที่กำหนด คุณต้องการบันทึกการลงเวลาแบบแจ้งเตือนพิกัดหรือไม่?',
      );
      if (!confirmOutside) return;
    }

    performCheckin().catch((err: unknown) => {
      toast.error(getErrorMessage(err, 'เกิดข้อผิดพลาดในการลงเวลา'));
    });
  };

  const getButtonText = () => {
    if (isSubmitting) return 'กำลังบันทึกเวลา...';
    if (isAllCompleted) return 'ลงเวลาครบทุกจุดสำหรับวันนี้แล้ว';
    if (!nextCheckpoint) return 'พร้อมลงเวลา';
    switch (nextCheckpoint.checkType) {
      case 'CHECK_IN':
        return `ลงเวลาเข้างาน · ${nextCheckpoint.label}`;
      case 'CHECK_OUT':
        return `ลงเวลาออกงาน · ${nextCheckpoint.label}`;
      case 'BREAK_IN':
        return `ลงเวลาพักเบรก · ${nextCheckpoint.label}`;
      case 'BREAK_OUT':
        return `ลงเวลากลับเข้างาน · ${nextCheckpoint.label}`;
      default:
        return `เช็คชื่อ · ${nextCheckpoint.label}`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <button
        type="button"
        onClick={handleAction}
        disabled={isSubmitting || isAllCompleted}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 select-none shadow-none ${
          isAllCompleted
            ? 'bg-[#EDF3EC] text-[#346538] border border-[rgba(52,101,56,0.2)] cursor-default'
            : isSubmitting
              ? 'bg-[#F4F4F3] text-[#8F8E8B] border border-[#E5E5E3] cursor-not-allowed'
              : gpsState.isWithinRadius || !nextCheckpoint?.requireLocation
                ? 'bg-[#1C1C1A] text-white hover:bg-[#2C2C2A] active:scale-[0.99] cursor-pointer'
                : 'bg-[#B05B28] text-white hover:bg-[#964D20] active:scale-[0.99] cursor-pointer'
        }`}
      >
        {isSubmitting && (
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        <span>{getButtonText()}</span>
      </button>

      {/* Auxiliary Warning note */}
      {nextCheckpoint &&
        nextCheckpoint.requireLocation &&
        !gpsState.isWithinRadius && (
          <p className="text-[12px] text-[#B05B28] text-center max-w-xs font-normal">
            ขณะนี้คุณอยู่นอกรัศมีสถานที่ลงเวลา ระบบจะบันทึกเป็น{' '}
            <span className="font-semibold">ลงเวลานอกพื้นที่</span>
          </p>
        )}
    </div>
  );
}
