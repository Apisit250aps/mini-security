'use client';

import React from 'react';
import type { WorkSchedule, WorkShift } from '@repo/domains/entities';
import { useWorkShiftsQueries } from '../../hooks/attendance-queries';
import {
  useWorkScheduleDelete,
  useWorkShiftDelete,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Clock, Edit2, Moon, Plus, Trash2 } from 'lucide-react';
import WorkScheduleForm from './work-schedule-form';
import WorkShiftForm from './work-shift-form';

export default function WorkScheduleCard({
  companyId,
  schedule,
}: {
  companyId: string;
  schedule: WorkSchedule;
}) {
  const ui = useOverlay();
  const { data: shifts = [], isLoading: isShiftsLoading } =
    useWorkShiftsQueries(schedule.id);

  const deleteScheduleMutation = useWorkScheduleDelete(companyId);
  const deleteShiftMutation = useWorkShiftDelete(schedule.id);

  const handleEditSchedule = () => {
    ui.dialog.open({
      title: 'แก้ไขตารางเวลาทำงาน',
      description: 'ปรับปรุงชื่อและสถานะของตารางเวลา',
      size: 'lg',
      children: <WorkScheduleForm companyId={companyId} schedule={schedule} />,
    });
  };

  const handleDeleteSchedule = () => {
    ui.alert.open({
      title: 'ยืนยันการลบตารางเวลา',
      description: `คุณต้องการลบ "${schedule.name}" หรือไม่? (กะทำงานทั้งหมดในตารางนี้จะถูกลบด้วย)`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteScheduleMutation.mutateAsync(schedule.id);
        ui.hideAll();
      },
    });
  };

  const handleAddShift = () => {
    ui.dialog.open({
      title: 'เพิ่มกะการทำงาน',
      description: `สร้างกะทำงานใหม่ภายใต้ตาราง "${schedule.name}"`,
      size: 'lg',
      children: (
        <WorkShiftForm companyId={companyId} workScheduleId={schedule.id} />
      ),
    });
  };

  const handleEditShift = (shift: WorkShift) => {
    ui.dialog.open({
      title: 'แก้ไขกะการทำงาน',
      description: 'ปรับปรุงเวลาเริ่ม-เลิกงานและสีประจำกะ',
      size: 'lg',
      children: (
        <WorkShiftForm
          companyId={companyId}
          workScheduleId={schedule.id}
          shift={shift}
        />
      ),
    });
  };

  const handleDeleteShift = (shift: WorkShift) => {
    ui.alert.open({
      title: 'ยืนยันการลบกะทำงาน',
      description: `คุณต้องการลบกะ "${shift.name}" (${shift.startTime} - ${shift.endTime}) หรือไม่?`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteShiftMutation.mutateAsync(shift.id);
        ui.hideAll();
      },
    });
  };

  return (
    <Card className="overflow-hidden border-border/80 transition-shadow hover:shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">
                {schedule.name}
              </CardTitle>
              {schedule.isActive ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  เปิดใช้งาน
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  ปิดใช้งาน
                </Badge>
              )}
            </div>
            {schedule.description && (
              <CardDescription className="text-xs">
                {schedule.description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onPress={handleEditSchedule}
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onPress={handleDeleteSchedule}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            กะการทำงาน ({shifts.length})
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onPress={handleAddShift}
          >
            <Plus className="size-3" />
            เพิ่มกะ
          </Button>
        </div>

        {isShiftsLoading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            กำลังโหลดกะทำงาน...
          </div>
        ) : shifts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            ยังไม่มีกะการทำงานในตารางนี้ กดปุ่ม &quot;เพิ่มกะ&quot;
            เพื่อสร้างกะแรก
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between rounded-md border p-2.5 bg-card/60 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: shift.color || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {shift.name}
                      </span>
                      {shift.isOvernight && (
                        <span title="กะข้ามคืน" className="text-amber-500">
                          <Moon className="size-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Clock className="size-3 shrink-0" />
                      <span>
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    onPress={() => handleEditShift(shift)}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-destructive"
                    onPress={() => handleDeleteShift(shift)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
