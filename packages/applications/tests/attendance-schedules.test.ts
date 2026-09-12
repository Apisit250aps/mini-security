import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  ICheckInScheduleRepository,
  IScheduleSlotRepository,
  IAttendanceLogRepository,
} from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import {
  CreateCheckInScheduleUseCase,
  UpdateCheckInScheduleUseCase,
  GetCheckInSchedulesByRoleUseCase,
} from '../src/use-cases/attendance/check-in-schedule.usecase';
import {
  CheckInAttendanceUseCase,
  ManualCheckInAttendanceUseCase,
} from '../src/use-cases/attendance/attendance-log.usecase';
import {
  updateCheckInScheduleSchema,
  updateScheduleSlotSchema,
} from '@repo/domains/schema/attendance';
import { ForbiddenError, ValidationError } from '../src/lib/error';

const companyId = '11111111-1111-4111-8111-111111111111';
const roleA = '22222222-2222-4222-8222-222222222222';
const roleB = '33333333-3333-4333-8333-333333333333';
const memberId = '44444444-4444-4444-8444-444444444444';
const slotId = '55555555-5555-4555-8555-555555555555';
const context = {
  user: { id: memberId, isActive: true },
  activeCompanyId: companyId,
  permissions:
    'attendance_schedule:manage,attendance_schedule:read,attendance:check_in,attendance:manage',
};
const schedule = {
  id: 'schedule-a',
  companyId,
  name: 'Daily',
  roleIds: [roleA],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function fixture(
  options: {
    foreignRole?: boolean;
    inactiveMember?: boolean;
    unassigned?: boolean;
    otherActor?: boolean;
    foreignMember?: boolean;
  } = {},
) {
  let writes = 0;
  const schedules = {
    findById: async () => schedule,
    findByRoleId: async (company: string, role: string) => {
      assert.equal(company, options.foreignMember ? roleB : companyId);
      assert.equal(role, roleA);
      return options.unassigned
        ? []
        : [schedule, { ...schedule, id: 'schedule-b' }];
    },
    create: async (data) => {
      writes++;
      return { ...schedule, ...data };
    },
    update: async (_id, data) => {
      writes++;
      return { ...schedule, ...data };
    },
  } as ICheckInScheduleRepository;
  const roles = {
    findById: async (id: string) => ({
      id,
      companyId: options.foreignRole ? null : companyId,
    }),
  } as IRoleRepository;
  const members = {
    findById: async () => ({
      id: memberId,
      userId: options.otherActor ? roleB : memberId,
      companyId: options.foreignMember ? roleB : companyId,
      roleId: roleA,
      isActive: !options.inactiveMember,
    }),
  } as ICompanyMemberRepository;
  const slots = {
    findById: async () => ({
      id: slotId,
      checkInScheduleId: 'schedule-b',
      label: 'Second schedule slot',
      slotOrder: 1,
      windowStart: '00:00',
      windowEnd: '23:59',
      isRequired: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  } as IScheduleSlotRepository;
  const logs = {
    findByMemberAndSlotAndDate: async () => null,
    upsertLog: async (data) => {
      writes++;
      return {
        ...data,
        id: 'log',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  } as IAttendanceLogRepository;
  return { schedules, roles, members, slots, logs, writes: () => writes };
}

test('one schedule accepts multiple company roles; the same roles may receive another schedule', async () => {
  const f = fixture();
  const uc = new CreateCheckInScheduleUseCase(f.schedules, f.roles);
  const data = {
    companyId,
    name: 'Daily',
    roleIds: [roleA, roleB],
    isActive: true,
  };
  assert.deepEqual((await uc.execute({ ...context, data })).roleIds, [
    roleA,
    roleB,
  ]);
  await uc.execute({ ...context, data: { ...data, name: 'Evening' } });
  assert.equal(f.writes(), 2);
});
test('rejects duplicate role IDs and global/foreign roles before writing', async () => {
  for (const [f, roleIds] of [
    [fixture(), [roleA, roleA]],
    [fixture({ foreignRole: true }), [roleA]],
  ] as const) {
    const uc = new CreateCheckInScheduleUseCase(f.schedules, f.roles);
    await assert.rejects(
      uc.execute({
        ...context,
        data: {
          companyId,
          name: 'Daily',
          roleIds: [...roleIds],
          isActive: true,
        },
      }),
      ValidationError,
    );
    assert.equal(f.writes(), 0);
  }
});
test('roles-only update supports unassigning all roles and authorizes the stored company', async () => {
  const f = fixture();
  const uc = new UpdateCheckInScheduleUseCase(f.schedules, f.roles);
  assert.deepEqual(
    (await uc.execute({ ...context, id: schedule.id, data: { roleIds: [] } }))
      .roleIds,
    [],
  );
  await assert.rejects(
    uc.execute({
      ...context,
      activeCompanyId: roleB,
      id: schedule.id,
      data: { roleIds: [roleB] },
    }),
    ForbiddenError,
  );
  assert.equal(f.writes(), 1);
});
test('company-scoped role lookup returns every assigned schedule', async () => {
  const f = fixture();
  const uc = new GetCheckInSchedulesByRoleUseCase(f.schedules);
  assert.equal(
    (await uc.execute({ ...context, companyId, roleId: roleA })).length,
    2,
  );
  await assert.rejects(
    uc.execute({ ...context, companyId: roleB, roleId: roleA }),
    ForbiddenError,
  );
});
test('self check-in accepts an explicit slot from the second schedule', async () => {
  const f = fixture();
  const uc = new CheckInAttendanceUseCase(
    f.logs,
    f.slots,
    f.schedules,
    f.members,
  );
  const result = await uc.execute({
    ...context,
    companyMemberId: memberId,
    scheduleSlotId: slotId,
  });
  assert.equal(result.scheduleSlotId, slotId);
  assert.equal(result.recordedBy, null);
  assert.equal(f.writes(), 1);
});
for (const options of [
  { unassigned: true },
  { inactiveMember: true },
  { foreignMember: true },
  { otherActor: true },
]) {
  test(`self check-in rejects invalid membership or assignment ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    await assert.rejects(
      new CheckInAttendanceUseCase(
        f.logs,
        f.slots,
        f.schedules,
        f.members,
      ).execute({
        ...context,
        companyMemberId: memberId,
        scheduleSlotId: slotId,
      }),
    );
    assert.equal(f.writes(), 0);
  });
}
test('manual check-in validates assignments and stamps the actual actor', async () => {
  const data = {
    companyMemberId: memberId,
    scheduleSlotId: slotId,
    workDate: '2026-09-12',
    status: 'present' as const,
    recordedBy: roleB,
  };
  const f = fixture();
  const result = await new ManualCheckInAttendanceUseCase(
    f.logs,
    f.members,
    f.slots,
    f.schedules,
  ).execute({ ...context, data });
  assert.equal(result.recordedBy, memberId);
  const denied = fixture({ unassigned: true });
  await assert.rejects(
    new ManualCheckInAttendanceUseCase(
      denied.logs,
      denied.members,
      denied.slots,
      denied.schedules,
    ).execute({ ...context, data }),
    ValidationError,
  );
  assert.equal(denied.writes(), 0);
});

test('partial edits do not silently enable schedules or make slots required', () => {
  assert.deepEqual(updateCheckInScheduleSchema.parse({ roleIds: [] }), {
    roleIds: [],
  });
  assert.deepEqual(updateScheduleSlotSchema.parse({ label: 'New label' }), {
    label: 'New label',
  });
  assert.equal(
    updateCheckInScheduleSchema.safeParse({ companyId: roleB }).success,
    false,
  );
});
test('system default roles remain assignable without changing membership roles', async () => {
  const f = fixture();
  const roles = {
    findById: async () => ({
      id: roleA,
      companyId: null,
      isSystemDefault: true,
    }),
  } as IRoleRepository;
  const result = await new CreateCheckInScheduleUseCase(
    f.schedules,
    roles,
  ).execute({
    ...context,
    data: {
      companyId,
      name: 'Shared default',
      roleIds: [roleA],
      isActive: true,
    },
  });
  assert.deepEqual(result.roleIds, [roleA]);
});

test('leave approval synchronizes every assigned schedule across every leave day', async () => {
  const { ReviewLeaveRequestUseCase } = await import(
    '../src/use-cases/leave/leave-request.usecase'
  );
  const f = fixture();
  const request = {
    id: 'leave',
    companyMemberId: memberId,
    leaveTypeId: 'type',
    status: 'pending',
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    totalDays: 2,
  };
  const requests = {
    findById: async () => request,
    update: async (_id, data) => ({ ...request, ...data }),
  } as import('@repo/domains/repositories/leave').ILeaveRequestRepository;
  const quotas = {
    findByMemberTypeAndYear: async () => null,
  } as import('@repo/domains/repositories/leave').ILeaveQuotaRepository;
  const types = {
    findById: async () => ({ name: 'Annual leave' }),
  } as import('@repo/domains/repositories/leave').ILeaveTypeRepository;
  const slots = {
    findByScheduleId: async (id: string) => [{ id: `${id}-slot` }],
  } as IScheduleSlotRepository;
  const writes: string[] = [];
  const logs = {
    upsertLog: async (data) => {
      assert.equal(data.status, 'excused');
      writes.push(`${data.scheduleSlotId}:${data.workDate}`);
      return {
        ...data,
        id: 'log',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  } as IAttendanceLogRepository;
  await new ReviewLeaveRequestUseCase(
    { transaction: async (work) => work() },
    requests,
    quotas,
    types,
    f.members,
    f.schedules,
    slots,
    logs,
  ).execute({
    ...context,
    permissions: 'leave_request:approve',
    id: 'leave',
    action: 'approved',
  });
  assert.deepEqual(writes.sort(), [
    'schedule-a-slot:2026-09-12',
    'schedule-a-slot:2026-09-13',
    'schedule-b-slot:2026-09-12',
    'schedule-b-slot:2026-09-13',
  ]);
});
