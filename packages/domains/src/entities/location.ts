import type {
  LocationEntity,
  ScheduleSlotLocationEntity,
} from '#schema/location';

export class Location implements LocationEntity {
  id: string;
  organizationId: string;
  siteId: string;
  isPrimary: boolean;
  isActive: boolean;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: LocationEntity) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.siteId = data.siteId;
    this.isPrimary = data.isPrimary;
    this.isActive = data.isActive;
    this.name = data.name;
    this.address = data.address;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.radiusMeters = data.radiusMeters;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class ScheduleSlotLocation implements ScheduleSlotLocationEntity {
  id: string;
  organizationId: string;
  scheduleSlotId: string;
  locationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ScheduleSlotLocationEntity) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.scheduleSlotId = data.scheduleSlotId;
    this.locationId = data.locationId;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
