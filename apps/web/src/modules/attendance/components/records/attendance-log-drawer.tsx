'use client';

import React from 'react';
import type { AttendanceRecord } from '@repo/domains/entities';
import { useAttendanceLogsQueries } from '../../hooks/attendance-queries';
import { Badge } from '@repo/ui/components/badge';
import { formatDate } from '@/shared/utils';
import { CheckCircle2, Clock, Image, MapPin, XCircle } from 'lucide-react';

export default function AttendanceLogDrawer({
  record,
}: {
  record: AttendanceRecord;
}) {
  const { data: logs = [], isLoading } = useAttendanceLogsQueries(record.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        กำลังโหลดบันทึกการลงเวลา...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Clock className="size-10 mb-2 opacity-40" />
        <p className="text-sm font-medium">ยังไม่มีข้อมูล Check-in Event</p>
        <p className="text-xs">ไม่พบรายการบันทึกจุดเช็คชื่อสำหรับวันนี้</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h4 className="text-sm font-semibold">
            บันทึกการเช็คชื่อ ({logs.length} จุด)
          </h4>
          <p className="text-xs text-muted-foreground">
            วันที่ {formatDate(record.workDate)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {logs.map((log, index) => (
          <div
            key={log.id}
            className="flex items-start gap-3 rounded-lg border p-3.5 bg-card/50 transition-colors hover:bg-muted/30"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {index + 1}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    {log.checkType}
                  </Badge>
                  {log.isManual && (
                    <Badge variant="secondary" className="text-[10px]">
                      บันทึกด้วยตนเอง
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDate(log.checkedAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  <span>
                    พิกัด GPS:{' '}
                    {log.isLocationValid ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3" /> ผ่านเงื่อนไข
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-destructive font-medium">
                        <XCircle className="size-3" /> อยู่นอกพื้นที่
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Image className="size-3.5 shrink-0" />
                  <span>
                    ภาพถ่าย:{' '}
                    {log.photoVerified ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ยืนยันแล้ว
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        ไม่มี / ไม่ระบุ
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {log.photoUrl && (
                <div className="mt-2 overflow-hidden rounded-md border w-32 h-24 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={log.photoUrl}
                    alt="Check-in Photo"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {log.manualReason && (
                <p className="mt-1 text-xs italic text-muted-foreground">
                  หมายเหตุ: {log.manualReason}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
