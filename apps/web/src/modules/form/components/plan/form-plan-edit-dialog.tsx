'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { toast } from '@repo/ui/components/sonner';
import {
  Clock,
  Info,
  Layers,
  Plus,
  Settings2,
  Trash2,
  Users,
} from 'lucide-react';
import type {
  FormPlan,
  FormPlanTarget,
  FormPlanPeriod,
} from '@repo/domains/entities';
import type { FormTemplateDetail } from '@repo/client';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useFormPlanUpdate } from '../../hooks/form-mutations';

export type TargetItem =
  | {
      type: 'ROLE';
      roleId: string;
      roleDistribution: 'SHARED' | 'PER_MEMBER';
    }
  | {
      type: 'MEMBER';
      companyMemberId: string;
    };

export type PeriodItem = {
  opensAt: string;
  dueAt: string;
};

interface FormPlanEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: FormPlan;
  initialTargets: FormPlanTarget[];
  initialPeriods: FormPlanPeriod[];
  companyId: string;
  templateDetail?: FormTemplateDetail | null;
}

export default function FormPlanEditDialog({
  open,
  onOpenChange,
  plan,
  initialTargets,
  initialPeriods,
  companyId,
  templateDetail,
}: FormPlanEditDialogProps) {
  const router = useRouter();
  const updatePlanMutation = useFormPlanUpdate(companyId, plan.id);

  const rolesQuery = useCompanyRolesQueries(companyId);
  const membersQuery = useCompanyMembersQueries(companyId);

  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);
  const members = useMemo(() => membersQuery.data || [], [membersQuery.data]);

  const [activeTab, setActiveTab] = useState('general');

  // General tab state
  const [name, setName] = useState(plan.name);
  const [versionOption, setVersionOption] = useState<'LATEST' | 'LOCKED'>(
    plan.fixedVersionId ? 'LOCKED' : 'LATEST',
  );
  const [timezone, setTimezone] = useState(plan.timezone);

  // Schedule tab state
  const cfg = plan.scheduleConfig as Record<string, unknown> | null;
  const [scheduleKind, setScheduleKind] = useState<'RECURRING' | 'EXPLICIT'>(
    plan.scheduleKind,
  );
  const [frequency, setFrequency] = useState<
    'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  >((cfg?.frequency as never) || 'DAILY');
  const [interval, setInterval] = useState<number>(
    typeof cfg?.interval === 'number' ? cfg.interval : 1,
  );
  const [anchorLocalDate, setAnchorLocalDate] = useState<string>(
    (cfg?.anchorLocalDate as string) ||
      new Date().toISOString().split('T')[0] ||
      '',
  );
  const [openLocalTime, setOpenLocalTime] = useState<string>(
    (cfg?.openLocalTime as string) || '08:00',
  );
  const dueOffset = cfg?.dueOffset as
    | { amount?: number; unit?: string }
    | undefined;
  const [dueAmount, setDueAmount] = useState<number>(dueOffset?.amount || 8);
  const [dueUnit, setDueUnit] = useState<'ELAPSED_HOURS' | 'CALENDAR_DAYS'>(
    (dueOffset?.unit as never) || 'ELAPSED_HOURS',
  );
  const [invalidDayPolicy, setInvalidDayPolicy] = useState<'SKIP' | 'LAST_DAY'>(
    (cfg?.invalidDayPolicy as never) || 'LAST_DAY',
  );

  // Explicit periods state
  const [periods, setPeriods] = useState<PeriodItem[]>(() =>
    initialPeriods.length > 0
      ? initialPeriods.map((p) => ({
          opensAt: new Date(p.opensAt).toISOString().slice(0, 16),
          dueAt: new Date(p.dueAt).toISOString().slice(0, 16),
        }))
      : [
          {
            opensAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
            dueAt: new Date(Date.now() + 86400000 + 28800000)
              .toISOString()
              .slice(0, 16),
          },
        ],
  );

  // Targets tab state
  const [targets, setTargets] = useState<TargetItem[]>(() =>
    initialTargets.map((t) =>
      t.roleId
        ? {
            type: 'ROLE' as const,
            roleId: t.roleId,
            roleDistribution:
              (t.roleDistribution as 'SHARED' | 'PER_MEMBER') || 'SHARED',
          }
        : {
            type: 'MEMBER' as const,
            companyMemberId: t.companyMemberId || '',
          },
    ),
  );

  // New target input state
  const [newTargetType, setNewTargetType] = useState<'ROLE' | 'MEMBER'>('ROLE');
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleDistribution, setNewRoleDistribution] = useState<
    'SHARED' | 'PER_MEMBER'
  >('SHARED');
  const [newMemberId, setNewMemberId] = useState('');

  // Policies tab state
  const [reviewMode, setReviewMode] = useState<
    'NONE' | 'OVERALL' | 'ALL_SECTIONS' | 'ALL_ANSWERS'
  >(plan.reviewMode);
  const [latePolicy, setLatePolicy] = useState<'ALLOW' | 'DENY'>(
    plan.latePolicy,
  );
  const [missedPolicy, setMissedPolicy] = useState<'SKIP' | 'CATCH_UP'>(
    plan.missedPolicy,
  );

  const isDraft = !plan.effectiveFrom;

  const handleAddTarget = () => {
    if (newTargetType === 'ROLE') {
      if (!newRoleId) {
        toast.error('กรุณาเลือกตำแหน่ง (Role)');
        return;
      }
      const exists = targets.some(
        (t) => t.type === 'ROLE' && t.roleId === newRoleId,
      );
      if (exists) {
        toast.error('ตำแหน่งนี้ถูกเพิ่มในรายการมอบหมายแล้ว');
        return;
      }
      setTargets([
        ...targets,
        {
          type: 'ROLE',
          roleId: newRoleId,
          roleDistribution: newRoleDistribution,
        },
      ]);
      setNewRoleId('');
    } else {
      if (!newMemberId) {
        toast.error('กรุณาเลือกพนักงาน');
        return;
      }
      const exists = targets.some(
        (t) => t.type === 'MEMBER' && t.companyMemberId === newMemberId,
      );
      if (exists) {
        toast.error('พนักงานคนนี้ถูกเพิ่มในรายการมอบหมายแล้ว');
        return;
      }
      setTargets([
        ...targets,
        {
          type: 'MEMBER',
          companyMemberId: newMemberId,
        },
      ]);
      setNewMemberId('');
    }
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleAddPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    const baseTime = lastPeriod
      ? new Date(lastPeriod.dueAt).getTime() + 86400000
      : Date.now() + 86400000;
    setPeriods([
      ...periods,
      {
        opensAt: new Date(baseTime).toISOString().slice(0, 16),
        dueAt: new Date(baseTime + 28800000).toISOString().slice(0, 16),
      },
    ]);
  };

  const handleRemovePeriod = (index: number) => {
    if (periods.length <= 1) {
      toast.error('ต้องมีช่วงเวลาอย่างน้อย 1 ช่วง');
      return;
    }
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      toast.error('กรุณาระบุชื่อแผนการตรวจ');
      setActiveTab('general');
      return;
    }

    if (targets.length === 0) {
      toast.error('กรุณากำหนดผู้รับผิดชอบอย่างน้อย 1 รายการ');
      setActiveTab('targets');
      return;
    }

    if (scheduleKind === 'EXPLICIT') {
      if (periods.length === 0) {
        toast.error(
          'กรุณากำหนดช่วงเวลาอย่างน้อย 1 ช่วงสำหรับกำหนดการแบบ Explicit',
        );
        setActiveTab('schedule');
        return;
      }
      for (let i = 0; i < periods.length; i++) {
        const p = periods[i]!;
        if (new Date(p.dueAt) <= new Date(p.opensAt)) {
          toast.error(
            `ช่วงเวลาที่ ${i + 1}: เวลาสิ้นสุด (Due At) ต้องมากกว่าเวลาเปิด (Opens At)`,
          );
          setActiveTab('schedule');
          return;
        }
      }
    }

    const scheduleConfig =
      scheduleKind === 'RECURRING'
        ? {
            frequency,
            interval,
            anchorLocalDate,
            openLocalTime,
            invalidDayPolicy,
            dueOffset: {
              amount: dueAmount,
              unit: dueUnit,
            },
          }
        : null;

    const fixedVersionId =
      versionOption === 'LOCKED'
        ? plan.fixedVersionId || templateDetail?.activeVersion?.id || null
        : null;

    updatePlanMutation.mutate(
      {
        expectedRevision: plan.revision,
        data: {
          name: name.trim(),
          scheduleKind,
          scheduleConfig,
          timezone,
          fixedVersionId,
          reviewMode,
          latePolicy,
          missedPolicy,
        },
        targets: targets.map((t) =>
          t.type === 'ROLE'
            ? {
                roleId: t.roleId,
                roleDistribution: t.roleDistribution,
              }
            : {
                companyMemberId: t.companyMemberId,
              },
        ),
        periods:
          scheduleKind === 'EXPLICIT'
            ? periods.map((p) => ({
                opensAt: new Date(p.opensAt),
                dueAt: new Date(p.dueAt),
              }))
            : undefined,
      },
      {
        onSuccess: (result) => {
          onOpenChange(false);
          if (result?.data && result.data.id !== plan.id) {
            toast.success(
              `บันทึกการตั้งค่าสำเร็จ (สร้างเวอร์ชันใหม่ v${result.data.revision})`,
            );
            router.push(`/company/forms/plans/${result.data.id}`);
          }
        },
      },
    );
  }, [
    name,
    targets,
    scheduleKind,
    periods,
    frequency,
    interval,
    anchorLocalDate,
    openLocalTime,
    invalidDayPolicy,
    dueAmount,
    dueUnit,
    versionOption,
    plan.fixedVersionId,
    plan.revision,
    plan.id,
    templateDetail?.activeVersion?.id,
    timezone,
    reviewMode,
    latePolicy,
    missedPolicy,
    updatePlanMutation,
    onOpenChange,
    router,
  ]);

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-2xl max-h-[92vh] flex flex-col"
    >
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Settings2 className="size-5" />
            </div>
            <DialogTitle>ตั้งค่าแผนการตรวจ</DialogTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {isDraft ? (
              <Badge
                variant="outline"
                className="border-amber-400 text-amber-600"
              >
                ฉบับร่าง
              </Badge>
            ) : (
              <Badge variant="default" className="bg-emerald-600">
                เปิดใช้งานแล้ว
              </Badge>
            )}
            <Badge variant="outline" className="font-mono">
              v{plan.revision}
            </Badge>
          </div>
        </div>
        <DialogDescription>
          ปรับแต่งชื่อแผน กำหนดการ ผู้รับมอบหมาย
          และนโยบายการทำงานของแผนการตรวจนี้
        </DialogDescription>
      </DialogHeader>

      {/* State Mode Alert */}
      {!isDraft && (
        <div className="mx-4 mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">
              บันทึกการเปลี่ยนแปลงแบบประวัติ (Revision Tracking):
            </span>{' '}
            เนื่องจากแผนนี้มีการเปิดใช้งานแล้ว
            ระบบจะปิดรอบแผนปัจจุบันและสร้างรอบแผนเวอร์ชันใหม่ (v
            {plan.revision + 1}) เพื่อรักษาประวัติการตรวจเดิมไว้อย่างปลอดภัย
          </div>
        </div>
      )}

      {/* Dialog Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(k) => setActiveTab(String(k))}
        >
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger id="general">
              <Settings2 data-icon="inline-start" className="size-3.5" />
              ทั่วไป
            </TabsTrigger>
            <TabsTrigger id="schedule">
              <Clock data-icon="inline-start" className="size-3.5" />
              กำหนดการ
            </TabsTrigger>
            <TabsTrigger id="targets">
              <Users data-icon="inline-start" className="size-3.5" />
              ผู้รับผิดชอบ ({targets.length})
            </TabsTrigger>
            <TabsTrigger id="policies">
              <Layers data-icon="inline-start" className="size-3.5" />
              นโยบาย
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GENERAL */}
          <TabsContent id="general" className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-plan-name">ชื่อแผนการตรวจ</FieldLabel>
                <Input
                  id="edit-plan-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น แผนตรวจเวรประจำวัน อาคาร A"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-plan-timezone">
                  เขตเวลา (Timezone)
                </FieldLabel>
                <Input
                  id="edit-plan-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Asia/Bangkok"
                  required
                />
                <FieldDescription>
                  เขตเวลา IANA สำหรับคำนวณรอบเวลา เช่น Asia/Bangkok
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>การผูกเวอร์ชันแม่แบบแบบฟอร์ม</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div
                    onClick={() => setVersionOption('LATEST')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      versionOption === 'LATEST'
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      ใช้เวอร์ชันล่าสุดเสมอ (Latest)
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      เมื่อแม่แบบฟอร์มมีการเผยแพร่เวอร์ชันใหม่
                      แผนจะเปลี่ยนไปใช้เวอร์ชันใหม่โดยอัตโนมัติ
                    </div>
                  </div>

                  <div
                    onClick={() => setVersionOption('LOCKED')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      versionOption === 'LOCKED'
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      ล็อกเวอร์ชันปัจจุบัน (Locked)
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {templateDetail?.activeVersion
                        ? `ล็อกกับเวอร์ชัน v${templateDetail.activeVersion.version}`
                        : plan.fixedVersionId
                          ? `ล็อกกับเวอร์ชันเดิม (${plan.fixedVersionId.slice(0, 8)})`
                          : 'ล็อกเวอร์ชันที่ใช้อยู่'}
                    </div>
                  </div>
                </div>
              </Field>
            </FieldGroup>
          </TabsContent>

          {/* TAB 2: SCHEDULE */}
          <TabsContent id="schedule" className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>รูปแบบกำหนดการ</FieldLabel>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div
                    onClick={() => setScheduleKind('RECURRING')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      scheduleKind === 'RECURRING'
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      ทำซ้ำตามรอบ (Recurring)
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      เปิดรอบอัตโนมัติตามความถี่ที่กำหนด
                    </div>
                  </div>

                  <div
                    onClick={() => setScheduleKind('EXPLICIT')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      scheduleKind === 'EXPLICIT'
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      กำหนดช่วงเวลาเอง (Explicit)
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ระบุวันเวลาเปิดและส่งงานแต่ละรอบเอง
                    </div>
                  </div>
                </div>
              </Field>

              {scheduleKind === 'RECURRING' ? (
                <div className="p-4 border rounded-xl bg-muted/10 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="edit-freq">
                        ความถี่การทำซ้ำ
                      </FieldLabel>
                      <select
                        id="edit-freq"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as never)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="DAILY">ทุกวัน (Daily)</option>
                        <option value="WEEKLY">ทุกสัปดาห์ (Weekly)</option>
                        <option value="MONTHLY">ทุกเดือน (Monthly)</option>
                        <option value="YEARLY">ทุกปี (Yearly)</option>
                      </select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-interval">
                        ช่วงระยะ (Interval)
                      </FieldLabel>
                      <Input
                        id="edit-interval"
                        type="number"
                        min={1}
                        max={100}
                        value={interval}
                        onChange={(e) =>
                          setInterval(Math.max(1, Number(e.target.value)))
                        }
                      />
                      <FieldDescription>
                        {frequency === 'DAILY'
                          ? `ทุกๆ ${interval} วัน`
                          : frequency === 'WEEKLY'
                            ? `ทุกๆ ${interval} สัปดาห์`
                            : frequency === 'MONTHLY'
                              ? `ทุกๆ ${interval} เดือน`
                              : `ทุกๆ ${interval} ปี`}
                      </FieldDescription>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="edit-anchor-date">
                        วันที่เริ่มต้นฐาน (Anchor Date)
                      </FieldLabel>
                      <Input
                        id="edit-anchor-date"
                        type="date"
                        value={anchorLocalDate}
                        onChange={(e) => setAnchorLocalDate(e.target.value)}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-open-time">
                        เวลาเปิดรอบในแต่ละวัน
                      </FieldLabel>
                      <Input
                        id="edit-open-time"
                        type="time"
                        value={openLocalTime}
                        onChange={(e) => setOpenLocalTime(e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="edit-due-amount">
                        ระยะเวลาส่งงาน (Due Offset)
                      </FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="edit-due-amount"
                          type="number"
                          min={1}
                          value={dueAmount}
                          onChange={(e) =>
                            setDueAmount(Math.max(1, Number(e.target.value)))
                          }
                          className="w-2/3"
                        />
                        <select
                          value={dueUnit}
                          onChange={(e) => setDueUnit(e.target.value as never)}
                          className="w-1/3 rounded-md border border-input bg-background px-2 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="ELAPSED_HOURS">ชั่วโมง</option>
                          <option value="CALENDAR_DAYS">วัน</option>
                        </select>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="edit-invalid-day">
                        นโยบายวันสิ้นเดือนที่ไม่ตรง
                      </FieldLabel>
                      <select
                        id="edit-invalid-day"
                        value={invalidDayPolicy}
                        onChange={(e) =>
                          setInvalidDayPolicy(e.target.value as never)
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="LAST_DAY">
                          ใช้วันสุดท้ายของเดือน (Last Day)
                        </option>
                        <option value="SKIP">ข้ามรอบนั้นไป (Skip)</option>
                      </select>
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      รายการช่วงเวลาเปิดและส่งงาน ({periods.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPeriod}
                    >
                      <Plus data-icon="inline-start" className="size-3.5" />
                      เพิ่มช่วงเวลา
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {periods.map((period, idx) => (
                      <div
                        key={idx}
                        className="p-3 border rounded-lg bg-card flex items-center gap-3 justify-between"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">
                              เวลาเปิดรอบ
                            </span>
                            <Input
                              type="datetime-local"
                              value={period.opensAt}
                              onChange={(e) => {
                                const next = [...periods];
                                next[idx] = {
                                  ...next[idx]!,
                                  opensAt: e.target.value,
                                };
                                setPeriods(next);
                              }}
                            />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">
                              กำหนดส่ง
                            </span>
                            <Input
                              type="datetime-local"
                              value={period.dueAt}
                              onChange={(e) => {
                                const next = [...periods];
                                next[idx] = {
                                  ...next[idx]!,
                                  dueAt: e.target.value,
                                };
                                setPeriods(next);
                              }}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive"
                          onClick={() => handleRemovePeriod(idx)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FieldGroup>
          </TabsContent>

          {/* TAB 3: TARGETS */}
          <TabsContent id="targets" className="space-y-4">
            <div className="p-3.5 border rounded-xl bg-muted/20 space-y-3">
              <span className="font-semibold text-xs text-muted-foreground block">
                เพิ่มผู้รับผิดชอบใหม่
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-xs block mb-1">ประเภท</span>
                  <select
                    value={newTargetType}
                    onChange={(e) =>
                      setNewTargetType(e.target.value as 'ROLE' | 'MEMBER')
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="ROLE">ตามตำแหน่ง (Role)</option>
                    <option value="MEMBER">รายบุคคล (Member)</option>
                  </select>
                </div>

                {newTargetType === 'ROLE' ? (
                  <>
                    <div>
                      <span className="text-xs block mb-1">เลือกตำแหน่ง</span>
                      <select
                        value={newRoleId}
                        onChange={(e) => setNewRoleId(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">-- เลือกตำแหน่ง --</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-xs block mb-1">การกระจายงาน</span>
                      <select
                        value={newRoleDistribution}
                        onChange={(e) =>
                          setNewRoleDistribution(
                            e.target.value as 'SHARED' | 'PER_MEMBER',
                          )
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="SHARED">
                          งานกองกลางรวมกัน (Shared)
                        </option>
                        <option value="PER_MEMBER">
                          แยกงานรายบุคคล (Per Member)
                        </option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <span className="text-xs block mb-1">เลือกพนักงาน</span>
                    <select
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">-- เลือกพนักงาน --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          พนักงาน (ID: {m.userId.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <Button type="button" size="sm" onClick={handleAddTarget}>
                  <Plus data-icon="inline-start" className="size-3.5" />
                  เพิ่มผู้รับผิดชอบ
                </Button>
              </div>
            </div>

            {/* Current Targets List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block">
                ผู้รับผิดชอบปัจจุบัน ({targets.length} รายการ)
              </span>

              {targets.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                  ยังไม่มีผู้รับผิดชอบ กรุณาเพิ่มตำแหน่งหรือพนักงานอย่างน้อย 1
                  รายการ
                </div>
              ) : (
                targets.map((t, idx) => {
                  const roleName =
                    t.type === 'ROLE'
                      ? roles.find((r) => r.id === t.roleId)?.name ||
                        `ตำแหน่ง: ${t.roleId.slice(0, 8)}`
                      : null;
                  const memberName =
                    t.type === 'MEMBER'
                      ? `พนักงาน: ${t.companyMemberId.slice(0, 8)}`
                      : null;

                  return (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg bg-card flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted text-muted-foreground">
                          {t.type === 'ROLE' ? (
                            <Users className="size-4" />
                          ) : (
                            <Users className="size-4 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {t.type === 'ROLE' ? roleName : memberName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.type === 'ROLE'
                              ? t.roleDistribution === 'SHARED'
                                ? 'งานกองกลางกลุ่ม (SHARED) - ทำร่วมกัน'
                                : 'แยกงานให้ทุกคนในตำแหน่ง (PER_MEMBER)'
                              : 'มอบหมายรายบุคคล'}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => handleRemoveTarget(idx)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* TAB 4: POLICIES */}
          <TabsContent id="policies" className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-review-mode">
                  โหมดการตรวจรับ (Review Mode)
                </FieldLabel>
                <select
                  id="edit-review-mode"
                  value={reviewMode}
                  onChange={(e) => setReviewMode(e.target.value as never)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="NONE">
                    ไม่ต้องตรวจรับ (อนุมัติทันทีหลังส่ง)
                  </option>
                  <option value="OVERALL">
                    ตรวจรับแบบภาพรวม (Overall Approve/Reject)
                  </option>
                  <option value="ALL_SECTIONS">
                    ตรวจรับแยกตามหมวดหมู่ (Section-by-Section)
                  </option>
                  <option value="ALL_ANSWERS">
                    ตรวจรับแยกรายข้อ (Answer-by-Answer)
                  </option>
                </select>
                <FieldDescription>
                  กำหนดขั้นตอนการอนุมัติหลังพนักงานส่งแบบฟอร์มแล้ว
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-late-policy">
                  นโยบายการส่งงานล่าช้า (Late Policy)
                </FieldLabel>
                <select
                  id="edit-late-policy"
                  value={latePolicy}
                  onChange={(e) => setLatePolicy(e.target.value as never)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ALLOW">อนุญาตให้ส่งงานช้าได้ (ALLOW)</option>
                  <option value="DENY">ไม่อนุญาตให้ส่งงานช้า (DENY)</option>
                </select>
                <FieldDescription>
                  หากเลือกไม่อนุญาต ระบบจะปิดรับการส่งงานทันทีเมื่อเลยกำหนด Due
                  Date
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-missed-policy">
                  นโยบายรอบงานที่ตกหล่น (Missed Policy)
                </FieldLabel>
                <select
                  id="edit-missed-policy"
                  value={missedPolicy}
                  onChange={(e) => setMissedPolicy(e.target.value as never)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="SKIP">ข้ามรอบที่ตกหล่นไป (SKIP)</option>
                  <option value="CATCH_UP">
                    เปิดย้อนหลังให้ครบ (CATCH_UP)
                  </option>
                </select>
                <FieldDescription>
                  เมื่อระบบกลับมาเปิดหลังจากเซิร์ฟเวอร์หรือตารางงานหยุดชะงัก
                </FieldDescription>
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter className="border-t p-3 bg-muted/30">
        <DialogClose>
          <Button variant="outline" size="sm" type="button">
            ยกเลิก
          </Button>
        </DialogClose>
        <ButtonLoading
          size="sm"
          onPress={handleSave}
          isLoading={updatePlanMutation.isPending}
        >
          บันทึกการตั้งค่า
        </ButtonLoading>
      </DialogFooter>
    </Dialog>
  );
}
