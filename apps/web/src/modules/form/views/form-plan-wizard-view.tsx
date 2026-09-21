'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveOrganization } from '@/modules/organization-workspace/hooks/use-active-organization';
import { useOrganizationMembersQueries } from '@/modules/organization/hooks/organization-queries';
import { useGetOrganizationRoles } from '@/modules/role/hooks/role-queries';
import {
  useOrganizationFormTemplatesQueries,
  useFormTemplateQueries,
} from '../hooks/form-queries';
import {
  useFormPlanCreate,
  useFormPlanActivate,
} from '../hooks/form-mutations';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage } from '@/shared/utils';
import {
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  Info,
  Layers,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import type { CreateFormPlanRequest } from '@repo/client';

type TargetItem =
  | {
      type: 'ROLE';
      roleId: string;
      roleDistribution: 'SHARED' | 'PER_MEMBER';
    }
  | {
      type: 'MEMBER';
      organizationMemberId: string;
    };

type PeriodItem = {
  opensAt: string;
  dueAt: string;
};

function createInitialPeriods(): PeriodItem[] {
  const tomorrow = new Date(Date.now() + 86400000);
  const due = new Date(tomorrow.getTime() + 28800000);
  return [
    {
      opensAt: tomorrow.toISOString().slice(0, 16),
      dueAt: due.toISOString().slice(0, 16),
    },
  ];
}

export default function FormPlanWizardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplateId = searchParams.get('templateId') || '';

  const { activeOrganizationId, isLoading: isOrganizationLoading } =
    useActiveOrganization();
  const rolesQuery = useGetOrganizationRoles(activeOrganizationId || '');
  const membersQuery = useOrganizationMembersQueries(
    activeOrganizationId || '',
  );
  const templatesQuery = useOrganizationFormTemplatesQueries(
    activeOrganizationId || '',
  );

  const createPlanMutation = useFormPlanCreate(activeOrganizationId || '');
  const activatePlanMutation = useFormPlanActivate(
    activeOrganizationId || '',
    '',
  );

  const [currentStep, setCurrentStep] = useState(1);
  // --- Step 1 State: Plan Info & Form ---
  const [name, setName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    preselectedTemplateId,
  );
  const [versionOption, setVersionOption] = useState<'LATEST' | 'LOCKED'>(
    'LATEST',
  );

  // Load detail of selected template to check activeVersion
  const templateDetailQuery = useFormTemplateQueries(
    selectedTemplateId || undefined,
  );
  const selectedTemplateDetail = templateDetailQuery.data;
  const activeVersion = selectedTemplateDetail?.activeVersion;

  // --- Step 2 State: Schedule & Periods ---
  const [scheduleKind, setScheduleKind] = useState<'RECURRING' | 'EXPLICIT'>(
    'RECURRING',
  );
  const [frequency, setFrequency] = useState<
    'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  >('DAILY');
  const [interval, setInterval] = useState(1);
  const [timezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok',
  );
  const [anchorLocalDate, setAnchorLocalDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [openLocalTime, setOpenLocalTime] = useState('08:00');
  const [dueAmount, setDueAmount] = useState(8);
  const [dueUnit, setDueUnit] = useState<'ELAPSED_HOURS' | 'CALENDAR_DAYS'>(
    'ELAPSED_HOURS',
  );
  const [endLocalDate, setEndLocalDate] = useState('');
  const [invalidDayPolicy, setInvalidDayPolicy] = useState<'SKIP' | 'LAST_DAY'>(
    'LAST_DAY',
  );
  const [missedPolicy, setMissedPolicy] = useState<'SKIP' | 'CATCH_UP'>('SKIP');

  // For EXPLICIT periods
  const [periods, setPeriods] = useState<PeriodItem[]>(createInitialPeriods);

  // --- Step 3 State: Assign Targets ---
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [newTargetType, setNewTargetType] = useState<'ROLE' | 'MEMBER'>('ROLE');
  const [newRoleId, setNewRoleId] = useState('');
  const [newRoleDistribution, setNewRoleDistribution] = useState<
    'SHARED' | 'PER_MEMBER'
  >('SHARED');
  const [newMemberId, setNewMemberId] = useState('');

  // --- Step 4 State: Review & Policies ---
  const [latePolicy, setLatePolicy] = useState<'ALLOW' | 'DENY'>('DENY');

  // Saving states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);
  const members = useMemo(() => membersQuery.data || [], [membersQuery.data]);
  const templates = useMemo(
    () => templatesQuery.data || [],
    [templatesQuery.data],
  );

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
    } else {
      if (!newMemberId) {
        toast.error('กรุณาเลือกพนักงาน');
        return;
      }
      const exists = targets.some(
        (t) => t.type === 'MEMBER' && t.organizationMemberId === newMemberId,
      );
      if (exists) {
        toast.error('พนักงานคนนี้ถูกเพิ่มในรายการมอบหมายแล้ว');
        return;
      }
      setTargets([
        ...targets,
        {
          type: 'MEMBER',
          organizationMemberId: newMemberId,
        },
      ]);
      setNewMemberId('');
    }
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleAddPeriod = () => {
    setPeriods([
      ...periods,
      {
        opensAt: '',
        dueAt: '',
      },
    ]);
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleUpdatePeriod = (
    index: number,
    field: 'opensAt' | 'dueAt',
    value: string,
  ) => {
    setPeriods((current) =>
      current.map((period, i) =>
        i === index ? { ...period, [field]: value } : period,
      ),
    );
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('กรุณากรอกชื่อแผนการตรวจ');
        return false;
      }
      if (!selectedTemplateId) {
        toast.error('กรุณาเลือกแม่แบบฟอร์ม');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (scheduleKind === 'RECURRING') {
        if (!anchorLocalDate) {
          toast.error('กรุณาระบุวันที่เริ่มต้นรอบแรก');
          return false;
        }
        if (!openLocalTime) {
          toast.error('กรุณาระบุเวลาเปิดรอบ');
          return false;
        }
        if (dueAmount <= 0) {
          toast.error('ระยะเวลากำหนดส่งต้องมากกว่า 0');
          return false;
        }
      } else {
        if (periods.length === 0) {
          toast.error('กรุณาเพิ่มช่วงเวลาการตรวจอย่างน้อย 1 ช่วง');
          return false;
        }
        for (const [i, p] of periods.entries()) {
          if (!p.opensAt || !p.dueAt) {
            toast.error(`กรุณากรอกวันเวลาช่วงที่ ${i + 1} ให้ครบถ้วน`);
            return false;
          }
          if (new Date(p.opensAt) >= new Date(p.dueAt)) {
            toast.error(
              `ช่วงที่ ${i + 1}: เวลาเปิดรอบต้องเกิดขึ้นก่อนกำหนดส่ง`,
            );
            return false;
          }
        }
      }
      return true;
    }
    if (step === 3) {
      if (targets.length === 0) {
        toast.error('กรุณากำหนดผู้รับผิดชอบอย่างน้อย 1 รายการ');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Build Request Payload
  const buildPlanPayload = (): CreateFormPlanRequest => {
    const fixedVersionId =
      versionOption === 'LOCKED' && selectedTemplateDetail?.activeVersion?.id
        ? selectedTemplateDetail.activeVersion.id
        : undefined;

    const scheduleConfig =
      scheduleKind === 'RECURRING'
        ? {
            frequency,
            interval,
            anchorLocalDate,
            openLocalTime,
            dueOffset: {
              amount: dueAmount,
              unit: dueUnit,
            },
            endLocalDate: endLocalDate || undefined,
            invalidDayPolicy,
          }
        : null;

    const formattedTargets = targets.map((t) => {
      if (t.type === 'ROLE') {
        return {
          roleId: t.roleId,
          roleDistribution: t.roleDistribution,
        };
      }
      return {
        organizationMemberId: t.organizationMemberId || '',
      };
    });

    const formattedPeriods =
      scheduleKind === 'EXPLICIT'
        ? periods.map((p) => ({
            opensAt: new Date(p.opensAt),
            dueAt: new Date(p.dueAt),
          }))
        : undefined;

    return {
      data: {
        organizationId: activeOrganizationId || '',
        formTemplateId: selectedTemplateId,
        name: name.trim(),
        scheduleKind,
        scheduleConfig,
        timezone,
        fixedVersionId,
        latePolicy,
        missedPolicy,
      },
      targets: formattedTargets,
      periods: formattedPeriods,
    };
  };

  const handleSave = async (activateImmediately: boolean) => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setIsSubmitting(true);
    const payload = buildPlanPayload();

    try {
      const createRes = await createPlanMutation.mutateAsync(payload);
      const createdPlan = createRes?.data;

      if (!createdPlan?.id) {
        throw new Error('ไม่พบข้อมูลแผนงานที่สร้าง');
      }

      if (activateImmediately) {
        try {
          await activatePlanMutation.mutateAsync({
            planId: createdPlan.id,
            expectedRevision: createdPlan.revision,
          });
          toast.success('สร้างและเปิดใช้งานแผนการตรวจเรียบร้อยแล้ว');
          router.push(`/organization/forms/plans/${createdPlan.id}`);
          return;
        } catch (activateErr) {
          toast.warning(
            'บันทึกแผนงานสำเร็จ แต่ไม่สามารถเปิดใช้งานได้ในทันที กรุณากดเปิดใช้งานจากหน้ารายละเอียดแผน',
          );
          router.push(`/organization/forms/plans/${createdPlan.id}`);
          return;
        }
      }

      toast.success('บันทึกแผนการตรวจเรียบร้อย');
      router.push(`/organization/forms/plans/${createdPlan.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'ไม่สามารถบันทึกแผนงานได้'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPageLoading = isOrganizationLoading || !activeOrganizationId;

  return (
    <PageLayout
      pageId="organizationFormPlanCreate"
      isLoading={isPageLoading}
      loadingText="กำลังเตรียมข้อมูลสร้างแผน..."
      actions={
        <Link href="/organization/forms/plans">
          <Button variant="outline" size="sm">
            <ChevronLeft data-icon="inline-start" />
            กลับไปรายการแผน
          </Button>
        </Link>
      }
    >
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Step Indicator Header */}
        <div className="grid grid-cols-5 gap-2 border rounded-xl p-3 bg-card shadow-xs">
          {[
            { step: 1, title: '1. ข้อมูลและแบบฟอร์ม', icon: Layers },
            { step: 2, title: '2. กำหนดการและรอบเวลา', icon: Clock },
            { step: 3, title: '3. ผู้รับผิดชอบ', icon: Users },
            { step: 4, title: '4. นโยบายตรวจรับ', icon: FileCheck },
            { step: 5, title: '5. ตรวจทานและบันทึก', icon: Check },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const IconComponent = item.icon;

            return (
              <div
                key={item.step}
                className={`flex flex-col items-center sm:items-start p-2 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                    : isCompleted
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`size-5 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check className="size-3" /> : item.step}
                  </span>
                  <IconComponent className="size-3.5 hidden sm:inline" />
                </div>
                <span className="mt-1 text-center sm:text-left line-clamp-1">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 1: Plan Info & Select Template */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 1: ข้อมูลแผนและเลือกแบบฟอร์ม</CardTitle>
              <CardDescription>
                ตั้งชื่อแผนการตรวจและเลือกแม่แบบฟอร์มที่มีเวอร์ชันเผยแพร่แล้ว
                (Published)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="plan-name">
                    ชื่อแผนการตรวจ <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="plan-name"
                    placeholder="เช่น ตรวจอาคาร 1, ตรวจความปลอดภัยไซท์งาน A ประจำวัน"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FieldDescription>
                    ตั้งชื่อให้สื่อถึงสถานที่หรือขอบเขตงาน เช่น ตรวจอาคาร 1
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="plan-template">
                    เลือกแม่แบบฟอร์ม (Form Template){' '}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <select
                    id="plan-template"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- กรุณาเลือกแบบฟอร์ม --</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {!t.isActive ? '(ปิดใช้งาน)' : ''}
                      </option>
                    ))}
                  </select>
                  <FieldDescription>
                    เลือกแม่แบบที่ต้องการนำมาใช้ในแผนงานนี้
                  </FieldDescription>
                </Field>

                {selectedTemplateDetail && (
                  <div className="p-4 rounded-xl border bg-muted/20 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        ข้อมูลแม่แบบ: {selectedTemplateDetail.template.name}
                      </span>
                      {activeVersion ? (
                        <Badge variant="default" className="bg-emerald-600">
                          พร้อมใช้งาน (v{activeVersion.version})
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          ยังไม่มีเวอร์ชันเผยแพร่ (มีเฉพาะ Draft)
                        </Badge>
                      )}
                    </div>
                    {selectedTemplateDetail.template.description && (
                      <p className="text-muted-foreground">
                        {selectedTemplateDetail.template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-muted-foreground pt-1">
                      <span>
                        หมวดหมู่: {selectedTemplateDetail.sections.length} หมวด
                      </span>
                      <span>
                        ข้อคำถาม: {selectedTemplateDetail.fields.length} ข้อ
                      </span>
                    </div>

                    {!activeVersion && (
                      <div className="p-2.5 mt-1 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                        <Info className="size-4 shrink-0" />
                        <span>
                          แบบฟอร์มนี้ยังไม่ได้รับการเผยแพร่ (Publish) กรุณาไปยัง
                          <Link
                            href={`/organization/forms/templates/${selectedTemplateId}`}
                            className="underline font-semibold ml-1"
                          >
                            จัดการแม่แบบ
                          </Link>{' '}
                          เพื่อเผยแพร่ก่อนสร้างแผน
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {activeVersion && (
                  <Field>
                    <FieldLabel>
                      นโยบายเวอร์ชันของแบบฟอร์ม (Form Version Policy)
                    </FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div
                        onClick={() => setVersionOption('LATEST')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          versionOption === 'LATEST'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            ใช้เวอร์ชันล่าสุดเสมอ
                          </span>
                          <Badge variant="outline" className="text-xs">
                            แนะนำ
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          เมื่อมีการเผยแพร่เวอร์ชันใหม่
                          รอบงานที่เปิดหลังจากนั้นจะใช้คำถามเวอร์ชันใหม่ล่าสุดโดยอัตโนมัติ
                        </p>
                      </div>

                      <div
                        onClick={() => setVersionOption('LOCKED')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          versionOption === 'LOCKED'
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            ล็อกเวอร์ชันปัจจุบัน
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            v{activeVersion.version}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ล็อกให้ทุกรอบงานใช้เฉพาะคำถามของเวอร์ชัน{' '}
                          {activeVersion.version} นี้เสมอ แม้จะมีการอัปเดตแม่แบบ
                        </p>
                      </div>
                    </div>
                  </Field>
                )}
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Link href="/organization/forms/plans">
                <Button variant="ghost">ยกเลิก</Button>
              </Link>
              <Button
                onClick={handleNext}
                isDisabled={!activeVersion || !name.trim()}
              >
                ต่อไป
                <ChevronRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Schedule & Periods */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 2: ตั้งเวลาและรอบงาน</CardTitle>
              <CardDescription>
                เลือกระหว่างทำซ้ำตามรอบอัตโนมัติ (Recurring)
                หรือกำหนดช่วงเวลาเฉพาะ (Explicit Periods)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>รูปแบบกำหนดการ</FieldLabel>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setScheduleKind('RECURRING')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        scheduleKind === 'RECURRING'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <span className="font-semibold text-sm block">
                        ทำซ้ำตามรอบ (Recurring)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        เปิดรอบตามเวลาประจำ เช่น ทุกวันเวลา 08:00 น.
                      </span>
                    </div>

                    <div
                      onClick={() => setScheduleKind('EXPLICIT')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        scheduleKind === 'EXPLICIT'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <span className="font-semibold text-sm block">
                        กำหนดช่วงเวลาเฉพาะ (Explicit)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ระบุช่วงวันและเวลาเปิด/กำหนดส่งเป็นรอบๆ
                      </span>
                    </div>
                  </div>
                </Field>

                {scheduleKind === 'RECURRING' ? (
                  <div className="flex flex-col gap-4 border rounded-xl p-4 bg-muted/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="freq-select">
                          ความถี่การทำซ้ำ
                        </FieldLabel>
                        <select
                          id="freq-select"
                          value={frequency}
                          onChange={(e) =>
                            setFrequency(e.target.value as never)
                          }
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="DAILY">ทุกวัน (Daily)</option>
                          <option value="WEEKLY">ทุกสัปดาห์ (Weekly)</option>
                          <option value="MONTHLY">ทุกเดือน (Monthly)</option>
                          <option value="YEARLY">ทุกปี (Yearly)</option>
                        </select>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="interval-input">
                          ช่วงระยะ (Interval)
                        </FieldLabel>
                        <Input
                          id="interval-input"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="anchor-date">
                          วันที่เริ่มต้นฐาน (Anchor Date)
                        </FieldLabel>
                        <Input
                          id="anchor-date"
                          type="date"
                          value={anchorLocalDate}
                          onChange={(e) => setAnchorLocalDate(e.target.value)}
                        />
                        <FieldDescription>
                          วันที่ตั้งต้นในเขตเวลา {timezone}
                        </FieldDescription>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="end-date">
                          วันที่สิ้นสุด (รวมวันนี้)
                        </FieldLabel>
                        <Input
                          id="end-date"
                          type="date"
                          min={anchorLocalDate}
                          value={endLocalDate}
                          onChange={(e) => setEndLocalDate(e.target.value)}
                        />
                        <FieldDescription>
                          เว้นว่างได้หากไม่กำหนดวันสิ้นสุด
                        </FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="open-time">
                          เวลาเปิดรอบในแต่ละวัน
                        </FieldLabel>
                        <Input
                          id="open-time"
                          type="time"
                          value={openLocalTime}
                          onChange={(e) => setOpenLocalTime(e.target.value)}
                        />
                        <FieldDescription>
                          เวลาที่รอบจะเริ่มเปิดให้ผู้กรอกเห็น
                        </FieldDescription>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="due-amount">
                          ระยะเวลาส่งงาน (Due Offset)
                        </FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            id="due-amount"
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
                            onChange={(e) =>
                              setDueUnit(e.target.value as never)
                            }
                            className="w-1/3 rounded-md border border-input bg-transparent px-2 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="ELAPSED_HOURS">ชั่วโมง</option>
                            <option value="CALENDAR_DAYS">วัน</option>
                          </select>
                        </div>
                        <FieldDescription>
                          กำหนดส่งจะคำนวณถัดจากเวลาเปิดรอบ เช่น {dueAmount}{' '}
                          {dueUnit === 'ELAPSED_HOURS' ? 'ชั่วโมง' : 'วัน'}
                        </FieldDescription>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="missed-policy">
                          นโยบายเมื่อระบบพลาดรอบ (Missed Policy)
                        </FieldLabel>
                        <select
                          id="missed-policy"
                          value={missedPolicy}
                          onChange={(e) =>
                            setMissedPolicy(e.target.value as never)
                          }
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="SKIP">
                            ข้ามรอบเก่า (SKIP - แนะนำ)
                          </option>
                          <option value="CATCH_UP">
                            ตามเปิดย้อนหลัง (CATCH_UP)
                          </option>
                        </select>
                        <FieldDescription>
                          หากไม่มีการเปิดรอบตามเวลา ระบบจะข้ามหรือเปิดย้อนหลัง
                        </FieldDescription>
                      </Field>
                    </div>

                    {(frequency === 'MONTHLY' || frequency === 'YEARLY') && (
                      <Field>
                        <FieldLabel htmlFor="invalid-day-policy">
                          กรณีวันที่ไม่มีในเดือนนั้น (Invalid Day Policy)
                        </FieldLabel>
                        <select
                          id="invalid-day-policy"
                          value={invalidDayPolicy}
                          onChange={(e) =>
                            setInvalidDayPolicy(e.target.value as never)
                          }
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="LAST_DAY">
                            ใช้วันสุดท้ายของเดือน (LAST_DAY)
                          </option>
                          <option value="SKIP">ข้ามเดือนนั้นไป (SKIP)</option>
                        </select>
                      </Field>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 border rounded-xl p-4 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        รายการช่วงเวลาตรวจ (Periods)
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddPeriod}
                      >
                        <Plus data-icon="inline-start" />
                        เพิ่มช่วงเวลา
                      </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {periods.map((period, idx) => (
                        <div
                          key={idx}
                          className="p-3 border rounded-xl bg-card flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <div>
                              <span className="text-xs font-medium text-foreground block mb-1">
                                เวลาเปิดรอบ (Opens At)
                              </span>
                              <Input
                                type="datetime-local"
                                value={period.opensAt}
                                onChange={(e) => {
                                  const updated = [...periods];
                                  updated[idx] = {
                                    ...updated[idx]!,
                                    opensAt: e.target.value,
                                  };
                                  setPeriods(updated);
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-foreground block mb-1">
                                กำหนดส่ง (Due At)
                              </span>
                              <Input
                                type="datetime-local"
                                value={period.dueAt}
                                onChange={(e) => {
                                  const updated = [...periods];
                                  updated[idx] = {
                                    ...updated[idx]!,
                                    dueAt: e.target.value,
                                  };
                                  setPeriods(updated);
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive self-end sm:self-center"
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
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft data-icon="inline-start" />
                ย้อนกลับ
              </Button>
              <Button onClick={handleNext}>
                ต่อไป
                <ChevronRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Assign Targets */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 3: มอบหมายผู้กรอก (Targets)</CardTitle>
              <CardDescription>
                กำหนดตำแหน่ง (Role)
                หรือพนักงานรายบุคคลที่จะได้รับมอบหมายให้กรอกแบบฟอร์มในแต่ละรอบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {/* Target Creation Box */}
                <div className="p-4 border rounded-xl bg-muted/20 flex flex-col gap-4">
                  <span className="font-semibold text-sm">
                    เพิ่มผู้รับผิดชอบใหม่
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs font-medium block mb-1">
                        ประเภทผู้รับมอบหมาย
                      </span>
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
                          <span className="text-xs font-medium block mb-1">
                            เลือกตำแหน่ง (Role)
                          </span>
                          <select
                            value={newRoleId}
                            onChange={(e) => setNewRoleId(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">-- เลือก Role --</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-xs font-medium block mb-1">
                            การกระจายงาน
                          </span>
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
                              ร่วมกันทำ 1 ชุด (SHARED)
                            </option>
                            <option value="PER_MEMBER">
                              แยกคนละ 1 ชุด (PER_MEMBER)
                            </option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <span className="text-xs font-medium block mb-1">
                          เลือกพนักงาน
                        </span>
                        <select
                          value={newMemberId}
                          onChange={(e) => setNewMemberId(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">-- เลือกพนักงาน --</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              พนักงาน ID:{' '}
                              {m.userId?.slice(0, 8) || m.id?.slice(0, 8)} (
                              {m.id?.slice(0, 8)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" size="sm" onClick={handleAddTarget}>
                      <Plus data-icon="inline-start" />
                      เพิ่มผู้รับผิดชอบ
                    </Button>
                  </div>
                </div>

                {/* Target List */}
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-sm">
                    รายการผู้รับผิดชอบที่กำหนด ({targets.length} รายการ)
                  </span>

                  {targets.length === 0 ? (
                    <div className="p-8 text-center border rounded-xl border-dashed bg-card text-muted-foreground text-sm">
                      ยังไม่มีการกำหนดผู้รับผิดชอบ กรุณากดปุ่ม
                      &quot;เพิ่มผู้รับผิดชอบ&quot; ด้านบน
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {targets.map((target, idx) => {
                        if (target.type === 'ROLE') {
                          const role = roles.find(
                            (r) => r.id === target.roleId,
                          );
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 border rounded-xl bg-card"
                            >
                              <div className="flex items-center gap-3">
                                <Users className="size-4 text-primary" />
                                <div>
                                  <span className="font-semibold text-sm">
                                    ตำแหน่ง: {role?.name || target.roleId}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {target.roleDistribution === 'SHARED'
                                      ? 'ร่วมกันทำ 1 ชุด (สมาชิกใน Role ช่วยกันกรอกและแก้ไข)'
                                      : 'แยกคนละชุด (แจกงานให้สมาชิก active ทุกคนคนละ 1 ชุดตอนเปิดรอบ)'}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleRemoveTarget(idx)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          );
                        }

                        const targetMemberId = target.organizationMemberId;
                        const member = members.find(
                          (m) => m.id === targetMemberId,
                        );
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border rounded-xl bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="size-4 text-primary" />
                              <div>
                                <span className="font-semibold text-sm">
                                  พนักงานรายบุคคล:{' '}
                                  {member
                                    ? `ID: ${member.userId?.slice(0, 8) || member.id?.slice(0, 8)}`
                                    : targetMemberId}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  มอบหมายงานเฉพาะบุคคล 1 ชุดต่อรอบ
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRemoveTarget(idx)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft data-icon="inline-start" />
                ย้อนกลับ
              </Button>
              <Button onClick={handleNext} isDisabled={targets.length === 0}>
                ต่อไป
                <ChevronRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 4: Review Mode & Policies */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 4: การตรวจรับและนโยบายส่งงาน</CardTitle>
              <CardDescription>
                กำหนดเกณฑ์การพิจารณาตรวจผลคำตอบ และนโยบายกรณีส่งงานเลยเวลา
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <p className="text-sm text-muted-foreground">
                  ผู้ตรวจบันทึกผลรายข้อได้ และเป็นผู้อนุมัติหรือส่งกลับทั้งชุด
                </p>

                <Field>
                  <FieldLabel>นโยบายการส่งงานช้า (Late Policy)</FieldLabel>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div
                      onClick={() => setLatePolicy('DENY')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        latePolicy === 'DENY'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <span className="font-semibold text-sm block mb-1">
                        ไม่อนุญาตส่งช้า (DENY)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        หากเลยเวลาที่กำหนดส่ง (Due Date) ระบบจะปฏิเสธการส่งงาน
                      </span>
                    </div>

                    <div
                      onClick={() => setLatePolicy('ALLOW')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        latePolicy === 'ALLOW'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <span className="font-semibold text-sm block mb-1">
                        อนุญาตให้ส่งช้าได้ (ALLOW)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ผู้รับมอบหมายยังสามารถส่งงานได้แม้เลยกำหนดส่ง (จะติดแท็ก
                        Overdue)
                      </span>
                    </div>
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft data-icon="inline-start" />
                ย้อนกลับ
              </Button>
              <Button onClick={handleNext}>
                ต่อไป
                <ChevronRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>ขั้นตอนที่ 5: ตรวจทานและบันทึกแผนการตรวจ</CardTitle>
              <CardDescription>
                ตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนทำการบันทึกและเปิดใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 border rounded-xl p-5 bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      ชื่อแผนการตรวจ
                    </span>
                    <span className="font-semibold text-base text-foreground">
                      {name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      แม่แบบฟอร์มที่ใช้
                    </span>
                    <span className="font-semibold text-base text-foreground">
                      {selectedTemplateDetail?.template.name}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {versionOption === 'LOCKED'
                        ? `ล็อกที่เวอร์ชัน v${activeVersion?.version}`
                        : 'ใช้เวอร์ชันล่าสุดเสมอ'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      รูปแบบกำหนดการ
                    </span>
                    <span className="font-medium text-sm text-foreground">
                      {scheduleKind === 'RECURRING'
                        ? `ทำซ้ำ ${frequency} ทุก ${interval} รอบ เวลา ${openLocalTime} น.`
                        : `กำหนดช่วงเวลาเฉพาะ (${periods.length} ช่วง)`}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      ส่งภายใน {dueAmount}{' '}
                      {dueUnit === 'ELAPSED_HOURS' ? 'ชั่วโมง' : 'วัน'} (
                      {timezone})
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      การตรวจรับและนโยบาย
                    </span>
                    <span className="font-medium text-sm text-foreground">
                      โหมดตรวจ: ตรวจรายข้อและอนุมัติทั้งชุด
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      การส่งช้า:{' '}
                      {latePolicy === 'ALLOW' ? 'อนุญาต' : 'ไม่อนุญาต'} ·
                      Missed: {missedPolicy}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    ผู้รับผิดชอบที่มอบหมาย ({targets.length} รายการ)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {targets.map((t, i) => {
                      if (t.type === 'ROLE') {
                        const r = roles.find((role) => role.id === t.roleId);
                        return (
                          <Badge key={i} variant="secondary">
                            ตำแหน่ง: {r?.name || t.roleId} ({t.roleDistribution}
                            )
                          </Badge>
                        );
                      }
                      const memberId = t.organizationMemberId || '';
                      return (
                        <Badge key={i} variant="outline">
                          พนักงาน: {memberId.slice(0, 8)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                isDisabled={isSubmitting}
              >
                <ChevronLeft data-icon="inline-start" />
                ย้อนกลับ
              </Button>

              <div className="flex items-center gap-3 justify-end">
                <ButtonLoading
                  variant="outline"
                  onPress={() => handleSave(false)}
                  isLoading={isSubmitting}
                >
                  บันทึกเป็นฉบับร่าง
                </ButtonLoading>
                <ButtonLoading
                  variant="default"
                  onPress={() => handleSave(true)}
                  isLoading={isSubmitting}
                >
                  <Check data-icon="inline-start" />
                  บันทึกและเปิดใช้งานทันที
                </ButtonLoading>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
