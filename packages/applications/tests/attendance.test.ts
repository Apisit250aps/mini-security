import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ScheduleSlot } from '@repo/domains/entities/attendance';
import {
  attendanceClock,
  resolveAttendanceSlot,
} from '../src/use-cases/attendance/attendance-time';
import { ValidationError } from '../src/lib/error';

const slot = (id: string, start: string, end: string): ScheduleSlot => ({
  id,
  checkInScheduleId: 'schedule',
  slotOrder: 1,
  label: id,
  windowStart: start,
  windowEnd: end,
  isRequired: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
const morning = slot('morning', '08:00', '09:00');
const afternoon = slot('afternoon', '13:00:00', '14:00:00');
const at = (time: string) => new Date(`2026-09-06T${time}+07:00`);

for (const [time, status] of [
  ['08:00:00', 'present'],
  ['08:59:59', 'present'],
  ['09:00:00', 'present'],
  ['09:00:01', 'late'],
  ['10:00:00', 'late'],
] as const) {
  test(`${time} is ${status}`, () => {
    assert.equal(
      resolveAttendanceSlot([morning], at(time), morning.id).status,
      status,
    );
  });
}
test('uses Bangkok work date across UTC midnight', () => {
  assert.equal(attendanceClock(at('00:01:00')).workDate, '2026-09-06');
  assert.equal(attendanceClock(at('00:01:00')).seconds, 60);
});
test('selects current window or most recently opened slot regardless of repository order', () => {
  assert.equal(
    resolveAttendanceSlot([afternoon, morning], at('10:00:00')).slot.id,
    'morning',
  );
  assert.equal(
    resolveAttendanceSlot([morning, afternoon], at('13:30:00')).slot.id,
    'afternoon',
  );
  const result = resolveAttendanceSlot([morning, afternoon], at('15:00:00'));
  assert.equal(result.slot.id, 'afternoon');
  assert.equal(result.status, 'late');
});
test('rejects invalid explicit slot rather than silently choosing another', () => {
  assert.throws(
    () => resolveAttendanceSlot([morning], at('09:00:00'), 'unknown'),
    ValidationError,
  );
});
test('rejects check-in before opening instead of marking future rounds present', () => {
  assert.throws(
    () => resolveAttendanceSlot([morning], at('07:00:00')),
    ValidationError,
  );
  assert.throws(
    () =>
      resolveAttendanceSlot([morning, afternoon], at('09:00:00'), afternoon.id),
    ValidationError,
  );
});
test('rejects malformed or overnight windows instead of computing a wrong status', () => {
  assert.throws(
    () =>
      resolveAttendanceSlot([slot('bad', '99:00', '10:00')], at('09:00:00')),
    ValidationError,
  );
  assert.throws(
    () =>
      resolveAttendanceSlot([slot('night', '22:00', '06:00')], at('23:00:00')),
    ValidationError,
  );
});

test('check-in persists calculated late status and Bangkok date, and prevents a duplicate', async (t) => {
  const { CheckInAttendanceUseCase } = await import(
    '../src/use-cases/attendance/attendance-log.usecase'
  );
  const { DuplicateError } = await import('../src/lib/error');
  t.mock.timers.enable({ apis: ['Date'], now: at('10:00:00') });
  let stored: import('@repo/domains/entities/attendance').AttendanceLog | null =
    null;
  const logs = {
    findByMemberAndSlotAndDate: async (
      _member: string,
      slotId: string,
      workDate: string,
    ) => {
      assert.equal(slotId, morning.id);
      assert.equal(workDate, '2026-09-06');
      return stored;
    },
    upsertLog: async (
      data: import('@repo/domains/schema/attendance').CreateAttendanceLog,
    ) => {
      stored = {
        ...data,
        id: 'log',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return stored;
    },
  } as import('@repo/domains/repositories/attendance').IAttendanceLogRepository;
  const slots = {
    findByScheduleId: async () => [morning],
  } as import('@repo/domains/repositories/attendance').IScheduleSlotRepository;
  const schedules = {
    findByRoleId: async () => ({ id: 'schedule', isActive: true }),
  } as import('@repo/domains/repositories/attendance').ICheckInScheduleRepository;
  const members = {
    findById: async () => ({ id: 'member', roleId: 'role' }),
  } as import('@repo/domains/repositories/company').ICompanyMemberRepository;
  const useCase = new CheckInAttendanceUseCase(logs, slots, schedules, members);
  const context = {
    companyMemberId: 'member',
    user: { id: 'actor', isAdmin: true, isActive: true },
  };
  const result = await useCase.execute(context);
  assert.equal(result.status, 'late');
  assert.equal(result.checkedInAt?.toISOString(), at('10:00:00').toISOString());
  await assert.rejects(useCase.execute(context), DuplicateError);
});
