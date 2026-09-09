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

  enum AttendanceStatus {
    present: "present",
    absent: "absent",
    late: "late",
    excused: "excused",
  }

  enum LeaveRequestStatus {
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    cancelled: "cancelled",
  }

  enum LeaveUnit {
    day: "day",
    half_day: "half_day",
    hour: "hour",
  }

  enum FormVersionStatus {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
  }

  enum FormFieldType {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    SELECT: "SELECT",
    BOOLEAN: "BOOLEAN",
    DATE: "DATE",
    IMAGE: "IMAGE",
    FILE: "FILE",
  }

  enum FormSubmissionStatus {
    DRAFT: "DRAFT",
    SUBMITTED: "SUBMITTED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  }

  enum SubmissionReviewAction {
    APPROVE: "APPROVE",
    REJECT: "REJECT",
  }

  model CheckInSchedule {
    ...BaseEntity;

    roleId: string;
    companyId: string;
    name: string;
    isActive: boolean;
  }

  model ScheduleSlot {
    ...BaseEntity;

    checkInScheduleId: string;
    slotOrder: int32;
    label: string;
    windowStart: string;
    windowEnd: string;
    isRequired: boolean;
  }

  model AttendanceLog {
    ...BaseEntity;

    companyMemberId: string;
    scheduleSlotId: string;
    workDate: string;
    checkedInAt?: utcDateTime | null;
    status: AttendanceStatus;
    note?: string | null;
    recordedBy?: string | null;
  }

  model Session {
    ...BaseEntity;

    userId: string;
    token: string;
    expiresAt: utcDateTime;
    ipAddress?: string | null;
    userAgent?: string | null;
    activeCompanyId?: string | null;
    permissions?: string | null;
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

  model Feature {
    ...BaseEntity;

    code: string;
    name: string;
    description?: string | null;
    category: string;
    isActive: boolean;
  }

  model CompanyFeature {
    ...BaseEntity;

    companyId: string;
    featureId: string;
    isEnabled: boolean;
    assignedBy?: string | null;
    expiresAt?: utcDateTime | null;
  }

  model RoleFeature {
    ...BaseEntity;

    companyId: string;
    roleId: string;
    featureId: string;
    isEnabled: boolean;
  }

  model FormTemplate {
    ...BaseEntity;

    companyId: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    createdBy: string;
  }

  model FormTemplateRole {
    ...BaseEntity;

    companyId: string;
    formTemplateId: string;
    roleId: string;
    isEnabled: boolean;
  }

  model FormVersion {
    ...BaseEntity;

    companyId: string;
    formTemplateId: string;
    version: int32;
    status: FormVersionStatus;
    title: string;
    description?: string | null;
    createdBy: string;
    publishedBy?: string | null;
    publishedAt?: utcDateTime | null;
  }

  model FormSection {
    ...BaseEntity;

    companyId: string;
    formVersionId: string;
    title: string;
    description?: string | null;
    sortOrder: int32;
  }

  model FormField {
    ...BaseEntity;

    companyId: string;
    formVersionId: string;
    formSectionId: string;
    type: FormFieldType;
    label: string;
    description?: string | null;
    isRequired: boolean;
    sortOrder: int32;
    config: Record<unknown>;
  }

  model FormSubmission {
    ...BaseEntity;

    companyId: string;
    formTemplateId: string;
    formVersionId: string;
    roleId: string;
    startedBy: string;
    submittedBy?: string | null;
    revision: int32;
    supersedesSubmissionId?: string | null;
    status: FormSubmissionStatus;
    startedAt: utcDateTime;
    submittedAt?: utcDateTime | null;
  }

  model FormSubmissionContributor {
    ...BaseEntity;

    companyId: string;
    submissionId: string;
    memberId: string;
  }

  model FormAnswer {
    ...BaseEntity;

    companyId: string;
    formVersionId: string;
    submissionId: string;
    fieldId: string;
    value?: unknown;
    updatedBy: string;
  }

  model FormAnswerAttachment {
    ...BaseEntity;

    companyId: string;
    answerId: string;
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: int32;
    sortOrder: int32;
    uploadedBy: string;
  }

  model SubmissionReview {
    ...BaseEntity;

    companyId: string;
    submissionId: string;
    reviewedBy: string;
    action: SubmissionReviewAction;
    note?: string | null;
  }

  model LeaveType {
    ...BaseEntity;

    companyId: string;
    name: string;
    description?: string | null;
    unit: LeaveUnit;
    requiresProof: boolean;
    maxDaysPerYear?: int32 | null;
    isPaid: boolean;
    isActive: boolean;
  }

  model LeaveQuota {
    ...BaseEntity;

    companyMemberId: string;
    leaveTypeId: string;
    year: int32;
    totalDays: int32;
    usedDays: int32;
  }

  model LeaveRequest {
    ...BaseEntity;

    companyMemberId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: int32;
    unit: LeaveUnit;
    reason: string;
    proofUrl?: string | null;
    status: LeaveRequestStatus;
    reviewedBy?: string | null;
    reviewedAt?: utcDateTime | null;
    reviewNote?: string | null;
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

    featureId?: string | null;
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
