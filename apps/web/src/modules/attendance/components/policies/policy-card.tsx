'use client';

import React from 'react';
import type {
  AttendanceCheckpoint,
  AttendancePolicy,
} from '@repo/domains/entities';
import { useAttendanceCheckpointsQueries } from '../../hooks/attendance-queries';
import {
  useAttendanceCheckpointDelete,
  useAttendancePolicyDelete,
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
import {
  Camera,
  CheckCircle2,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import PolicyForm from './policy-form';
import CheckpointForm from './checkpoint-form';
import CheckpointLocationDialog from './checkpoint-location-dialog';

export default function PolicyCard({
  companyId,
  policy,
}: {
  companyId: string;
  policy: AttendancePolicy;
}) {
  const ui = useOverlay();
  const { data: checkpoints = [], isLoading: isCheckpointsLoading } =
    useAttendanceCheckpointsQueries(policy.id);

  const deletePolicyMutation = useAttendancePolicyDelete(companyId);
  const deleteCheckpointMutation = useAttendanceCheckpointDelete(policy.id);

  const handleEditPolicy = () => {
    ui.dialog.open({
      title: 'แก้ไขนโยบายการลงเวลา',
      description: 'ปรับปรุงชื่อและสถานะของนโยบาย',
      size: 'lg',
      children: <PolicyForm companyId={companyId} policy={policy} />,
    });
  };

  const handleDeletePolicy = () => {
    ui.alert.open({
      title: 'ยืนยันการลบนโยบาย',
      description: `คุณต้องการลบนโยบาย "${policy.name}" หรือไม่? (จุดเช็คชื่อทั้งหมดในนโยบายนี้จะถูกลบด้วย)`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deletePolicyMutation.mutateAsync(policy.id);
        ui.hideAll();
      },
    });
  };

  const handleAddCheckpoint = () => {
    ui.dialog.open({
      title: 'เพิ่มจุดเช็คชื่อ (Checkpoint)',
      description: `สร้างจุดเช็คชื่อใหม่ภายใต้นโยบาย "${policy.name}"`,
      size: 'xl',
      children: <CheckpointForm policyId={policy.id} />,
    });
  };

  const handleEditCheckpoint = (checkpoint: AttendanceCheckpoint) => {
    ui.dialog.open({
      title: 'แก้ไขจุดเช็คชื่อ',
      description: 'ปรับปรุงเงื่อนไข เวลา และข้อกำหนดของจุดเช็ค',
      size: 'xl',
      children: <CheckpointForm policyId={policy.id} checkpoint={checkpoint} />,
    });
  };

  const handleManageLocations = (checkpoint: AttendanceCheckpoint) => {
    ui.dialog.open({
      title: 'ผูกสถานที่สำหรับจุดเช็คชื่อ',
      description: `จัดการพิกัดสถานที่และรัศมีที่อนุญาตสำหรับ "${checkpoint.label}"`,
      size: 'lg',
      children: (
        <CheckpointLocationDialog
          companyId={companyId}
          checkpoint={checkpoint}
        />
      ),
    });
  };

  const handleDeleteCheckpoint = (checkpoint: AttendanceCheckpoint) => {
    ui.alert.open({
      title: 'ยืนยันการลบจุดเช็คชื่อ',
      description: `คุณต้องการลบจุดเช็ค "${checkpoint.label}" หรือไม่?`,
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await deleteCheckpointMutation.mutateAsync(checkpoint.id);
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
                {policy.name}
              </CardTitle>
              {policy.isActive ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  เปิดใช้งาน
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  ปิดใช้งาน
                </Badge>
              )}
            </div>
            {policy.description && (
              <CardDescription className="text-xs">
                {policy.description}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onPress={handleEditPolicy}
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onPress={handleDeletePolicy}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            จุดเช็คชื่อ / Checkpoints ({checkpoints.length})
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onPress={handleAddCheckpoint}
          >
            <Plus className="size-3" />
            เพิ่มจุดเช็ค
          </Button>
        </div>

        {isCheckpointsLoading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            กำลังโหลดจุดเช็คชื่อ...
          </div>
        ) : checkpoints.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            ยังไม่มีจุดเช็คชื่อในนโยบายนี้ กดปุ่ม &quot;เพิ่มจุดเช็ค&quot;
            เพื่อเริ่มต้น
          </div>
        ) : (
          <div className="space-y-2">
            {checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center justify-between rounded-md border p-3 bg-card/60 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold mt-0.5">
                    {cp.orderIndex}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {cp.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 font-medium"
                      >
                        {cp.checkType}
                      </Badge>
                      {cp.isRequired && (
                        <Badge variant="secondary" className="text-[10px] py-0">
                          บังคับ
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      {(cp.windowStart || cp.windowEnd) && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="size-3" />
                          {cp.windowStart || 'เริ่ม'} - {cp.windowEnd || 'ปิด'}
                        </span>
                      )}
                      {cp.requireLocation && (
                        <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400">
                          <MapPin className="size-3" /> เช็ค GPS
                        </span>
                      )}
                      {cp.requirePhoto && (
                        <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400">
                          <Camera className="size-3" /> ถ่ายรูป
                        </span>
                      )}
                      {Boolean(cp.graceMinutes) && (
                        <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                          <CheckCircle2 className="size-3" /> สายได้{' '}
                          {cp.graceMinutes} นาที
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-primary"
                    onPress={() => handleManageLocations(cp)}
                  >
                    <MapPin className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    onPress={() => handleEditCheckpoint(cp)}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-destructive"
                    onPress={() => handleDeleteCheckpoint(cp)}
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
