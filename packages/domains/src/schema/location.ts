import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  NumberField,
  StringField,
  UUIDField,
} from '#lib/entity';

// ==========================================
// 1. Location Schema
// ==========================================

export const locationSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  companyBranchId: UUIDField({ required: true }),
  isPrimary: BooleanField({ default: () => false }),
  isActive: BooleanField({ default: () => true }),
  name: StringField({ required: true, max: 255 }),
  address: StringField({ required: true, max: 500 }),
  latitude: NumberField({ required: true }).refine(
    (lat) => lat >= -90 && lat <= 90,
    'Latitude must be between -90 and 90',
  ),
  longitude: NumberField({ required: true }).refine(
    (lng) => lng >= -180 && lng <= 180,
    'Longitude must be between -180 and 180',
  ),
  radiusMeters: NumberField({ required: true }).refine(
    (r) => r > 0 && Number.isFinite(r),
    'Radius in meters must be greater than 0 and finite',
  ),
}).refine((data) => !data.isPrimary || data.isActive, {
  message: 'Primary location must be active',
  path: ['isPrimary'],
});

export const createLocationSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  companyBranchId: UUIDField({ required: true }),
  isPrimary: BooleanField({ default: () => false }),
  isActive: BooleanField({ default: () => true }),
  name: StringField({ required: true, max: 255 }),
  address: StringField({ required: true, max: 500 }),
  latitude: NumberField({ required: true }).refine(
    (lat) => lat >= -90 && lat <= 90,
    'Latitude must be between -90 and 90',
  ),
  longitude: NumberField({ required: true }).refine(
    (lng) => lng >= -180 && lng <= 180,
    'Longitude must be between -180 and 180',
  ),
  radiusMeters: NumberField({ required: true }).refine(
    (r) => r > 0 && Number.isFinite(r),
    'Radius in meters must be greater than 0 and finite',
  ),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => !data.isPrimary || data.isActive, {
    message: 'Primary location must be active',
    path: ['isPrimary'],
  });

export const updateLocationSchema = z
  .object({
    name: StringField({ required: false, max: 255 }),
    address: StringField({ required: false, max: 500 }),
    latitude: NumberField({ required: false })
      .refine(
        (lat) => lat === undefined || (lat >= -90 && lat <= 90),
        'Latitude must be between -90 and 90',
      )
      .optional(),
    longitude: NumberField({ required: false })
      .refine(
        (lng) => lng === undefined || (lng >= -180 && lng <= 180),
        'Longitude must be between -180 and 180',
      )
      .optional(),
    radiusMeters: NumberField({ required: false })
      .refine(
        (r) => r === undefined || (r > 0 && Number.isFinite(r)),
        'Radius in meters must be greater than 0 and finite',
      )
      .optional(),
    isPrimary: BooleanField({ required: false }),
    isActive: BooleanField({ required: false }),
  })
  .strict();

export type LocationEntity = z.infer<typeof locationSchema>;
export type CreateLocation = z.infer<typeof createLocationSchema>;
export type UpdateLocation = z.infer<typeof updateLocationSchema>;

// ==========================================
// 2. Schedule Slot Location Schema
// ==========================================

export const scheduleSlotLocationSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  scheduleSlotId: UUIDField({ required: true }),
  locationId: UUIDField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createScheduleSlotLocationSchema = scheduleSlotLocationSchema.omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const updateScheduleSlotLocationSchema = scheduleSlotLocationSchema
  .partial()
  .omit({
    id: true,
    companyId: true,
    scheduleSlotId: true,
    locationId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ isActive: BooleanField({ required: false }) })
  .strict();

export type ScheduleSlotLocationEntity = z.infer<
  typeof scheduleSlotLocationSchema
>;
export type CreateScheduleSlotLocation = z.infer<
  typeof createScheduleSlotLocationSchema
>;
export type UpdateScheduleSlotLocation = z.infer<
  typeof updateScheduleSlotLocationSchema
>;
