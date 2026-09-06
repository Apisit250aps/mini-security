'use client';

import React, { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  SelectField,
  TextareaField,
  DateRangeField,
} from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { CompanyMemberSelectField } from '@/modules/company/components/members/company-member-select-field';
import { useCompanyLeaveTypesQueries } from '../../hooks/leave-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useSession } from '@/modules/auth/hooks/session-provider';
import type { FormProps } from '@/types';

export const leaveRequestFormSchema = z.object({
  companyMemberId: z.string().uuid('กรุณาเลือกพนักงาน'),
  leaveTypeId: z.string().uuid('กรุณาเลือกประเภทการลา'),
  startDate: z.string().min(1, 'กรุณาระบุวันเริ่มต้น'),
  endDate: z.string().min(1, 'กรุณาระบุวันสิ้นสุด'),
  totalDays: z.coerce.number().min(0.5, 'จำนวนวันต้องอย่างน้อย 0.5 วัน'),
  unit: z.enum(['day', 'half_day', 'hour']).default('day'),
  reason: z.string().min(1, 'กรุณาระบุเหตุผลการลา'),
  proofUrl: z.string().url('URL ไม่ถูกต้อง').or(z.literal('')).optional(),
});

export type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>;

const UNIT_OPTIONS = [
  { value: 'day', label: 'เต็มวัน (Day)' },
  { value: 'half_day', label: 'ครึ่งวัน (Half Day)' },
  { value: 'hour', label: 'ชั่วโมง (Hour)' },
];

interface LeaveRequestFormProps extends FormProps<LeaveRequestFormValues> {
  companyId: string;
}

const getTodayString = () => new Date().toISOString().split('T')[0]!;

export default function LeaveRequestForm({
  companyId,
  onSubmit,
  defaultValues,
  isLoading,
}: LeaveRequestFormProps) {
  const { data: session } = useSession();
  const typesQuery = useCompanyLeaveTypesQueries(companyId, true);
  const membersQuery = useCompanyMembersQueries(companyId);

  const currentMember = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId || !membersQuery.data) return null;
    return membersQuery.data.find((m) => m.userId === userId) || null;
  }, [session?.user?.id, membersQuery.data]);

  const todayStr = getTodayString();

  const methods = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema as never),
    defaultValues: defaultValues ?? {
      companyMemberId: currentMember?.id || '',
      leaveTypeId: '',
      startDate: todayStr,
      endDate: todayStr,
      totalDays: 1,
      unit: 'day',
      reason: '',
      proofUrl: '',
    },
  });

  const handleRangeChange = useCallback(
    (start: string | null, end: string | null) => {
      if (start && end && methods.getValues('unit') === 'day') {
        const s = new Date(start);
        const e = new Date(end);
        if (
          !Number.isNaN(s.getTime()) &&
          !Number.isNaN(e.getTime()) &&
          e >= s
        ) {
          const diffTime = Math.abs(e.getTime() - s.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          methods.setValue('totalDays', diffDays);
        }
      }
    },
    [methods],
  );

  const typeOptions = useMemo(() => {
    return (typesQuery.data || []).map((t) => ({
      value: t.id,
      label: `${t.name} (${t.isPaid ? 'ได้รับค่าจ้าง' : 'ไม่ได้รับค่าจ้าง'})`,
    }));
  }, [typesQuery.data]);

  const handleFormSubmit = useCallback(
    (values: LeaveRequestFormValues) => {
      onSubmit(values);
    },
    [onSubmit],
  );

  return (
    <form
      onSubmit={methods.handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <CompanyMemberSelectField
          companyId={companyId}
          name="companyMemberId"
          label="พนักงานผู้ยื่นคำขอ"
          placeholder="เลือกพนักงาน..."
          control={methods.control}
          required
        />

        <SelectField
          name="leaveTypeId"
          label="ประเภทการลา"
          placeholder="เลือกประเภทการลา..."
          options={typeOptions}
          control={methods.control}
          disabled={typesQuery.isLoading}
          required
        />

        <DateRangeField
          control={methods.control}
          startName="startDate"
          endName="endDate"
          label="ช่วงวันที่ลา (Leave Period)"
          placeholder="เลือกวันเริ่มต้น - สิ้นสุดการลา..."
          onChangeRange={handleRangeChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            name="totalDays"
            label="จำนวนวันลา (วัน)"
            type="number"
            control={methods.control}
            required
          />

          <SelectField
            name="unit"
            label="หน่วยนับ"
            options={UNIT_OPTIONS}
            control={methods.control}
            required
          />
        </div>

        <TextareaField
          name="reason"
          label="เหตุผลการลา"
          placeholder="ระบุเหตุผลและรายละเอียดความจำเป็นในการขอลา"
          control={methods.control}
          required
        />

        <InputField
          name="proofUrl"
          label="ลิงก์เอกสารแนบ / ใบรับรองแพทย์ (ถ้ามี)"
          placeholder="https://example.com/medical-cert.pdf"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <ButtonLoading type="submit" isLoading={isLoading}>
          ส่งคำขอลาหยุดงาน
        </ButtonLoading>
      </div>
    </form>
  );
}
