namespace Domain.Entity;

  model BaseEntity {
    id: string;
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }

  enum RoleType {
    SUPER_ADMIN: "SUPER_ADMIN",
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    MEMBER: "MEMBER",
    VIEWER: "VIEWER",
  }

  enum CheckType {
    CHECK_IN: "CHECK_IN",
    CHECK_OUT: "CHECK_OUT",
    BREAK_IN: "BREAK_IN",
    BREAK_OUT: "BREAK_OUT",
    CUSTOM: "CUSTOM",
  }

  enum AttendanceStatus {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    LATE: "LATE",
    ABSENT: "ABSENT",
  }

  enum LocationType {
    FIXED: "FIXED",
    RADIUS: "RADIUS",
    BRANCH: "BRANCH",
  }

  enum LeaveType {
    SICK_LEAVE: "SICK_LEAVE",
    ANNUAL_LEAVE: "ANNUAL_LEAVE",
    PERSONAL_LEAVE: "PERSONAL_LEAVE",
    MATERNITY_LEAVE: "MATERNITY_LEAVE",
    ABSENT_NO_REASON: "ABSENT_NO_REASON",
  }

  enum LeaveStatus {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
  }

  model WorkSchedule {
    ...BaseEntity;

    companyId: string;
    name: string;
    description?: string | null;
    isActive: boolean;
  }

  model WorkShift {
    ...BaseEntity;

    workScheduleId: string;
    companyId: string;
    name: string;
    startTime: string;
    endTime: string;
    isOvernight: boolean;
    color?: string | null;
  }

  model AttendancePolicy {
    ...BaseEntity;

    companyId: string;
    name: string;
    description?: string | null;
    isActive: boolean;
  }

  model AttendanceCheckpoint {
    ...BaseEntity;

    policyId: string;
    checkType: CheckType;
    label: string;
    orderIndex: int32;
    isRequired: boolean;
    windowStart?: string | null;
    windowEnd?: string | null;
    graceMinutes?: int32 | null;
    requirePhoto: boolean;
    requireLocation: boolean;
  }

  model RoleAttendancePolicy {
    ...BaseEntity;

    roleId: string;
    policyId: string;
    companyId: string;
  }

  model AttendanceLocation {
    ...BaseEntity;

    companyId: string;
    branchId?: string | null;
    name: string;
    locationType: LocationType;
    latitude?: int32 | null;
    longitude?: int32 | null;
    radiusMeters?: int32 | null;
    address?: string | null;
    isActive: boolean;
  }

  model CheckpointLocation {
    ...BaseEntity;

    checkpointId: string;
    locationId: string;
  }

  model RoleWorkSchedule {
    ...BaseEntity;

    roleId: string;
    companyId: string;
    workShiftId: string;
    effectiveDate: utcDateTime;
    endDate?: utcDateTime | null;
  }

  model AttendanceRecord {
    ...BaseEntity;

    companyId: string;
    companyMemberId: string;
    workShiftId: string;
    workDate: utcDateTime;
    status: AttendanceStatus;
    totalWorkMinutes?: int32 | null;
    overtimeMinutes?: int32 | null;
    lateMinutes?: int32 | null;
    note?: string | null;
    approvedBy?: string | null;
    approvedAt?: utcDateTime | null;
  }

  model AttendanceLog {
    ...BaseEntity;

    attendanceRecordId: string;
    checkpointId: string;
    checkType: CheckType;
    checkedAt: utcDateTime;
    latitude?: int32 | null;
    longitude?: int32 | null;
    accuracyMeters?: int32 | null;
    locationId?: string | null;
    isLocationValid: boolean;
    photoUrl?: string | null;
    photoVerified: boolean;
    deviceId?: string | null;
    ipAddress?: string | null;
    isManual: boolean;
    manualReason?: string | null;
  }

  model LeaveRequest {
    ...BaseEntity;

    companyId: string;
    companyMemberId: string;
    leaveType: LeaveType;
    status: LeaveStatus;
    startDate: utcDateTime;
    endDate: utcDateTime;
    totalDays: int32;
    reason?: string | null;
    attachmentUrl?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: utcDateTime | null;
    reviewNote?: string | null;
  }

  model Session {
    ...BaseEntity;

    userId: string;
    token: string;
    expiresAt: utcDateTime;
    ipAddress?: string | null;
    userAgent?: string | null;
    activeCompanyId?: string | null;
  }

  model Account {
    ...BaseEntity;

    userId: string;
    accountId: string;
    providerId: string;
    issuer?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    idToken?: string | null;
    accessTokenExpiresAt?: utcDateTime | null;
    refreshTokenExpiresAt?: utcDateTime | null;
    scope?: string | null;
    password?: string | null;
  }

  model Verification {
    ...BaseEntity;

    identifier: string;
    value: string;
    expiresAt: utcDateTime;
  }

  model Jwks {
    ...BaseEntity;

    publicKey: string;
    privateKey: string;
    expiresAt?: utcDateTime | null;
    alg?: string | null;
    crv?: string | null;
  }

  model Company {
    ...BaseEntity;

    name: string;
    slug: string;
    logo?: string | null;
    isActive: boolean;
  }

  model CompanyBranch {
    ...BaseEntity;

    companyId: string;
    name: string;
    address?: string | null;
    isActive: boolean;
  }

  model CompanyMember {
    ...BaseEntity;

    companyBranchId: string;
    companyId: string;
    userId: string;
    roleId: string;
    isActive: boolean;
  }

  model Role {
    ...BaseEntity;

    companyId?: string | null;
    name: string;
    description?: string | null;
    roleType: RoleType;
    isSystemDefault: boolean;
  }

  model Permission {
    ...BaseEntity;

    action: string;
    module: string;
    description?: string | null;
  }

  model RolePermission {
    ...BaseEntity;

    roleId: string;
    permissionId: string;
  }

  model User {
    ...BaseEntity;

    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    isAdmin: boolean;
    isActive: boolean;
    lastLogin?: utcDateTime | null;
  }
