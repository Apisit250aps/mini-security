import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getDefaultSlotId,
  getSlotState,
  getWorkDate,
} from '../src/modules/attendance/utils/check-in-slot';
const morning = {
  id: 'am',
  slotOrder: 1,
  windowStart: '08:00',
  windowEnd: '09:00',
};
const afternoon = {
  id: 'pm',
  slotOrder: 2,
  windowStart: '13:00:00',
  windowEnd: '14:00:00',
};
const at = (time: string) => new Date(`2026-09-06T${time}+07:00`);
test('default follows Bangkok time and unrecorded rounds', () => {
  assert.equal(
    getDefaultSlotId([afternoon, morning], at('08:30:00'), new Set()),
    'am',
  );
  assert.equal(
    getDefaultSlotId([morning, afternoon], at('10:00:00'), new Set()),
    'am',
  );
  assert.equal(
    getDefaultSlotId([morning, afternoon], at('13:30:00'), new Set()),
    'pm',
  );
  assert.equal(
    getDefaultSlotId([morning, afternoon], at('08:30:00'), new Set(['am'])),
    'pm',
  );
  assert.equal(
    getDefaultSlotId(
      [morning, afternoon],
      at('15:00:00'),
      new Set(['am', 'pm']),
    ),
    '',
  );
  assert.equal(getDefaultSlotId([], at('08:30:00'), new Set()), '');
});
test('preview matches backend deadline, opening and unsupported overnight rules', () => {
  assert.equal(getSlotState(morning, at('07:59:59')), 'upcoming');
  assert.equal(getSlotState(morning, at('09:00:00')), 'present');
  assert.equal(getSlotState(morning, at('09:00:01')), 'late');
  assert.equal(
    getSlotState(
      { ...morning, windowStart: '22:00', windowEnd: '06:00' },
      at('23:00:00'),
    ),
    'unavailable',
  );
  assert.equal(getWorkDate(at('00:01:00')), '2026-09-06');
});
