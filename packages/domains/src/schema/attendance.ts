import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  DateField,
  EnumField,
  NumberField,
  StringField,
  UUIDField,
} from '#lib/entity';

/**
 * Enums
 */

export const AttendanceStatusValues = [
  'present',
  'absent',
  'late',
  'excused',
] as const;

export type AttendanceStatus = (typeof AttendanceStatusValues)[number];

/**
 * 1. Check-In Schedule Schema
 */

export const checkInScheduleSchema = BaseEntity({
  // Active assignments, stored in check_in_schedule_roles by the repository.
  roleIds: z
    .array(UUIDField({ required: true }))
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Role assignments must be unique',
    ),
  organizationId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createCheckInScheduleSchema = checkInScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCheckInScheduleSchema = checkInScheduleSchema
  .partial()
  .omit({ id: true, organizationId: true, createdAt: true, updatedAt: true })
  .extend({ isActive: BooleanField({ required: false }) })
  .strict();

export const checkInScheduleRoleSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  checkInScheduleId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});
export type CheckInScheduleRoleEntity = z.infer<
  typeof checkInScheduleRoleSchema
>;

export type CheckInScheduleEntity = z.infer<typeof checkInScheduleSchema>;
export type CreateCheckInSchedule = z.infer<typeof createCheckInScheduleSchema>;
export type UpdateCheckInSchedule = z.infer<typeof updateCheckInScheduleSchema>;

/**
 * 2. Schedule Slot Schema
 */

export const scheduleSlotSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  checkInScheduleId: UUIDField({ required: true }),
  slotOrder: NumberField({ required: true }),
  label: StringField({ required: true }),
  windowStart: StringField({ required: true, max: 10 }), // e.g. "07:00:00"
  windowEnd: StringField({ required: true, max: 10 }), // e.g. "09:00:00"
  isRequired: BooleanField({ default: () => true }),
});

export const createScheduleSlotSchema = scheduleSlotSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateScheduleSlotSchema = scheduleSlotSchema
  .partial()
  .omit({
    id: true,
    organizationId: true,
    checkInScheduleId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ isRequired: BooleanField({ required: false }) })
  .strict();

export type ScheduleSlotEntity = z.infer<typeof scheduleSlotSchema>;
export type CreateScheduleSlot = z.infer<typeof createScheduleSlotSchema>;
export type UpdateScheduleSlot = z.infer<typeof updateScheduleSlotSchema>;

/**
 * 3. Attendance Log Schema
 */

export const attendanceLogSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  organizationMemberId: UUIDField({ required: true }),
  scheduleSlotId: UUIDField({ required: true }),
  workDate: StringField({ required: true, max: 10 }), // "YYYY-MM-DD"
  checkedInAt: DateField({ required: false, nullable: true }),
  status: EnumField(AttendanceStatusValues, { default: () => 'absent' }),
  note: StringField({ required: false, nullable: true, max: 500 }),
  recordedBy: UUIDField({ required: false, nullable: true }),
  locationId: UUIDField({ required: false, nullable: true }),
  checkedInLatitude: NumberField({ required: false, nullable: true }).refine(
    (lat) => lat == null || (lat >= -90 && lat <= 90),
    'Latitude must be between -90 and 90',
  ),
  checkedInLongitude: NumberField({ required: false, nullable: true }).refine(
    (lng) => lng == null || (lng >= -180 && lng <= 180),
    'Longitude must be between -180 and 180',
  ),
  locationNameSnapshot: StringField({
    required: false,
    nullable: true,
    max: 255,
  }),
  locationLatitudeSnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (lat) => lat == null || (lat >= -90 && lat <= 90),
    'Latitude must be between -90 and 90',
  ),
  locationLongitudeSnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (lng) => lng == null || (lng >= -180 && lng <= 180),
    'Longitude must be between -180 and 180',
  ),
  radiusMetersSnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (r) => r == null || (r > 0 && Number.isFinite(r)),
    'Radius must be positive and finite',
  ),
})
  .refine(
    (data) => {
      const fields = [
        data.locationId,
        data.checkedInLatitude,
        data.checkedInLongitude,
        data.locationNameSnapshot,
        data.locationLatitudeSnapshot,
        data.locationLongitudeSnapshot,
        data.radiusMetersSnapshot,
      ];
      const nonNullCount = fields.filter((f) => f != null).length;
      return nonNullCount === 0 || nonNullCount === 7;
    },
    {
      message:
        'Location snapshot fields must either be all provided or all null',
      path: ['locationId'],
    },
  )
  .refine(
    (data) => {
      if (data.locationId != null) {
        return (
          data.checkedInAt != null &&
          (data.status === 'present' || data.status === 'late')
        );
      }
      return true;
    },
    {
      message:
        'Checked in record with location must have checkedInAt and status present or late',
      path: ['status'],
    },
  );

export const createAttendanceLogSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  organizationMemberId: UUIDField({ required: true }),
  scheduleSlotId: UUIDField({ required: true }),
  workDate: StringField({ required: true, max: 10 }),
  checkedInAt: DateField({ required: false, nullable: true }),
  status: EnumField(AttendanceStatusValues, { default: () => 'absent' }),
  note: StringField({ required: false, nullable: true, max: 500 }),
  recordedBy: UUIDField({ required: false, nullable: true }),
  locationId: UUIDField({ required: false, nullable: true }),
  checkedInLatitude: NumberField({ required: false, nullable: true }).refine(
    (lat) => lat == null || (lat >= -90 && lat <= 90),
    'Latitude must be between -90 and 90',
  ),
  checkedInLongitude: NumberField({ required: false, nullable: true }).refine(
    (lng) => lng == null || (lng >= -180 && lng <= 180),
    'Longitude must be between -180 and 180',
  ),
  locationNameSnapshot: StringField({
    required: false,
    nullable: true,
    max: 255,
  }),
  locationLatitudeSnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (lat) => lat == null || (lat >= -90 && lat <= 90),
    'Latitude must be between -90 and 90',
  ),
  locationLongitudeSnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (lng) => lng == null || (lng >= -180 && lng <= 180),
    'Longitude must be between -180 and 180',
  ),
  radiusMetersSnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (r) => r == null || (r > 0 && Number.isFinite(r)),
    'Radius must be positive and finite',
  ),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine(
    (data) => {
      const fields = [
        data.locationId,
        data.checkedInLatitude,
        data.checkedInLongitude,
        data.locationNameSnapshot,
        data.locationLatitudeSnapshot,
        data.locationLongitudeSnapshot,
        data.radiusMetersSnapshot,
      ];
      const nonNullCount = fields.filter((f) => f != null).length;
      return nonNullCount === 0 || nonNullCount === 7;
    },
    {
      message:
        'Location snapshot fields must either be all provided or all null',
      path: ['locationId'],
    },
  )
  .refine(
    (data) => {
      if (data.locationId != null) {
        return (
          data.checkedInAt != null &&
          (data.status === 'present' || data.status === 'late')
        );
      }
      return true;
    },
    {
      message:
        'Checked in record with location must have checkedInAt and status present or late',
      path: ['status'],
    },
  );

export const updateAttendanceLogSchema = z
  .object({
    checkedInAt: DateField({ required: false, nullable: true }),
    status: EnumField(AttendanceStatusValues, { required: false }),
    note: StringField({ required: false, nullable: true, max: 500 }),
    recordedBy: UUIDField({ required: false, nullable: true }),
  })
  .partial()
  .strict();

export type AttendanceLogEntity = z.infer<typeof attendanceLogSchema>;
export type CreateAttendanceLog = z.infer<typeof createAttendanceLogSchema>;
export type UpdateAttendanceLog = z.infer<typeof updateAttendanceLogSchema>;
