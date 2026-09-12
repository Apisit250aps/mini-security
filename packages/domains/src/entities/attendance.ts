import type {
  AttendanceLogEntity,
  AttendanceStatus,
  CheckInScheduleEntity,
  CheckInScheduleRoleEntity,
  ScheduleSlotEntity,
} from '#schema/attendance';

export class CheckInSchedule implements CheckInScheduleEntity {
  id: string;
  roleIds: string[];
  companyId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CheckInScheduleEntity) {
    this.id = data.id;
    this.roleIds = data.roleIds;
    this.companyId = data.companyId;
    this.name = data.name;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class ScheduleSlot implements ScheduleSlotEntity {
  id: string;
  checkInScheduleId: string;
  slotOrder: number;
  label: string;
  windowStart: string;
  windowEnd: string;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: ScheduleSlotEntity) {
    this.id = data.id;
    this.checkInScheduleId = data.checkInScheduleId;
    this.slotOrder = data.slotOrder;
    this.label = data.label;
    this.windowStart = data.windowStart;
    this.windowEnd = data.windowEnd;
    this.isRequired = data.isRequired;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AttendanceLog implements AttendanceLogEntity {
  id: string;
  companyMemberId: string;
  scheduleSlotId: string;
  workDate: string;
  checkedInAt?: Date | null;
  status: AttendanceStatus;
  note?: string | null;
  recordedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AttendanceLogEntity) {
    this.id = data.id;
    this.companyMemberId = data.companyMemberId;
    this.scheduleSlotId = data.scheduleSlotId;
    this.workDate = data.workDate;
    this.checkedInAt = data.checkedInAt;
    this.status = data.status;
    this.note = data.note;
    this.recordedBy = data.recordedBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class CheckInScheduleRole implements CheckInScheduleRoleEntity {
  id: string;
  companyId: string;
  checkInScheduleId: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CheckInScheduleRoleEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.checkInScheduleId = data.checkInScheduleId;
    this.roleId = data.roleId;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
