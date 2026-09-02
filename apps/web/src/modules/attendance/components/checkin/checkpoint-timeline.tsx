'use client';

import React from 'react';
import type {
  AttendanceCheckpoint,
  AttendanceLog,
} from '@repo/domains/entities';

export default function CheckpointTimeline({
  checkpoints = [],
  logs = [],
}: {
  checkpoints?: AttendanceCheckpoint[];
  logs?: AttendanceLog[];
}) {
  const sortedCheckpoints = [...checkpoints].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  const logsByCheckpoint = new Map<string, AttendanceLog>();
  for (const log of logs) {
    logsByCheckpoint.set(log.checkpointId, log);
  }

  if (sortedCheckpoints.length === 0) {
    return (
      <div className="rounded-lg border border-[#EAEAEA] p-4 text-center text-xs text-[#787774] font-mono">
        ยังไม่มีจุดเช็คชื่อที่กำหนดในนโยบายสำหรับ Role นี้
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-[#EAEAEA]">
        <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
          ลำดับจุดเช็คชื่อประจำวัน ({logs.length}/{sortedCheckpoints.length})
        </h4>
        <span className="text-[11px] font-mono text-[#787774]">
          {logs.length === sortedCheckpoints.length
            ? 'ครบทุกจุดแล้ว'
            : `คงเหลือ ${sortedCheckpoints.length - logs.length} จุด`}
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EAEAEA]">
        {sortedCheckpoints.map((cp, idx) => {
          const log = logsByCheckpoint.get(cp.id);
          const isDone = Boolean(log);
          const isNext =
            !isDone &&
            (idx === 0 ||
              logsByCheckpoint.has(sortedCheckpoints[idx - 1]?.id || ''));

          let timeStr = '';
          if (log?.checkedAt) {
            const d = new Date(log.checkedAt);
            timeStr = d.toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
          }

          return (
            <div
              key={cp.id}
              className="relative flex items-start justify-between text-xs"
            >
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-6 top-1 size-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold transition-colors ${
                  isDone
                    ? 'bg-[#EDF3EC] text-[#346538] border-[rgba(52,101,56,0.3)]'
                    : isNext
                      ? 'bg-[#111111] text-[#FFFFFF] border-[#111111] animate-pulse'
                      : 'bg-[#FFFFFF] text-[#BBBAB8] border-[#EAEAEA]'
                }`}
              >
                {isDone ? '✓' : cp.orderIndex}
              </div>

              {/* Checkpoint Details */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${
                      isDone
                        ? 'text-[#111111]'
                        : isNext
                          ? 'text-[#111111]'
                          : 'text-[#787774]'
                    }`}
                  >
                    {cp.label}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#F7F6F3] border border-[#EAEAEA] text-[10px] font-mono text-[#787774]">
                    {cp.checkType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[#787774]">
                  {cp.windowStart && cp.windowEnd && (
                    <span>
                      ช่วงเวลา: {cp.windowStart} - {cp.windowEnd}
                    </span>
                  )}
                  {cp.requireLocation && <span>· บังคับ GPS</span>}
                  {cp.requirePhoto && <span>· ถ่ายภาพ</span>}
                </div>
              </div>

              {/* Right Side Status / Time */}
              <div className="text-right">
                {isDone ? (
                  <div className="flex flex-col items-end">
                    <span className="font-mono font-bold text-[#346538] text-[11px]">
                      {timeStr}
                    </span>
                    <span className="text-[10px] text-[#787774] font-mono">
                      {log?.isLocationValid ? 'GPS Verified' : 'Manual / Area'}
                    </span>
                  </div>
                ) : isNext ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#E1F3FE] text-[#1F6C9F] text-[10px] font-mono font-semibold">
                    จุดถัดไป
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#BBBAB8]">
                    รอดำเนินการ
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
