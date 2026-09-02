'use client';

import React from 'react';
import type { WorkShift } from '@repo/domains/entities';

export default function TodayShiftCard({
  shift,
  roleName,
}: {
  shift?: WorkShift | null;
  roleName?: string;
}) {
  if (!shift) {
    return (
      <div className="flex flex-col justify-between h-full p-6 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF] gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA]">
            กะการทำงานประจำวัน
          </span>
          <h3 className="text-sm font-semibold text-[#111111] pt-2">
            ยังไม่ได้กำหนดกะ
          </h3>
          <p className="text-xs text-[#787774] leading-relaxed">
            Role ({roleName || 'พนักงาน'})
            ยังไม่มีตารางกะการทำงานที่ผูกไว้ในระบบ
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#BBBAB8]">
          เวลามาตรฐาน: 09:00 - 18:00
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full p-6 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF] gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E1F3FE] text-[#1F6C9F] border border-[rgba(31,108,159,0.15)]">
            กะการทำงานของคุณ
          </span>
          {roleName && (
            <span className="text-[11px] font-mono text-[#787774]">
              {roleName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <div
            className="size-3 rounded-full shrink-0"
            style={{ backgroundColor: shift.color || '#3b82f6' }}
          />
          <h3 className="text-base font-bold text-[#111111]">{shift.name}</h3>
          {shift.isOvernight && (
            <span className="px-1.5 py-0.5 rounded bg-[#FBF3DB] text-[#956400] text-[10px] font-mono font-medium">
              ข้ามคืน
            </span>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between pt-2 border-t border-[#EAEAEA]">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-[#787774] uppercase">
            ช่วงเวลาปฏิบัติงาน
          </span>
          <div className="font-mono text-lg font-bold text-[#111111] tracking-tight">
            {shift.startTime} - {shift.endTime}
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#346538] font-medium bg-[#EDF3EC] px-2 py-0.5 rounded">
          Active Shift
        </span>
      </div>
    </div>
  );
}
