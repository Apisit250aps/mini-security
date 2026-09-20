import type {
  FormAnswerAttachmentEntity,
  FormAnswerEntity,
  FormAssignmentEntity,
  FormFieldEntity,
  FormFieldOptionEntity,
  FormFieldType,
  FormOccurrenceEntity,
  FormPlanEntity,
  FormPlanPeriodEntity,
  FormPlanTargetEntity,
  FormReviewEntryEntity,
  FormSectionEntity,
  FormSubmissionContributorEntity,
  FormSubmissionEntity,
  FormTemplateEntity,
  FormVersionEntity,
  FormVersionStatus,
  FormScheduleKind,
  FormScheduleConfig,
  FormRoleDistribution,
  FormLatePolicy,
  FormMissedPolicy,
  FormReviewAction,
} from '#schema/form';

export class FormTemplate implements FormTemplateEntity {
  id: string;
  companyId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormTemplateEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormVersion implements FormVersionEntity {
  id: string;
  companyId: string;
  formTemplateId: string;
  version: number;
  status: FormVersionStatus;
  title: string;
  description?: string | null;
  createdBy: string;
  publishedBy?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormVersionEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formTemplateId = data.formTemplateId;
    this.version = data.version;
    this.status = data.status;
    this.title = data.title;
    this.description = data.description;
    this.createdBy = data.createdBy;
    this.publishedBy = data.publishedBy;
    this.publishedAt = data.publishedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormSection implements FormSectionEntity {
  id: string;
  companyId: string;
  formVersionId: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormSectionEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formVersionId = data.formVersionId;
    this.title = data.title;
    this.description = data.description;
    this.sortOrder = data.sortOrder;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormField implements FormFieldEntity {
  id: string;
  companyId: string;
  formVersionId: string;
  formSectionId: string;
  name: string;
  type: FormFieldType;
  label: string;
  description?: string | null;
  placeholder?: string | null;
  isRequired: boolean;
  min?: number | null;
  max?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  sortOrder: number;
  options?: FormFieldOptionEntity[];
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormFieldEntity & { options?: FormFieldOptionEntity[] }) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formVersionId = data.formVersionId;
    this.formSectionId = data.formSectionId;
    this.name = data.name;
    this.type = data.type;
    this.label = data.label;
    this.description = data.description;
    this.placeholder = data.placeholder;
    this.isRequired = data.isRequired;
    this.min = data.min;
    this.max = data.max;
    this.minLength = data.minLength;
    this.maxLength = data.maxLength;
    this.sortOrder = data.sortOrder;
    this.options = data.options;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormFieldOption implements FormFieldOptionEntity {
  id: string;
  companyId: string;
  formVersionId: string;
  fieldId: string;
  label: string;
  value: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormFieldOptionEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formVersionId = data.formVersionId;
    this.fieldId = data.fieldId;
    this.label = data.label;
    this.value = data.value;
    this.sortOrder = data.sortOrder;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormPlan implements FormPlanEntity {
  id: string;
  companyId: string;
  formTemplateId: string;
  supersedesPlanId?: string | null;
  name: string;
  scheduleKind: FormScheduleKind;
  scheduleConfig: FormScheduleConfig | null;
  timezone: string;
  fixedVersionId?: string | null;
  latePolicy: FormLatePolicy;
  missedPolicy: FormMissedPolicy;
  effectiveFrom?: Date | null;
  effectiveUntil?: Date | null;
  createdBy: string;
  closedBy?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormPlanEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formTemplateId = data.formTemplateId;
    this.supersedesPlanId = data.supersedesPlanId;
    this.name = data.name;
    this.scheduleKind = data.scheduleKind;
    this.scheduleConfig = data.scheduleConfig;
    this.timezone = data.timezone;
    this.fixedVersionId = data.fixedVersionId;
    this.latePolicy = data.latePolicy;
    this.missedPolicy = data.missedPolicy;
    this.effectiveFrom = data.effectiveFrom;
    this.effectiveUntil = data.effectiveUntil;
    this.createdBy = data.createdBy;
    this.closedBy = data.closedBy;
    this.revision = data.revision;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormPlanTarget implements FormPlanTargetEntity {
  id: string;
  companyId: string;
  planId: string;
  roleId?: string | null;
  companyMemberId?: string | null;
  roleDistribution?: FormRoleDistribution | null;
  createdAt: Date;
  constructor(data: FormPlanTargetEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.planId = data.planId;
    this.roleId = data.roleId;
    this.companyMemberId = data.companyMemberId;
    this.roleDistribution = data.roleDistribution;
    this.createdAt = data.createdAt;
  }
}

export class FormPlanPeriod implements FormPlanPeriodEntity {
  id: string;
  companyId: string;
  planId: string;
  opensAt: Date;
  dueAt: Date;
  createdAt: Date;
  constructor(data: FormPlanPeriodEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.planId = data.planId;
    this.opensAt = data.opensAt;
    this.dueAt = data.dueAt;
    this.createdAt = data.createdAt;
  }
}

export class FormOccurrence implements FormOccurrenceEntity {
  id: string;
  companyId: string;
  planId: string;
  formTemplateId: string;
  formVersionId: string;
  periodId?: string | null;
  occurrenceKey: string;
  opensAt: Date;
  dueAt: Date;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  revision: number;
  createdAt: Date;
  constructor(data: FormOccurrenceEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.planId = data.planId;
    this.formTemplateId = data.formTemplateId;
    this.formVersionId = data.formVersionId;
    this.periodId = data.periodId;
    this.occurrenceKey = data.occurrenceKey;
    this.opensAt = data.opensAt;
    this.dueAt = data.dueAt;
    this.cancelledAt = data.cancelledAt;
    this.cancelledBy = data.cancelledBy;
    this.cancelReason = data.cancelReason;
    this.revision = data.revision;
    this.createdAt = data.createdAt;
  }
}

export class FormAssignment implements FormAssignmentEntity {
  id: string;
  companyId: string;
  occurrenceId: string;
  formVersionId: string;
  roleId?: string | null;
  companyMemberId?: string | null;
  replacesAssignmentId?: string | null;
  assignedBy?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  revision: number;
  createdAt: Date;
  constructor(data: FormAssignmentEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.occurrenceId = data.occurrenceId;
    this.formVersionId = data.formVersionId;
    this.roleId = data.roleId;
    this.companyMemberId = data.companyMemberId;
    this.replacesAssignmentId = data.replacesAssignmentId;
    this.assignedBy = data.assignedBy;
    this.cancelledAt = data.cancelledAt;
    this.cancelledBy = data.cancelledBy;
    this.cancelReason = data.cancelReason;
    this.revision = data.revision;
    this.createdAt = data.createdAt;
  }
}

export class FormSubmission implements FormSubmissionEntity {
  id: string;
  companyId: string;
  assignmentId: string;
  formVersionId: string;
  startedBy: string;
  submittedBy?: string | null;
  revision: number;
  supersedesSubmissionId?: string | null;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormSubmissionEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.assignmentId = data.assignmentId;
    this.formVersionId = data.formVersionId;
    this.startedBy = data.startedBy;
    this.submittedBy = data.submittedBy;
    this.revision = data.revision;
    this.supersedesSubmissionId = data.supersedesSubmissionId;
    this.submittedAt = data.submittedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormSubmissionContributor
  implements FormSubmissionContributorEntity
{
  id: string;
  companyId: string;
  submissionId: string;
  memberId: string;
  createdAt: Date;
  constructor(data: FormSubmissionContributorEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.submissionId = data.submissionId;
    this.memberId = data.memberId;
    this.createdAt = data.createdAt;
  }
}

export class FormAnswer implements FormAnswerEntity {
  id: string;
  companyId: string;
  formVersionId: string;
  submissionId: string;
  fieldId: string;
  value?: unknown;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormAnswerEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formVersionId = data.formVersionId;
    this.submissionId = data.submissionId;
    this.fieldId = data.fieldId;
    this.value = data.value;
    this.updatedBy = data.updatedBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormAnswerAttachment implements FormAnswerAttachmentEntity {
  id: string;
  companyId: string;
  answerId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: FormAnswerAttachmentEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.answerId = data.answerId;
    this.storageKey = data.storageKey;
    this.originalName = data.originalName;
    this.mimeType = data.mimeType;
    this.sizeBytes = data.sizeBytes;
    this.sortOrder = data.sortOrder;
    this.uploadedBy = data.uploadedBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

/** API history read model combining answer reviews and submission decisions. */
export class FormReviewEntry implements FormReviewEntryEntity {
  id: string;
  companyId: string;
  submissionId: string;
  formVersionId: string;
  answerId?: string | null;
  action: FormReviewAction;
  note?: string | null;
  reviewedBy: string;
  supersedesEntryId?: string | null;
  createdAt: Date;
  constructor(data: FormReviewEntryEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.submissionId = data.submissionId;
    this.formVersionId = data.formVersionId;
    this.answerId = data.answerId;
    this.action = data.action;
    this.note = data.note;
    this.reviewedBy = data.reviewedBy;
    this.supersedesEntryId = data.supersedesEntryId;
    this.createdAt = data.createdAt;
  }
}
