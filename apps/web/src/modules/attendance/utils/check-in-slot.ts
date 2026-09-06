import { formatTime } from '@repo/ui/lib/date';

type Slot = {
  id: string;
  slotOrder: number;
  windowStart: string;
  windowEnd: string;
};

export function getWorkDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

const seconds = (value: string) => {
  const [hour = 0, minute = 0, second = 0] = value.split(':').map(Number);
  return hour * 3600 + minute * 60 + second;
};

export function getSlotState(slot: Slot, now: Date) {
  const validTime = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
  if (!validTime.test(slot.windowStart) || !validTime.test(slot.windowEnd))
    return 'unavailable';
  const current = seconds(formatTime(now, 'en-GB'));
  const start = seconds(slot.windowStart);
  const end = seconds(slot.windowEnd);
  if (end < start) return 'unavailable';
  if (current < start) return 'upcoming';
  return current > end ? 'late' : 'present';
}

/** Prefer an open, unrecorded round, then the latest missed round, then the next round. */
export function getDefaultSlotId(
  slots: Slot[],
  now: Date,
  recordedIds: Set<string>,
): string {
  const available = slots
    .filter(
      (slot) =>
        !recordedIds.has(slot.id) && getSlotState(slot, now) !== 'unavailable',
    )
    .sort(
      (a, b) =>
        seconds(a.windowStart) - seconds(b.windowStart) ||
        a.slotOrder - b.slotOrder,
    );
  return (
    (
      available.find((slot) => getSlotState(slot, now) === 'present') ??
      available.filter((slot) => getSlotState(slot, now) === 'late').at(-1) ??
      available[0]
    )?.id ?? ''
  );
}
