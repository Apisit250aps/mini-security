'use client';

import React, { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InputField, SelectField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/components/sonner';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useFormPlanCreate } from '../../hooks/form-mutations';
import { getErrorMessage } from '@/shared/utils';

const planFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อแผนงาน'),
  scheduleKind: z.enum(['RECURRING', 'EXPLICIT']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  openTime: z.string().default('08:00'),
  dueHours: z.coerce.number().min(1).default(8),
  opensAt: z.string().optional(),
  dueAt: z.string().optional(),
  targetType: z.enum(['ROLE', 'MEMBER']).default('ROLE'),
  roleId: z.string().optional(),
  roleDistribution: z.enum(['SHARED', 'PER_MEMBER']).default('SHARED'),
  companyMemberId: z.string().optional(),
  reviewMode: z
    .enum(['NONE', 'OVERALL', 'ALL_SECTIONS', 'ALL_ANSWERS'])
    .default('OVERALL'),
  latePolicy: z.enum(['ALLOW', 'DENY']).default('DENY'),
  autoActivate: z.boolean().default(true),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

interface FormPlanCreateDialogProps {
  companyId: string;
  templateId: string;
  onClose: () => void;
}

export default function FormPlanCreateDialog({
  companyId,
  templateId,
  onClose,
}: FormPlanCreateDialogProps) {
  const rolesQuery = useCompanyRolesQueries(companyId);
  const membersQuery = useCompanyMembersQueries(companyId);
  const createPlanMutation = useFormPlanCreate(companyId);

  const roles = rolesQuery.data || [];
  const members = membersQuery.data || [];

  const methods = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema as never),
    defaultValues: {
      name: '',
      scheduleKind: 'RECURRING',
      frequency: 'DAILY',
      openTime: '08:00',
      dueHours: 8,
      targetType: 'ROLE',
      roleId: roles[0]?.id || '',
      roleDistribution: 'SHARED',
      companyMemberId: members[0]?.id || '',
      reviewMode: 'OVERALL',
      latePolicy: 'DENY',
      autoActivate: true,
    },
  });

  const { control } = methods;
  const scheduleKind = useWatch({ control, name: 'scheduleKind' });
  const targetType = useWatch({ control, name: 'targetType' });

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `พนักงาน ID: ${m.userId.slice(0, 8)} (${m.id.slice(0, 8)})`,
  }));

  const handleSubmit = useCallback(
    async (values: PlanFormValues) => {
      // Validate targets
      if (values.targetType === 'ROLE' && !values.roleId) {
        toast.error('กรุณาเลือกตำแหน่ง (Role) ที่ต้องการมอบหมาย');
        return;
      }
      if (values.targetType === 'MEMBER' && !values.companyMemberId) {
        toast.error('กรุณาเลือกพนักงานที่ต้องการมอบหมาย');
        return;
      }

      const scheduleConfig =
        values.scheduleKind === 'RECURRING'
          ? {
              frequency: values.frequency,
              interval: 1,
              anchorLocalDate: new Date().toISOString().split('T')[0],
              openLocalTime: values.openTime || '08:00',
              dueOffset: {
                amount: Number(values.dueHours) || 8,
                unit: 'ELAPSED_HOURS',
              },
            }
          : null;

      const targets = [
        values.targetType === 'ROLE'
          ? {
              roleId: values.roleId,
              roleDistribution: values.roleDistribution,
            }
          : {
              companyMemberId: values.companyMemberId,
            },
      ];

      const periods =
        values.scheduleKind === 'EXPLICIT' && values.opensAt && values.dueAt
          ? [
              {
                opensAt: new Date(values.opensAt),
                dueAt: new Date(values.dueAt),
              },
            ]
          : undefined;

      createPlanMutation.mutate(
        {
          data: {
            companyId,
            formTemplateId: templateId,
            name: values.name,
            scheduleKind: values.scheduleKind,
            scheduleConfig,
            timezone:
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              'Asia/Bangkok',
            fixedVersionId: null,
            reviewMode: values.reviewMode,
            latePolicy: values.latePolicy,
            missedPolicy: 'SKIP',
          },
          targets,
          periods,
        },
        {
          onSuccess: () => {
            toast.success('สร้างแผนงานและบันทึกการมอบหมายเรียบร้อย');
            onClose();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err, 'ไม่สามารถสร้างแผนงานได้'));
          },
        },
      );
    },
    [companyId, templateId, createPlanMutation, onClose],
  );

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="space-y-4 pt-1"
    >
      <FieldGroup>
        <InputField
          control={control}
          name="name"
          label="ชื่อแผนงาน / รอบงาน"
          placeholder="เช่น ตรวจเวรประจำวัน, ตรวจความปลอดภัยประจำสัปดาห์"
          required
        />

        {/* Schedule Kind */}
        {scheduleKind === 'RECURRING' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                control={control}
                name="scheduleKind"
                label="รูปแบบกำหนดการ"
                options={[
                  { value: 'RECURRING', label: 'ทำซ้ำตามรอบ (Recurring)' },
                  { value: 'EXPLICIT', label: 'กำหนดช่วงเวลาเฉพาะ (Explicit)' },
                ]}
              />
              <SelectField
                control={control}
                name="frequency"
                label="ความถี่"
                options={[
                  { value: 'DAILY', label: 'ทุกวัน (Daily)' },
                  { value: 'WEEKLY', label: 'ทุกสัปดาห์ (Weekly)' },
                  { value: 'MONTHLY', label: 'ทุกเดือน (Monthly)' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                control={control}
                name="openTime"
                label="เวลาเปิดรอบในแต่ละวัน"
                type="time"
              />
              <InputField
                control={control}
                name="dueHours"
                label="กำหนดส่งภายใน (ชั่วโมง)"
                type="number"
              />
            </div>
          </>
        ) : (
          <>
            <SelectField
              control={control}
              name="scheduleKind"
              label="รูปแบบกำหนดการ"
              options={[
                { value: 'RECURRING', label: 'ทำซ้ำตามรอบ (Recurring)' },
                { value: 'EXPLICIT', label: 'กำหนดช่วงเวลาเฉพาะ (Explicit)' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                control={control}
                name="opensAt"
                label="เวลาเริ่มเปิดรับ"
                type="datetime-local"
                required
              />
              <InputField
                control={control}
                name="dueAt"
                label="เวลาครบกำหนดส่ง"
                type="datetime-local"
                required
              />
            </div>
          </>
        )}

        {/* Target Assignment */}
        <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
          <h4 className="text-sm font-semibold">
            การมอบหมายผู้รับผิดชอบ (Target Assignment)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              control={control}
              name="targetType"
              label="ประเภทผู้รับมอบหมาย"
              options={[
                { value: 'ROLE', label: 'มอบหมายตามบทบาท (Role)' },
                { value: 'MEMBER', label: 'มอบหมายพนักงานรายบุคคล (Member)' },
              ]}
            />

            {targetType === 'ROLE' ? (
              <SelectField
                control={control}
                name="roleId"
                label="เลือกบทบาท (Role)"
                options={roleOptions}
                placeholder="เลือกบทบาท..."
              />
            ) : (
              <SelectField
                control={control}
                name="companyMemberId"
                label="เลือกพนักงาน (Member)"
                options={memberOptions}
                placeholder="เลือกพนักงาน..."
              />
            )}
          </div>

          {targetType === 'ROLE' && (
            <SelectField
              control={control}
              name="roleDistribution"
              label="ลักษณะการกระจายงานใน Role"
              options={[
                {
                  value: 'SHARED',
                  label: 'ร่วมกันทำ (SHARED) — สมาชิกในบทบาทร่วมกันทำ 1 ใบ',
                },
                {
                  value: 'PER_MEMBER',
                  label: 'แยกรายบุคคล (PER_MEMBER) — แจกทุกคนในบทบาทคนละ 1 ใบ',
                },
              ]}
            />
          )}
        </div>

        {/* Policies */}
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            control={control}
            name="reviewMode"
            label="โหมดการตรวจประเมิน"
            options={[
              { value: 'NONE', label: 'ไม่ต้องตรวจ (จบงานทันทีหลังส่ง)' },
              { value: 'OVERALL', label: 'ตรวจสรุปภาพรวมทั้งใบ' },
              { value: 'ALL_SECTIONS', label: 'ต้องตรวจผ่านครบทุกหมวด' },
              { value: 'ALL_ANSWERS', label: 'ต้องตรวจผ่านครบทุกข้อ' },
            ]}
          />

          <SelectField
            control={control}
            name="latePolicy"
            label="นโยบายการส่งเกินกำหนด"
            options={[
              { value: 'DENY', label: 'ห้ามส่งเกินเวลา (DENY)' },
              { value: 'ALLOW', label: 'อนุญาตให้ส่งช้าได้ (ALLOW)' },
            ]}
          />
        </div>
      </FieldGroup>

      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button variant="ghost" type="button" onClick={onClose}>
          ยกเลิก
        </Button>
        <ButtonLoading
          type="submit"
          isLoading={createPlanMutation.isPending}
          loadingText="กำลังบันทึก..."
        >
          บันทึกแผนงานและมอบหมาย
        </ButtonLoading>
      </div>
    </form>
  );
}
