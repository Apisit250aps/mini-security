'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { ScheduleSlot } from '@repo/domains/entities';
import DetailPageLayout from '@/shared/components/layouts/detail-page-layout';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import {
  useCompanySchedulesQueries,
  useScheduleSlotsQueries,
} from '../hooks/attendance-queries';
import {
  useSlotCreate,
  useSlotUpdate,
  useSlotDelete,
} from '../hooks/attendance-mutations';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useOverlay } from '@repo/ui/hooks';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import EmptyState from '@/shared/components/app/empty-state';
import MetricStatCard from '@/shared/components/app/metric-stat-card';
import SlotForm, { SlotFormValues } from '../components/schedules/slot-form';
import SlotLocationsPanel from '../components/schedules/slot-locations-panel';
import ScheduleEditForm from '../components/schedules/schedule-edit-form';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  Calendar,
  Shield,
} from 'lucide-react';

interface ScheduleDetailViewProps {
  scheduleId: string;
}

export default function ScheduleDetailView({
  scheduleId,
}: ScheduleDetailViewProps) {
  const router = useRouter();
  const ui = useOverlay();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();

  const schedulesQuery = useCompanySchedulesQueries(activeCompanyId || '');
  const slotsQuery = useScheduleSlotsQueries(scheduleId);
  const rolesQuery = useCompanyRolesQueries(activeCompanyId || '');

  const createMutation = useSlotCreate(scheduleId);
  const updateMutation = useSlotUpdate(scheduleId);
  const deleteMutation = useSlotDelete(scheduleId);

  const schedule = useMemo(() => {
    return schedulesQuery.data?.find((s) => s.id === scheduleId);
  }, [schedulesQuery.data, scheduleId]);

  const slots = useMemo(() => {
    return (slotsQuery.data || []).sort((a, b) => a.slotOrder - b.slotOrder);
  }, [slotsQuery.data]);

  const assignedRoleNames = useMemo(() => {
    if (!schedule?.roleIds || !rolesQuery.data) return [];
    return rolesQuery.data
      .filter((r) => schedule.roleIds?.includes(r.id))
      .map((r) => r.name);
  }, [schedule, rolesQuery.data]);

  // Open Offcanvas Sheet to Add Slot
  const handleOpenAddSlot = useCallback(() => {
    if (!schedule) return;
    ui.sheet.open({
      title: `เพิ่มรอบเวลาใหม่: ${schedule.name}`,
      description: 'กำหนดช่วงเวลาลงชื่อ ลำดับรอบ และเงื่อนไขการบังคับ',
      size: 'lg',
      children: (
        <SlotForm
          isLoading={createMutation.isPending}
          defaultValues={{
            label: '',
            slotOrder: slots.length + 1,
            windowStart: '08:00:00',
            windowEnd: '09:00:00',
            isRequired: true,
          }}
          onSubmit={(data: SlotFormValues) => {
            createMutation.mutate(
              {
                companyId: schedule.companyId,
                label: data.label,
                slotOrder: data.slotOrder,
                windowStart: data.windowStart,
                windowEnd: data.windowEnd,
                isRequired: data.isRequired,
              },
              {
                onSuccess: () => {
                  ui.sheet.close();
                },
              },
            );
          }}
        />
      ),
    });
  }, [schedule, slots.length, createMutation, ui.sheet]);

  // Open Offcanvas Sheet to Edit Slot
  const handleOpenEditSlot = useCallback(
    (slot: ScheduleSlot) => {
      ui.sheet.open({
        title: `แก้ไขรอบเวลา: ${slot.label}`,
        description: 'ปรับปรุงช่วงเวลาและเงื่อนไขของรอบการลงชื่อ',
        size: 'lg',
        children: (
          <SlotForm
            isLoading={updateMutation.isPending}
            defaultValues={{
              label: slot.label,
              slotOrder: slot.slotOrder,
              windowStart: slot.windowStart,
              windowEnd: slot.windowEnd,
              isRequired: slot.isRequired,
            }}
            onSubmit={(data: SlotFormValues) => {
              updateMutation.mutate(
                {
                  id: slot.id,
                  data: {
                    label: data.label,
                    slotOrder: data.slotOrder,
                    windowStart: data.windowStart,
                    windowEnd: data.windowEnd,
                    isRequired: data.isRequired,
                  },
                },
                {
                  onSuccess: () => {
                    ui.sheet.close();
                  },
                },
              );
            }}
          />
        ),
      });
    },
    [updateMutation, ui.sheet],
  );

  // Open Offcanvas Sheet to Configure Slot Locations
  const handleOpenSlotLocations = useCallback(
    (slot: ScheduleSlot) => {
      if (!activeCompanyId) return;
      ui.sheet.open({
        title: `จุดตรวจและสถานที่: ${slot.label}`,
        description: 'กำหนดพิกัดและสถานที่ที่อนุญาตให้ลงเวลาสำหรับรอบนี้',
        size: '2xl',
        children: (
          <SlotLocationsPanel
            companyId={activeCompanyId}
            slot={slot}
            onBack={() => ui.sheet.close()}
          />
        ),
      });
    },
    [activeCompanyId, ui.sheet],
  );

  // Open Offcanvas Sheet to Edit Schedule Metadata
  const handleOpenEditSchedule = useCallback(() => {
    if (!schedule) return;
    ui.sheet.open({
      title: 'แก้ไขตารางเวลาเข้างาน',
      description: 'ปรับปรุงชื่อ การมอบหมายบทบาท และสถานะเปิดใช้งาน',
      size: 'lg',
      children: (
        <ScheduleEditForm
          schedule={schedule}
          onSuccess={() => ui.sheet.close()}
        />
      ),
    });
  }, [schedule, ui.sheet]);

  // Confirm Delete Slot
  const handleDeleteSlot = useCallback(
    (slot: ScheduleSlot) => {
      ui.alert.open({
        title: `ยืนยันการลบรอบเวลา "${slot.label}"`,
        description:
          'คุณแน่ใจหรือไม่ที่จะลบรอบเวลานี้? ประวัติการลงเวลาในอดีตจะยังคงอยู่ แต่จะไม่สามารถลงเวลาในรอบนี้ได้อีก',
        confirmVariant: 'destructive',
        onConfirm: () => {
          deleteMutation.mutate(slot.id, {
            onSuccess: () => {
              ui.hideAll();
            },
          });
        },
      });
    },
    [deleteMutation, ui],
  );

  const slotColumns = useMemo<ColumnDef<ScheduleSlot>[]>(
    () => [
      {
        accessorKey: 'slotOrder',
        header: 'ลำดับ',
        cell: ({ getValue }) => (
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            #{getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'label',
        header: 'ชื่อรอบเวลา',
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left font-semibold text-primary hover:underline flex flex-col group cursor-pointer"
            onClick={() => handleOpenEditSlot(row.original)}
          >
            <span>{row.original.label}</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              คลิกเพื่อแก้ไขรอบเวลา
            </span>
          </button>
        ),
      },
      {
        id: 'windowTime',
        header: 'ช่วงเวลาลงชื่อ',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>
              {row.original.windowStart} - {row.original.windowEnd}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isRequired',
        header: 'ความจำเป็น',
        cell: ({ getValue }) => (
          <Badge variant={getValue<boolean>() ? 'default' : 'outline'}>
            {getValue<boolean>() ? 'บังคับ' : 'ไม่บังคับ'}
          </Badge>
        ),
      },
      {
        id: 'locations',
        header: 'พิกัด / สถานที่',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onPress={() => handleOpenSlotLocations(row.original)}
          >
            <MapPin className="size-3.5" />
            พิกัด / สถานที่
          </Button>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onPress={() => handleOpenEditSlot(row.original)}
              aria-label="แก้ไขรอบเวลา"
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-destructive hover:text-destructive"
              onPress={() => handleDeleteSlot(row.original)}
              aria-label="ลบรอบเวลา"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [handleOpenEditSlot, handleOpenSlotLocations, handleDeleteSlot],
  );

  const isLoading = isCompanyLoading || schedulesQuery.isLoading;

  if (!isLoading && !schedule) {
    return (
      <DetailPageLayout
        title="ไม่พบตารางเวลา"
        backHref="/company/attendance/schedules"
      >
        <EmptyState
          icon={Calendar}
          title="ไม่พบข้อมูลตารางเวลาที่ระบุ"
          description="ตารางเวลานี้อาจถูกลบหรือไม่มีสิทธิ์เข้าถึง"
          action={
            <Button
              onPress={() => router.push('/company/attendance/schedules')}
            >
              กลับสู่หน้ารายการตารางเวลา
            </Button>
          }
        />
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout
      title={schedule?.name || 'ตารางเวลาเข้างาน'}
      description="จัดการรอบเวลาเช็คชื่อ (Slots) กำหนดช่วงเวลา และสถานที่ที่อนุญาตให้ลงเวลา"
      backHref="/company/attendance/schedules"
      backLabel="กลับหน้ารายการตารางเวลา"
      isLoading={isLoading}
      badges={
        schedule && (
          <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
            {schedule.isActive ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Inactive)'}
          </Badge>
        )
      }
      actions={
        schedule && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onPress={handleOpenEditSchedule}>
              <Edit2 className="size-4" />
              แก้ไขตาราง
            </Button>
            <Button onPress={handleOpenAddSlot}>
              <Plus className="size-4" />
              เพิ่มรอบเวลา (Add Slot)
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricStatCard
            title="จำนวนรอบเวลาทั้งหมด"
            value={`${slots.length} รอบ`}
            icon={Clock}
            description="รอบเวลาที่พนักงานต้องลงชื่อ"
          />
          <MetricStatCard
            title="รอบที่บังคับลงเวลา"
            value={`${slots.filter((s) => s.isRequired).length} รอบ`}
            icon={CheckCircle2}
            description="จำเป็นต่อการนับสถานะเข้างาน"
          />
          <MetricStatCard
            title="บทบาทที่ผูกกับตารางนี้"
            value={`${schedule?.roleIds?.length ?? 0} บทบาท`}
            icon={Shield}
            description="Role ที่ใช้ตารางการทำงานนี้"
          />
        </div>

        {/* Assigned Roles Banner */}
        {assignedRoleNames.length > 0 && (
          <Card className="bg-muted/40">
            <CardContent className="flex flex-wrap items-center gap-2 p-4">
              <span className="text-sm font-medium text-foreground">
                บทบาทที่ใช้ตารางเวลานี้:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assignedRoleNames.map((name) => (
                  <Badge key={name} variant="outline" className="bg-background">
                    {name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slots Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              รอบเวลาการลงชื่อ (Check-in Slots)
            </h2>
            <p className="text-sm text-muted-foreground">
              เรียงตามลำดับเวลาการเข้างานของกะ (คลิกที่ชื่อรอบเพื่อแก้ไขข้อมูล)
            </p>
          </div>

          {slots.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="ยังไม่มีรอบเวลาในตารางนี้"
              description="เริ่มต้นสร้างรอบการลงเวลา เช่น รอบเข้างานเช้า หรือ รอบออกงานเย็น เพื่อให้พนักงานเริ่มบันทึกเวลาได้"
              action={
                <Button onPress={handleOpenAddSlot}>
                  <Plus className="size-4" />
                  เพิ่มรอบเวลาแรก
                </Button>
              }
            />
          ) : (
            <DataTable data={slots} columns={slotColumns} />
          )}
        </div>
      </div>
    </DetailPageLayout>
  );
}
