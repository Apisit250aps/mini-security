'use client';

import React, { useMemo } from 'react';
import { Button } from '@repo/ui/components/button';
import { useOverlay } from '@repo/ui/hooks';
import { LogIn } from 'lucide-react';
import { useAttendanceCheckIn } from '../../hooks/attendance-mutations';
import {
  useCompanySchedulesQueries,
  useScheduleSlotsQueries,
} from '../../hooks/attendance-queries';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { SelectField, TextareaField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface CheckInActionProps {
  companyId: string;
}

const checkInSchema = z.object({
  scheduleId: z.string().min(1, 'กรุณาเลือกตารางเวลา'),
  scheduleSlotId: z.string().min(1, 'กรุณาเลือกรอบเวลา'),
  note: z.string().optional(),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

function CheckInDialogContent({
  companyId,
  onSuccess,
}: {
  companyId: string;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const membersQuery = useCompanyMembersQueries(companyId);
  const schedulesQuery = useCompanySchedulesQueries(companyId);
  const checkInMutation = useAttendanceCheckIn(companyId);

  const methods = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      scheduleId: '',
      scheduleSlotId: '',
      note: '',
    },
  });

  const selectedScheduleId = useWatch({
    control: methods.control,
    name: 'scheduleId',
  });
  const slotsQuery = useScheduleSlotsQueries(selectedScheduleId);

  const currentMember = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId || !membersQuery.data) return null;
    return membersQuery.data.find((m) => m.userId === userId) || null;
  }, [session?.user?.id, membersQuery.data]);

  const scheduleOptions = useMemo(() => {
    return (schedulesQuery.data || [])
      .filter((s) => s.isActive)
      .map((s) => ({
        value: s.id,
        label: s.name,
      }));
  }, [schedulesQuery.data]);

  const slotOptions = useMemo(() => {
    return (slotsQuery.data || []).map((slot) => ({
      value: slot.id,
      label: `${slot.label} (${slot.windowStart} - ${slot.windowEnd})`,
    }));
  }, [slotsQuery.data]);

  const onSubmit = (values: CheckInFormValues) => {
    const memberId = currentMember?.id || (membersQuery.data?.[0]?.id ?? '');
    checkInMutation.mutate(
      {
        companyMemberId: memberId,
        scheduleSlotId: values.scheduleSlotId,
        note: values.note || undefined,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  return (
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <SelectField
          name="scheduleId"
          label="เลือกตารางเวลา"
          placeholder="เลือกตารางเวลาเข้างาน..."
          options={scheduleOptions}
          control={methods.control}
          disabled={schedulesQuery.isLoading}
          required
        />

        <SelectField
          name="scheduleSlotId"
          label="เลือกรอบเวลา (Slot)"
          placeholder={
            selectedScheduleId
              ? 'เลือกรอบเวลาที่ต้องการลงชื่อ...'
              : 'กรุณาเลือกตารางเวลาก่อน'
          }
          options={slotOptions}
          control={methods.control}
          disabled={!selectedScheduleId || slotsQuery.isLoading}
          required
        />

        <TextareaField
          name="note"
          label="หมายเหตุ (ถ้ามี)"
          placeholder="ระบุเหตุผลหรือข้อมูลเพิ่มเติม"
          control={methods.control}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <ButtonLoading type="submit" isLoading={checkInMutation.isPending}>
          บันทึกเวลาเข้างาน
        </ButtonLoading>
      </div>
    </form>
  );
}

export default function CheckInAction({ companyId }: CheckInActionProps) {
  const ui = useOverlay();

  const openDialog = () => {
    ui.dialog.open({
      title: 'เช็คชื่อลงเวลาเข้างาน (Check In)',
      description: 'เลือกรอบเวลาและบันทึกเวลาเข้าทำงานประจำวัน',
      children: (
        <CheckInDialogContent
          companyId={companyId}
          onSuccess={() => ui.dialog.close()}
        />
      ),
    });
  };

  return (
    <Button onPress={openDialog}>
      <LogIn className="w-4 h-4 mr-1" />
      ลงชื่อเข้างาน
    </Button>
  );
}
