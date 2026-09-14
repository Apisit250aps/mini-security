import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  ILocationRepository,
  IScheduleSlotLocationRepository,
} from '@repo/domains/repositories/location';
import type {
  IScheduleSlotRepository,
  IAttendanceLogRepository,
  ICheckInScheduleRepository,
} from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  Location,
  ScheduleSlotLocation,
} from '@repo/domains/entities/location';
import {
  GetSlotLocationAssignmentsUseCase,
  GetSlotLocationsUseCase,
  AssignSlotLocationUseCase,
  UpdateSlotLocationUseCase,
} from '../src/use-cases/location/location.usecase';
import { CheckInAttendanceUseCase } from '../src/use-cases/attendance/attendance-log.usecase';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../src/lib/error';

const companyId = '11111111-1111-4111-8111-111111111111';
const locationId = '22222222-2222-4222-8222-222222222222';
const slotId = '33333333-3333-4333-8333-333333333333';
const context = {
  user: { id: 'actor', isActive: true },
  activeCompanyId: companyId,
  permissions:
    'attendance_schedule:read,attendance_schedule:manage,attendance:check_in',
};
const slot = {
  id: slotId,
  companyId,
  checkInScheduleId: 'schedule',
  label: 'All day',
  slotOrder: 1,
  windowStart: '00:00',
  windowEnd: '23:59:59',
  isRequired: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const assignment: ScheduleSlotLocation = {
  id: 'assignment',
  companyId,
  scheduleSlotId: slotId,
  locationId,
  isActive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const location: Location = {
  id: locationId,
  companyId,
  companyBranchId: 'branch',
  name: 'Test office',
  address: 'Test',
  latitude: 13.75,
  longitude: 100.5,
  radiusMeters: 100,
  isActive: true,
  isPrimary: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

test('slot settings returns inactive assignments and enforces the stored slot company', async () => {
  let reads = 0;
  const repo = {
    findBySlotId: async () => {
      reads++;
      return [assignment];
    },
  } as IScheduleSlotLocationRepository;
  const slots = { findById: async () => slot } as IScheduleSlotRepository;
  const useCase = new GetSlotLocationAssignmentsUseCase(repo, slots);
  assert.deepEqual(
    await useCase.execute({ ...context, scheduleSlotId: slotId }),
    [assignment],
  );
  await assert.rejects(
    useCase.execute({
      ...context,
      activeCompanyId: 'foreign',
      scheduleSlotId: slotId,
    }),
    ForbiddenError,
  );
  await assert.rejects(
    useCase.execute({ ...context, permissions: '', scheduleSlotId: slotId }),
    ForbiddenError,
  );
  assert.equal(reads, 1);
  await assert.rejects(
    new GetSlotLocationAssignmentsUseCase(repo, {
      findById: async () => null,
    } as IScheduleSlotRepository).execute({
      ...context,
      scheduleSlotId: slotId,
    }),
    NotFoundError,
  );
});

test('reactivates the same assignment and rejects updates from another company', async () => {
  let writes = 0;
  const repo = {
    findById: async () => assignment,
    update: async (id, data) => {
      writes++;
      assert.equal(id, assignment.id);
      return { ...assignment, ...data };
    },
  } as IScheduleSlotLocationRepository;
  const useCase = new UpdateSlotLocationUseCase(repo);
  assert.equal(
    (
      await useCase.execute({
        ...context,
        id: assignment.id,
        data: { isActive: true },
      })
    ).isActive,
    true,
  );
  await assert.rejects(
    useCase.execute({
      ...context,
      activeCompanyId: 'foreign',
      id: assignment.id,
      data: { isActive: true },
    }),
    ForbiddenError,
  );
  assert.equal(writes, 1);
});

function checkInFixture(
  assignments: ScheduleSlotLocation[],
  allowed: Location[],
) {
  let writes = 0;
  const useCase = new CheckInAttendanceUseCase(
    {
      findByMemberAndSlotAndDate: async () => null,
      upsertLog: async (data) => {
        writes++;
        return { ...data, id: 'log' };
      },
    } as IAttendanceLogRepository,
    { findById: async () => slot } as IScheduleSlotRepository,
    {
      findByRoleId: async () => [{ id: 'schedule', isActive: true }],
    } as ICheckInScheduleRepository,
    {
      findById: async () => ({
        id: 'member',
        userId: 'actor',
        roleId: 'role',
        companyId,
        isActive: true,
      }),
    } as ICompanyMemberRepository,
    {
      findBySlotId: async () => assignments,
      findActiveLocationsBySlotId: async () => allowed,
    } as IScheduleSlotLocationRepository,
  );
  return { useCase, writes: () => writes };
}
const checkIn = {
  ...context,
  companyMemberId: 'member',
  scheduleSlotId: slotId,
};

test('slot without any assignments preserves check-in without GPS', async () => {
  const fixture = checkInFixture([], []);
  const result = await fixture.useCase.execute(checkIn);
  assert.equal(result.locationId, null);
  assert.equal(fixture.writes(), 1);
});

test('assigned slot with every location disabled rejects rather than bypassing GPS', async () => {
  const fixture = checkInFixture([assignment], []);
  await assert.rejects(
    fixture.useCase.execute(checkIn),
    /No active permitted location/,
  );
  assert.equal(fixture.writes(), 0);
});

test('enabled geofence rejects missing and outside GPS then retains source inputs for inside GPS', async () => {
  const fixture = checkInFixture(
    [{ ...assignment, isActive: true }],
    [location],
  );
  await assert.rejects(fixture.useCase.execute(checkIn), ValidationError);
  await assert.rejects(
    fixture.useCase.execute({ ...checkIn, latitude: 0, longitude: 0 }),
    ValidationError,
  );
  const result = await fixture.useCase.execute({
    ...checkIn,
    latitude: location.latitude,
    longitude: location.longitude,
  });
  assert.equal(result.locationId, locationId);
  assert.equal(result.radiusMetersSnapshot, location.radiusMeters);
  assert.equal(result.checkedInLatitude, location.latitude);
  assert.equal(fixture.writes(), 1);
});

test('assignment rejects foreign resources even when the submitted company is the active company', async () => {
  const repo = {
    findBySlotAndLocation: async () => {
      throw new Error('Must not read foreign assignments');
    },
  } as IScheduleSlotLocationRepository;
  const useCase = new AssignSlotLocationUseCase(
    repo,
    {
      findById: async () => ({ ...slot, companyId: 'foreign' }),
    } as IScheduleSlotRepository,
    { findById: async () => location } as ILocationRepository,
  );
  await assert.rejects(
    useCase.execute({
      ...context,
      data: { companyId, scheduleSlotId: slotId, locationId, isActive: true },
    }),
    ForbiddenError,
  );
});

test('check-in location lookup rejects a slot outside the active company', async () => {
  const useCase = new GetSlotLocationsUseCase(
    {
      findActiveLocationsBySlotId: async () => {
        throw new Error('Must not read foreign locations');
      },
    } as IScheduleSlotLocationRepository,
    {
      findById: async () => ({ ...slot, companyId: 'foreign' }),
    } as IScheduleSlotRepository,
  );
  await assert.rejects(
    useCase.execute({
      ...context,
      permissions: 'attendance:read',
      scheduleSlotId: slotId,
    }),
    ForbiddenError,
  );
});
