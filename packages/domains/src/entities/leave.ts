import type {
  LeaveQuotaEntity,
  LeaveRequestEntity,
  LeaveRequestStatus,
  LeaveTypeEntity,
  LeaveUnit,
} from '#schema/leave';

export class LeaveType implements LeaveTypeEntity {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  unit: LeaveUnit;
  requiresProof: boolean;
  maxDaysPerYear?: number | null;
  isPaid: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: LeaveTypeEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.unit = data.unit;
    this.requiresProof = data.requiresProof;
    this.maxDaysPerYear = data.maxDaysPerYear;
    this.isPaid = data.isPaid;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class LeaveQuota implements LeaveQuotaEntity {
  id: string;
  companyMemberId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: LeaveQuotaEntity) {
    this.id = data.id;
    this.companyMemberId = data.companyMemberId;
    this.leaveTypeId = data.leaveTypeId;
    this.year = data.year;
    this.totalDays = data.totalDays;
    this.usedDays = data.usedDays;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class LeaveRequest implements LeaveRequestEntity {
  id: string;
  companyMemberId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  unit: LeaveUnit;
  reason: string;
  proofUrl?: string | null;
  status: LeaveRequestStatus;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewNote?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: LeaveRequestEntity) {
    this.id = data.id;
    this.companyMemberId = data.companyMemberId;
    this.leaveTypeId = data.leaveTypeId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.totalDays = data.totalDays;
    this.unit = data.unit;
    this.reason = data.reason;
    this.proofUrl = data.proofUrl;
    this.status = data.status;
    this.reviewedBy = data.reviewedBy;
    this.reviewedAt = data.reviewedAt;
    this.reviewNote = data.reviewNote;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
