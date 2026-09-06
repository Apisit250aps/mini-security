import type { ScheduleSlot } from '@repo/domains/entities/attendance';
import { ValidationError } from '../../lib/error';

const bangkokClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function attendanceClock(now: Date) {
  const parts = bangkokClock.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)!.value;
  return {
    workDate: `${part('year')}-${part('month')}-${part('day')}`,
    seconds:
      Number(part('hour')) * 3600 +
      Number(part('minute')) * 60 +
      Number(part('second')),
  };
}

function timeSeconds(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
    throw new ValidationError(
      'Invalid schedule time; expected HH:mm or HH:mm:ss',
    );
  }
  const [hours = 0, minutes = 0, seconds = 0] = value.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

/** The window end is the inclusive on-time deadline, in Bangkok time. */
export function resolveAttendanceSlot(
  slots: ScheduleSlot[],
  now: Date,
  slotId?: string,
) {
  const clock = attendanceClock(now);
  const windows = slots
    .map((slot) => {
      const start = timeSeconds(slot.windowStart);
      const end = timeSeconds(slot.windowEnd);
      if (end < start)
        throw new ValidationError(
          'Overnight attendance windows are not supported',
        );
      return { slot, start, end };
    })
    .sort((a, b) => a.start - b.start || a.slot.slotOrder - b.slot.slotOrder);
  const target = slotId
    ? windows.find((w) => w.slot.id === slotId)
    : (windows.find(
        (w) => clock.seconds >= w.start && clock.seconds <= w.end,
      ) ?? windows.filter((w) => clock.seconds >= w.start).at(-1));
  if (!target)
    throw new ValidationError(
      'No matching attendance slot; select a valid slot after its opening time',
    );
  if (clock.seconds < target.start)
    throw new ValidationError('Attendance window has not opened yet');
  return {
    slot: target.slot,
    workDate: clock.workDate,
    status:
      clock.seconds > target.end ? ('late' as const) : ('present' as const),
  };
}
