namespace Domain.Entity;

  model BaseEntity {
    id: string;
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }

  model AppendOnlyBaseEntity {
    id: string;
    createdAt: utcDateTime;
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

  enum FormScheduleKind {
    RECURRING: "RECURRING",
    EXPLICIT: "EXPLICIT",
  }

  enum FormReviewMode {
    NONE: "NONE",
    OVERALL: "OVERALL",
    ALL_SECTIONS: "ALL_SECTIONS",
    ALL_ANSWERS: "ALL_ANSWERS",
  }

  enum FormRoleDistribution {
    SHARED: "SHARED",
    PER_MEMBER: "PER_MEMBER",
  }

  enum FormLatePolicy {
    ALLOW: "ALLOW",
    DENY: "DENY",
  }

  enum FormMissedPolicy {
    SKIP: "SKIP",
    CATCH_UP: "CATCH_UP",
  }

  enum FormReviewAction {
    PASS: "PASS",
    NEEDS_CHANGES: "NEEDS_CHANGES",
    APPROVE: "APPROVE",
    RETURN: "RETURN",
  }

  enum SubmissionReviewAction {
    APPROVE: "APPROVE",
    REJECT: "REJECT",
  }

  model CheckInSchedule {
    ...BaseEntity;

    roleIds: string[];
    companyId: string;
    name: string;
    isActive: boolean;
  }

  model ScheduleSlot {
    ...BaseEntity;

    companyId: string;
    checkInScheduleId: string;
    slotOrder: int32;
    label: string;
    windowStart: string;
    windowEnd: string;
    isRequired: boolean;
  }

  model Location {
    ...BaseEntity;

    companyId: string;
    companyBranchId: string;
    name: string;
    address: string;
    latitude: float64;
    longitude: float64;
    radiusMeters: float64;
    isPrimary: boolean;
    isActive: boolean;
  }

  model ScheduleSlotLocation {
    ...BaseEntity;

    companyId: string;
    scheduleSlotId: string;
    locationId: string;
    isActive: boolean;
  }

  model AttendanceLog {
    ...BaseEntity;

    companyId: string;
    companyMemberId: string;
    scheduleSlotId: string;
    workDate: string;
    checkedInAt?: utcDateTime | null;
    status: AttendanceStatus;
    note?: string | null;
    recordedBy?: string | null;
    locationId?: string | null;
    checkedInLatitude?: float64 | null;
    checkedInLongitude?: float64 | null;
    locationNameSnapshot?: string | null;
    locationLatitudeSnapshot?: float64 | null;
    locationLongitudeSnapshot?: float64 | null;
    radiusMetersSnapshot?: float64 | null;
  }

  model CheckInScheduleRole {
    ...BaseEntity;

    companyId: string;
    checkInScheduleId: string;
    roleId: string;
    isActive: boolean;
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
    assignmentId: string;
    formVersionId: string;
    startedBy: string;
    submittedBy?: string | null;
    revision: int32;
    supersedesSubmissionId?: string | null;
    submittedAt?: utcDateTime | null;
  }

  model FormSubmissionContributor {
    ...AppendOnlyBaseEntity;

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
    ...AppendOnlyBaseEntity;

    companyId: string;
    submissionId: string;
    reviewedBy: string;
    action: SubmissionReviewAction;
    note?: string | null;
  }

  model FormPlan {
    ...BaseEntity;
    companyId: string;
    formTemplateId: string;
    supersedesPlanId: string | null;
    name: string;
    scheduleKind: FormScheduleKind;
    scheduleConfig: Record<unknown> | null;
    timezone: string;
    fixedVersionId: string | null;
    reviewMode: FormReviewMode;
    latePolicy: FormLatePolicy;
    missedPolicy: FormMissedPolicy;
    effectiveFrom: utcDateTime | null;
    effectiveUntil: utcDateTime | null;
    createdBy: string;
    closedBy: string | null;
    revision: int32;
  }

  model FormPlanTarget {
    ...AppendOnlyBaseEntity;
    companyId: string;
    planId: string;
    roleId: string | null;
    companyMemberId: string | null;
    roleDistribution: FormRoleDistribution | null;
  }

  model FormPlanPeriod {
    ...AppendOnlyBaseEntity;
    companyId: string;
    planId: string;
    opensAt: utcDateTime;
    dueAt: utcDateTime;
  }

  model FormOccurrence {
    ...AppendOnlyBaseEntity;
    companyId: string;
    planId: string;
    formTemplateId: string;
    formVersionId: string;
    periodId: string | null;
    occurrenceKey: string;
    opensAt: utcDateTime;
    dueAt: utcDateTime;
    cancelledAt: utcDateTime | null;
    cancelledBy: string | null;
    cancelReason: string | null;
    revision: int32;
  }

  model FormAssignment {
    ...AppendOnlyBaseEntity;
    companyId: string;
    occurrenceId: string;
    formVersionId: string;
    roleId: string | null;
    companyMemberId: string | null;
    replacesAssignmentId: string | null;
    assignedBy: string | null;
    cancelledAt: utcDateTime | null;
    cancelledBy: string | null;
    cancelReason: string | null;
    revision: int32;
  }

  model FormReviewEntry {
    ...AppendOnlyBaseEntity;
    companyId: string;
    submissionId: string;
    formVersionId: string;
    answerId: string | null;
    sectionId: string | null;
    action: FormReviewAction;
    note: string | null;
    reviewedBy: string;
    supersedesEntryId: string | null;
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
    totalDays: float64;
  }

  model LeaveRequest {
    ...BaseEntity;

    companyMemberId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    startTime?: string | null;
    endTime?: string | null;
    minutesPerDaySnapshot?: int32 | null;
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
