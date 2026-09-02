'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeaveRequestSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useLeaveRequestCreate,
  useLeaveRequestUpdate,
} from '../../hooks/attendance-mutations';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useOverlay } from '@repo/ui/hooks';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { DateField } from '@repo/ui/components/shared/form/field-date';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { LeaveRequest, User } from '@repo/domains/entities';

type FormValues = z.infer<typeof createLeaveRequestSchema>;

const LEAVE_TYPE_OPTIONS = [
  { value: 'SICK_LEAVE', label: 'ลาป่วย (Sick Leave)' },
  { value: 'ANNUAL_LEAVE', label: 'ลาพักร้อนประจำปี (Annual Leave)' },
  { value: 'PERSONAL_LEAVE', label: 'ลากิจส่วนตัว (Personal Leave)' },
  { value: 'MATERNITY_LEAVE', label: 'ลาคลอด (Maternity Leave)' },
  { value: 'ABSENT_NO_REASON', label: 'ขาดงาน / ไม่ระบุเหตุผล' },
];

export default function LeaveForm({
  companyId,
  leave,
}: {
  companyId: string;
  leave?: LeaveRequest;
}) {
  const ui = useOverlay();
  const createMutation = useLeaveRequestCreate(companyId);
  const updateMutation = useLeaveRequestUpdate(companyId);
  const { data: members = [] } = useCompanyMembersQueries(companyId);
  const { data: users = [] } = useUserListQueries();

  const isEdit = Boolean(leave);

  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      map.set(u.id, u);
    }
    return map;
  }, [users]);

  const memberOptions = useMemo(
    () =>
      members.map((m) => {
        const user = usersMap.get(m.userId);
        return {
          value: m.id,
          label: user ? `${user.name} (${user.email})` : `พนักงาน ID: ${m.id}`,
        };
      }),
    [members, usersMap],
  );

  const methods = useForm<FormValues>({
    resolver: zodResolver(createLeaveRequestSchema as never),
    defaultValues: {
      companyId,
      companyMemberId: leave?.companyMemberId || members[0]?.id || '',
      leaveType: leave?.leaveType || 'ANNUAL_LEAVE',
      status: leave?.status || 'PENDING',
      startDate: leave?.startDate ? new Date(leave.startDate) : new Date(),
      endDate: leave?.endDate ? new Date(leave.endDate) : new Date(),
      totalDays: leave?.totalDays ?? 1,
      reason: leave?.reason || '',
      attachmentUrl: leave?.attachmentUrl || null,
      reviewedBy: leave?.reviewedBy || null,
      reviewedAt: leave?.reviewedAt ? new Date(leave.reviewedAt) : null,
      reviewNote: leave?.reviewNote || null,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && leave) {
      await updateMutation.mutateAsync({
        id: leave.id,
        data: {
          leaveType: data.leaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          totalDays: Number(data.totalDays),
          reason: data.reason || null,
          attachmentUrl: data.attachmentUrl || null,
        },
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        companyMemberId: data.companyMemberId,
        leaveType: data.leaveType,
        status: 'PENDING',
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays: Number(data.totalDays),
        reason: data.reason || null,
        attachmentUrl: data.attachmentUrl || null,
      });
    }
    ui.hideAll();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        {!isEdit && (
          <SelectField
            name="companyMemberId"
            label="พนักงานผู้ยื่นคำขอ"
            placeholder="เลือกพนักงาน..."
            options={memberOptions}
            control={methods.control}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            name="leaveType"
            label="ประเภทการลา"
            placeholder="เลือกประเภทการลา..."
            options={LEAVE_TYPE_OPTIONS}
            control={methods.control}
            required
          />

          <InputField
            name="totalDays"
            label="จำนวนวันลา (วัน)"
            type="number"
            placeholder="1"
            control={methods.control}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DateField
            name="startDate"
            label="วันที่เริ่มลา"
            placeholder="เลือกวันที่เริ่มลา"
            control={methods.control}
          />
          <DateField
            name="endDate"
            label="วันที่สิ้นสุดการลา"
            placeholder="เลือกวันที่สิ้นสุด"
            control={methods.control}
          />
        </div>

        <TextareaField
          name="reason"
          label="เหตุผลการลา"
          placeholder="ระบุเหตุผลในการขอลาหยุด"
          control={methods.control}
        />

        <InputField
          name="attachmentUrl"
          label="ลิงก์ไฟล์แนบ / ใบรับรองแพทย์ (ถ้ามี)"
          placeholder="https://..."
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'ส่งคำขอลา'}
        </ButtonLoading>
      </div>
    </form>
  );
}
