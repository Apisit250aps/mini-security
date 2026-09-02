import type {
  AttendanceCheckpointEntity,
  AttendanceLocationEntity,
  AttendanceLogEntity,
  AttendancePolicyEntity,
  AttendanceRecordEntity,
  AttendanceStatus,
  CheckpointLocationEntity,
  CheckType,
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
  LocationType,
  RoleAttendancePolicyEntity,
  RoleWorkScheduleEntity,
  WorkScheduleEntity,
  WorkShiftEntity,
} from '#schema/attendance';

export class WorkSchedule implements WorkScheduleEntity {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: WorkScheduleEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class WorkShift implements WorkShiftEntity {
  id: string;
  workScheduleId: string;
  companyId: string;
  name: string;
  startTime: string;
  endTime: string;
  isOvernight: boolean;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: WorkShiftEntity) {
    this.id = data.id;
    this.workScheduleId = data.workScheduleId;
    this.companyId = data.companyId;
    this.name = data.name;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.isOvernight = data.isOvernight;
    this.color = data.color;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AttendancePolicy implements AttendancePolicyEntity {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AttendancePolicyEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AttendanceCheckpoint implements AttendanceCheckpointEntity {
  id: string;
  policyId: string;
  checkType: CheckType;
  label: string;
  orderIndex: number;
  isRequired: boolean;
  windowStart?: string | null;
  windowEnd?: string | null;
  graceMinutes?: number | null;
  requirePhoto: boolean;
  requireLocation: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AttendanceCheckpointEntity) {
    this.id = data.id;
    this.policyId = data.policyId;
    this.checkType = data.checkType;
    this.label = data.label;
    this.orderIndex = data.orderIndex;
    this.isRequired = data.isRequired;
    this.windowStart = data.windowStart;
    this.windowEnd = data.windowEnd;
    this.graceMinutes = data.graceMinutes;
    this.requirePhoto = data.requirePhoto;
    this.requireLocation = data.requireLocation;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class RoleAttendancePolicy implements RoleAttendancePolicyEntity {
  id: string;
  roleId: string;
  policyId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RoleAttendancePolicyEntity) {
    this.id = data.id;
    this.roleId = data.roleId;
    this.policyId = data.policyId;
    this.companyId = data.companyId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AttendanceLocation implements AttendanceLocationEntity {
  id: string;
  companyId: string;
  branchId?: string | null;
  name: string;
  locationType: LocationType;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AttendanceLocationEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.branchId = data.branchId;
    this.name = data.name;
    this.locationType = data.locationType;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.radiusMeters = data.radiusMeters;
    this.address = data.address;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class CheckpointLocation implements CheckpointLocationEntity {
  id: string;
  checkpointId: string;
  locationId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CheckpointLocationEntity) {
    this.id = data.id;
    this.checkpointId = data.checkpointId;
    this.locationId = data.locationId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class RoleWorkSchedule implements RoleWorkScheduleEntity {
  id: string;
  roleId: string;
  companyId: string;
  workShiftId: string;
  effectiveDate: Date;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RoleWorkScheduleEntity) {
    this.id = data.id;
    this.roleId = data.roleId;
    this.companyId = data.companyId;
    this.workShiftId = data.workShiftId;
    this.effectiveDate = data.effectiveDate;
    this.endDate = data.endDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AttendanceRecord implements AttendanceRecordEntity {
  id: string;
  companyId: string;
  companyMemberId: string;
  workShiftId: string;
  workDate: Date;
  status: AttendanceStatus;
  totalWorkMinutes?: number | null;
  overtimeMinutes?: number | null;
  lateMinutes?: number | null;
  note?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AttendanceRecordEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.companyMemberId = data.companyMemberId;
    this.workShiftId = data.workShiftId;
    this.workDate = data.workDate;
    this.status = data.status;
    this.totalWorkMinutes = data.totalWorkMinutes;
    this.overtimeMinutes = data.overtimeMinutes;
    this.lateMinutes = data.lateMinutes;
    this.note = data.note;
    this.approvedBy = data.approvedBy;
    this.approvedAt = data.approvedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AttendanceLog implements AttendanceLogEntity {
  id: string;
  attendanceRecordId: string;
  checkpointId: string;
  checkType: CheckType;
  checkedAt: Date;
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  locationId?: string | null;
  isLocationValid: boolean;
  photoUrl?: string | null;
  photoVerified: boolean;
  deviceId?: string | null;
  ipAddress?: string | null;
  isManual: boolean;
  manualReason?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AttendanceLogEntity) {
    this.id = data.id;
    this.attendanceRecordId = data.attendanceRecordId;
    this.checkpointId = data.checkpointId;
    this.checkType = data.checkType;
    this.checkedAt = data.checkedAt;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.accuracyMeters = data.accuracyMeters;
    this.locationId = data.locationId;
    this.isLocationValid = data.isLocationValid;
    this.photoUrl = data.photoUrl;
    this.photoVerified = data.photoVerified;
    this.deviceId = data.deviceId;
    this.ipAddress = data.ipAddress;
    this.isManual = data.isManual;
    this.manualReason = data.manualReason;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class LeaveRequest implements LeaveRequestEntity {
  id: string;
  companyId: string;
  companyMemberId: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string | null;
  attachmentUrl?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewNote?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: LeaveRequestEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.companyMemberId = data.companyMemberId;
    this.leaveType = data.leaveType;
    this.status = data.status;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.totalDays = data.totalDays;
    this.reason = data.reason;
    this.attachmentUrl = data.attachmentUrl;
    this.reviewedBy = data.reviewedBy;
    this.reviewedAt = data.reviewedAt;
    this.reviewNote = data.reviewNote;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
