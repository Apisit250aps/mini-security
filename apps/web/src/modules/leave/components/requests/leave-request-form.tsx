'use client';

import React, { useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0]!, []);

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

  const startDate = useWatch({ control: methods.control, name: 'startDate' });
  const endDate = useWatch({ control: methods.control, name: 'endDate' });
  const unit = useWatch({ control: methods.control, name: 'unit' });

  useEffect(() => {
    if (unit === 'day' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end >= start
      ) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        methods.setValue('totalDays', diffDays);
      }
    }
  }, [startDate, endDate, unit, methods]);

  const memberOptions = useMemo(() => {
    return (membersQuery.data || []).map((m) => ({
      value: m.id,
      label: m.userId || m.id,
    }));
  }, [membersQuery.data]);

  const typeOptions = useMemo(() => {
    return (typesQuery.data || []).map((t) => ({
      value: t.id,
      label: `${t.name} (${t.isPaid ? 'ได้รับค่าจ้าง' : 'ไม่ได้รับค่าจ้าง'})`,
    }));
  }, [typesQuery.data]);

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <SelectField
          name="companyMemberId"
          label="พนักงานผู้ยื่นคำขอ"
          placeholder="เลือกพนักงาน..."
          options={memberOptions}
          control={methods.control}
          disabled={membersQuery.isLoading}
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
