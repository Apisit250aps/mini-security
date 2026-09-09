import type {
  FormAnswerAttachmentEntity,
  FormAnswerEntity,
  FormFieldEntity,
  FormFieldType,
  FormSectionEntity,
  FormSubmissionContributorEntity,
  FormSubmissionEntity,
  FormSubmissionStatus,
  FormTemplateEntity,
  FormTemplateRoleEntity,
  FormVersionEntity,
  FormVersionStatus,
  SubmissionReviewAction,
  SubmissionReviewEntity,
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

export class FormTemplateRole implements FormTemplateRoleEntity {
  id: string;
  companyId: string;
  formTemplateId: string;
  roleId: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: FormTemplateRoleEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formTemplateId = data.formTemplateId;
    this.roleId = data.roleId;
    this.isEnabled = data.isEnabled;
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
  type: FormFieldType;
  label: string;
  description?: string | null;
  isRequired: boolean;
  sortOrder: number;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: FormFieldEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formVersionId = data.formVersionId;
    this.formSectionId = data.formSectionId;
    this.type = data.type;
    this.label = data.label;
    this.description = data.description;
    this.isRequired = data.isRequired;
    this.sortOrder = data.sortOrder;
    this.config = data.config ?? {};
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class FormSubmission implements FormSubmissionEntity {
  id: string;
  companyId: string;
  formTemplateId: string;
  formVersionId: string;
  roleId: string;
  startedBy: string;
  submittedBy?: string | null;
  revision: number;
  supersedesSubmissionId?: string | null;
  status: FormSubmissionStatus;
  startedAt: Date;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: FormSubmissionEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.formTemplateId = data.formTemplateId;
    this.formVersionId = data.formVersionId;
    this.roleId = data.roleId;
    this.startedBy = data.startedBy;
    this.submittedBy = data.submittedBy;
    this.revision = data.revision;
    this.supersedesSubmissionId = data.supersedesSubmissionId;
    this.status = data.status;
    this.startedAt = data.startedAt;
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
  updatedAt: Date;

  constructor(data: FormSubmissionContributorEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.submissionId = data.submissionId;
    this.memberId = data.memberId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
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

export class SubmissionReview implements SubmissionReviewEntity {
  id: string;
  companyId: string;
  submissionId: string;
  reviewedBy: string;
  action: SubmissionReviewAction;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: SubmissionReviewEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.submissionId = data.submissionId;
    this.reviewedBy = data.reviewedBy;
    this.action = data.action;
    this.note = data.note;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
