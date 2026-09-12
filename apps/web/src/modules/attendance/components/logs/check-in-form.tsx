'use client';

import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextareaField } from '@repo/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Field, FieldLabel, FieldGroup } from '@repo/ui/components/field';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Button } from '@repo/ui/components/button';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useHasPermission } from '@/modules/auth/hooks/permission-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import {
  useRoleSchedulesQueries,
  useAssignedScheduleSlotsQueries,
  useMemberAttendanceLogsQueries,
} from '../../hooks/attendance-queries';
import { useAttendanceCheckIn } from '../../hooks/attendance-mutations';
import { formatDate, formatTime } from '@/shared/utils/date';
import {
  getDefaultSlotId,
  getSlotState,
  getWorkDate,
} from '../../utils/check-in-slot';

const statusLabels = {
  present: 'มาตรงเวลา',
  late: 'มาสาย',
  absent: 'ขาดงาน',
  excused: 'ลา/มีเหตุจำเป็น',
};

export default function CheckInForm({
  companyId,
  onSuccess,
}: {
  companyId: string;
  onSuccess?: () => void;
}) {
  const slotInputId = useId();
  const { data: session } = useSession();
  const canCheckIn = useHasPermission('attendance:check_in');
  const members = useCompanyMembersQueries(companyId);
  const matchingMembers =
    members.data?.filter(
      (item) => item.userId === session?.user.id && item.isActive,
    ) ?? [];
  const member = matchingMembers.length === 1 ? matchingMembers[0] : undefined;
  const schedule = useRoleSchedulesQueries(companyId, member?.roleId);
  const schedules = schedule.data ?? [];
  const slots = useAssignedScheduleSlotsQueries(schedules);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const initial = setTimeout(() => setNow(new Date()), 0);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);
  const workDate = now ? getWorkDate(now) : undefined;
  const logs = useMemberAttendanceLogsQueries(now ? member?.id : undefined, {
    workDate,
  });
  const mutation = useAttendanceCheckIn(companyId);
  const methods = useForm({ defaultValues: { note: '' } });
  const [selection, setSelection] = useState<{
    scope: string;
    id: string;
  } | null>(null);
  const scope = `${companyId}:${member?.id}:${schedules.map((item) => item.id).join(',')}:${workDate}`;
  const recordedIds = new Set(
    logs.data
      ?.filter((log) => Boolean(log.checkedInAt))
      .map((log) => log.scheduleSlotId),
  );
  const defaultId =
    now && schedules.length === 1
      ? getDefaultSlotId(slots.data ?? [], now, recordedIds)
      : '';
  const selectedId =
    selection?.scope === scope &&
    slots.data?.some((slot) => slot.id === selection.id)
      ? selection.id
      : defaultId;
  const selectedSlot = slots.data?.find((slot) => slot.id === selectedId);
  const state = selectedSlot && now ? getSlotState(selectedSlot, now) : null;
  const recorded = recordedIds.has(selectedId);

  const loading =
    !now ||
    members.isLoading ||
    schedule.isLoading ||
    slots.isLoading ||
    logs.isLoading;
  const error =
    members.isError || schedule.isError || slots.isError || logs.isError;
  if (loading) return <p role="status">กำลังโหลดข้อมูลลงเวลางาน...</p>;
  if (error)
    return (
      <div role="alert" className="flex flex-col gap-3">
        <p>โหลดข้อมูลลงเวลาไม่สำเร็จ กรุณาลองอีกครั้ง</p>
        <Button
          variant="outline"
          onPress={() => {
            void members.refetch();
            void schedule.refetch();
            void slots.refetch();
            void logs.refetch();
          }}
        >
          ลองอีกครั้ง
        </Button>
      </div>
    );
  if (matchingMembers.length > 1)
    return <p role="alert">พบสมาชิกซ้ำในบริษัทนี้ กรุณาติดต่อผู้ดูแลระบบ</p>;
  if (!member)
    return (
      <p>
        ไม่พบสมาชิกที่เปิดใช้งานสำหรับบัญชีของคุณในบริษัทนี้
        กรุณาติดต่อผู้ดูแลระบบ
      </p>
    );
  if (!schedules.length)
    return <p>ยังไม่มีตารางลงเวลาที่เปิดใช้งานสำหรับบทบาทของคุณ</p>;
  if (!slots.data?.length)
    return <p>ยังไม่มีรอบลงเวลา กรุณาติดต่อผู้ดูแลระบบ</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium">{session?.user.name}</p>
        <p>
          {formatDate(now)} · {formatTime(now)}
        </p>
        <p className="text-sm text-muted-foreground">
          {schedules.length} ตารางที่ได้รับมอบหมาย · เวลาไทย
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {schedules.map((item) => (
          <section
            key={item.id}
            className="flex flex-col gap-2 rounded-lg border p-3"
            aria-label={item.name}
          >
            <h2 className="font-semibold">{item.name}</h2>
            {slots.data.filter((slot) => slot.checkInScheduleId === item.id)
              .length ? (
              slots.data
                .filter((slot) => slot.checkInScheduleId === item.id)
                .map((slot) => (
                  <p key={slot.id} className="text-sm">
                    {slot.label} · {slot.windowStart} – {slot.windowEnd} ·{' '}
                    {slot.isRequired ? 'บังคับ' : 'ไม่บังคับ'} ·{' '}
                    {recordedIds.has(slot.id) ? 'ลงชื่อแล้ว' : 'ยังไม่ลงชื่อ'}
                  </p>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">
                ยังไม่มีรอบเวลา กรุณาติดต่อผู้ดูแลระบบ
              </p>
            )}
          </section>
        ))}
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={methods.handleSubmit((values) => {
          if (
            !canCheckIn ||
            !selectedSlot ||
            recorded ||
            state === 'upcoming' ||
            state === 'unavailable' ||
            mutation.isPending
          )
            return;
          mutation.mutate(
            {
              companyMemberId: member.id,
              scheduleSlotId: selectedSlot.id,
              note: values.note || undefined,
            },
            {
              onSuccess: () => {
                methods.reset();
                setSelection(null);
                onSuccess?.();
              },
            },
          );
        })}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={slotInputId}>รอบลงเวลา</FieldLabel>
            <Select
              aria-label="รอบลงเวลา"
              placeholder="เลือกรอบลงเวลา"
              selectedKey={selectedId || null}
              onSelectionChange={(key) =>
                setSelection(key ? { scope, id: String(key) } : null)
              }
              isDisabled={mutation.isPending}
            >
              <SelectTrigger id={slotInputId}>
                <SelectValue>
                  {selectedSlot
                    ? `${selectedSlot.scheduleName} · ${selectedSlot.label}`
                    : 'เลือกรอบลงเวลา'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {schedules.map((item) => (
                  <SelectGroup key={item.id}>
                    <SelectLabel>{item.name}</SelectLabel>
                    {slots.data
                      .filter((slot) => slot.checkInScheduleId === item.id)
                      .map((slot) => (
                        <SelectItem
                          key={slot.id}
                          id={slot.id}
                          textValue={`${item.name} · ${slot.label}`}
                        >
                          {slot.label} ({slot.windowStart} – {slot.windowEnd})
                          {slot.isRequired ? ' · บังคับ' : ' · ไม่บังคับ'}
                          {recordedIds.has(slot.id) ? ' · ลงชื่อแล้ว' : ''}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <p className="text-sm text-muted-foreground">
            ทุกตารางที่ได้รับมอบหมายมีผลร่วมกัน
            เลือกรอบที่ต้องการลงเวลาให้ชัดเจน แม้เวลาแต่ละตารางจะทับกัน
          </p>
          <p role="status">
            {recorded
              ? 'คุณลงชื่อรอบนี้แล้ว'
              : state === 'late'
                ? 'ลงชื่อตอนนี้จะบันทึกเป็น “มาสาย”'
                : state === 'upcoming'
                  ? 'ยังไม่ถึงเวลาเปิดรอบ'
                  : state === 'unavailable'
                    ? 'รอบนี้ยังไม่รองรับการลงเวลา'
                    : selectedSlot
                      ? 'อยู่ในช่วงเวลาลงชื่อ'
                      : slots.data.every((slot) => recordedIds.has(slot.id))
                        ? 'ลงชื่อครบทุกรอบแล้ว'
                        : 'กรุณาเลือกรอบลงเวลา'}
          </p>
          <TextareaField
            name="note"
            label="หมายเหตุ (ถ้ามี)"
            control={methods.control}
          />
        </FieldGroup>
        {!canCheckIn && (
          <p role="alert">คุณไม่มีสิทธิ์ลงเวลาเข้างาน กรุณาติดต่อผู้ดูแลระบบ</p>
        )}
        <ButtonLoading
          type="submit"
          isLoading={mutation.isPending}
          isDisabled={
            !canCheckIn ||
            !selectedSlot ||
            recorded ||
            state === 'upcoming' ||
            state === 'unavailable'
          }
        >
          ลงเวลาเข้างาน
        </ButtonLoading>
      </form>
      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">การลงเวลาของคุณวันนี้</h2>
        {logs.data?.length ? (
          logs.data.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap justify-between gap-2 rounded-lg border p-3"
            >
              <span>
                {slots.data.find((slot) => slot.id === log.scheduleSlotId)
                  ?.scheduleName ?? 'ตารางเดิม'}{' '}
                ·{' '}
                {slots.data.find((slot) => slot.id === log.scheduleSlotId)
                  ?.label ?? 'รอบลงเวลา'}
              </span>
              <span>
                {formatTime(log.checkedInAt)} · {statusLabels[log.status]}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            ยังไม่มีรายการลงเวลาวันนี้
          </p>
        )}
      </section>
    </div>
  );
}
