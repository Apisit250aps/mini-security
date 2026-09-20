import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type {
  FormAnswerAttachment,
  FormAnswer,
  FormField,
  FormSection,
  FormSubmission,
  FormSubmissionContributor,
  FormTemplate,
  FormVersion,
  FormPlan,
  FormPlanTarget,
  FormPlanPeriod,
  FormOccurrence,
  FormAssignment,
  FormReviewEntry,
} from '#entities/form';
import type {
  CreateFormField,
  EditFormField,
  CreateFormSection,
  CreateFormTemplate,
  UpdateFormTemplate,
  CreateFormPlan,
  FormReviewAction,
  FormRoleDistribution,
  FormLatePolicy,
} from '#schema/form';

export type ICreateFormTemplateContext = ISecurityContext & {
  data: CreateFormTemplate;
};
export type IUpdateFormTemplateContext = ISecurityContext & {
  id: string;
  data: UpdateFormTemplate;
};
export type IGetFormTemplateContext = ISecurityContext & { id: string };
export type IListFormTemplatesByCompanyContext = ISecurityContext & {
  companyId: string;
};
export type ICreateFormSectionContext = ISecurityContext & {
  data: CreateFormSection;
};
export type ICreateFormFieldContext = ISecurityContext & {
  data: CreateFormField & {
    options?: Array<{ label: string; value: string; sortOrder?: number }>;
  };
};
export type IPublishFormVersionContext = ISecurityContext & {
  formTemplateId: string;
  memberId: string;
};

export type FormTemplateDetail = {
  template: FormTemplate;
  activeVersion: FormVersion | null;
  draftVersion: FormVersion | null;
  sections: FormSection[];
  fields: FormField[];
};

export type ICreateFormTemplateUseCase = BaseUseCase<
  ICreateFormTemplateContext,
  FormTemplate
>;
export type IUpdateFormTemplateUseCase = BaseUseCase<
  IUpdateFormTemplateContext,
  FormTemplate
>;
export type IGetFormTemplateUseCase = BaseUseCase<
  IGetFormTemplateContext,
  FormTemplateDetail | null
>;
export type IListFormTemplatesByCompanyUseCase = BaseUseCase<
  IListFormTemplatesByCompanyContext,
  FormTemplate[]
>;
export type ICreateFormSectionUseCase = BaseUseCase<
  ICreateFormSectionContext,
  FormSection
>;
export type ICreateFormFieldUseCase = BaseUseCase<
  ICreateFormFieldContext,
  FormField
>;
export type IPublishFormVersionUseCase = BaseUseCase<
  IPublishFormVersionContext,
  FormVersion
>;

export type IReorderFormSectionsContext = ISecurityContext & {
  formTemplateId: string;
  formVersionId: string;
  items: Array<{ id: string; sortOrder: number }>;
};
export type IReorderFormFieldsContext = ISecurityContext & {
  formTemplateId: string;
  formVersionId: string;
  items: Array<{ id: string; sortOrder: number }>;
};
export type IReorderFormSectionsUseCase = BaseUseCase<
  IReorderFormSectionsContext,
  void
>;
export type IReorderFormFieldsUseCase = BaseUseCase<
  IReorderFormFieldsContext,
  void
>;

// Plan, Schedule, Occurrence, Assignment
export type ICreateFormPlanTargetInput = {
  roleId?: string | null;
  companyMemberId?: string | null;
  roleDistribution?: FormRoleDistribution | null;
};
export type ICreateFormPlanPeriodInput = {
  opensAt: Date | string;
  dueAt: Date | string;
};
export type FormPlanDetail = {
  plan: FormPlan;
  targets: FormPlanTarget[];
  periods: FormPlanPeriod[];
};

export type ICreateFormPlanContext = ISecurityContext & {
  data: CreateFormPlan;
  targets: ICreateFormPlanTargetInput[];
  periods?: ICreateFormPlanPeriodInput[];
};
export type ICreateFormPlanUseCase = BaseUseCase<
  ICreateFormPlanContext,
  FormPlan
>;
export type IUpdateFormPlanContext = ISecurityContext & {
  id: string;
  expectedRevision: number;
  data: Partial<CreateFormPlan>;
  targets?: ICreateFormPlanTargetInput[];
  periods?: ICreateFormPlanPeriodInput[];
};
export type IUpdateFormPlanUseCase = BaseUseCase<
  IUpdateFormPlanContext,
  FormPlan
>;
export type IGetFormPlanContext = ISecurityContext & { id: string };
export type IGetFormPlanUseCase = BaseUseCase<
  IGetFormPlanContext,
  FormPlanDetail
>;
export type IListFormPlansContext = ISecurityContext & { companyId: string };
export type IListFormPlansUseCase = BaseUseCase<
  IListFormPlansContext,
  FormPlan[]
>;
export type IActivateFormPlanContext = ISecurityContext & {
  id: string;
  expectedRevision: number;
};
export type IActivateFormPlanUseCase = BaseUseCase<
  IActivateFormPlanContext,
  FormPlan
>;
export type IPauseFormPlanContext = ISecurityContext & {
  id: string;
  expectedRevision: number;
  memberId?: string | null;
};
export type IPauseFormPlanUseCase = BaseUseCase<
  IPauseFormPlanContext,
  FormPlan
>;
export type IPreviewScheduleContext = ISecurityContext & { planId: string };
export type IPreviewScheduleUseCase = BaseUseCase<
  IPreviewScheduleContext,
  Date[]
>;

export type IOpenDueOccurrencesContext = ISecurityContext & {
  companyId: string;
};
export type IOpenDueOccurrencesUseCase = BaseUseCase<
  IOpenDueOccurrencesContext,
  FormOccurrence[]
>;
export type ICancelOccurrenceContext = ISecurityContext & {
  occurrenceId: string;
  cancelReason: string;
  expectedRevision?: number;
  memberId?: string | null;
};
export type ICancelOccurrenceUseCase = BaseUseCase<
  ICancelOccurrenceContext,
  FormOccurrence
>;
export type IListOccurrencesContext = ISecurityContext & {
  companyId: string;
  formTemplateId?: string;
  planId?: string;
};
export type IListOccurrencesUseCase = BaseUseCase<
  IListOccurrencesContext,
  FormOccurrence[]
>;

export type FormTaskWorkflowStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'RETURNED'
  | 'CORRECTION_DRAFT'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type FormTaskAvailableActions = {
  canStart: boolean;
  canContinue: boolean;
  canCreateCorrection: boolean;
  canView: boolean;
  disabledReason?: string | null;
};

export type MyAssignmentItem = FormAssignment & {
  planId?: string;
  planName?: string;
  formTemplateId?: string;
  templateName?: string;
  templateDescription?: string | null;
  opensAt?: Date;
  dueAt?: Date;
  timezone?: string;
  latePolicy?: FormLatePolicy;
  assignmentType?: 'PERSONAL' | 'ROLE';
  recipientLabel?: string;
  roleName?: string | null;
  memberName?: string | null;
  latestSubmissionId?: string | null;
  latestSubmissionRevision?: number | null;
  workflowStatus?: FormTaskWorkflowStatus;
  isOverdue?: boolean;
  availableActions?: FormTaskAvailableActions;
};
export type IListMyAssignmentsContext = ISecurityContext & {
  companyId: string;
  memberId: string;
};
export type IListMyAssignmentsUseCase = BaseUseCase<
  IListMyAssignmentsContext,
  MyAssignmentItem[]
>;
export type IGetAssignmentContext = ISecurityContext & {
  assignmentId: string;
  memberId?: string | null;
};
export type IGetAssignmentUseCase = BaseUseCase<
  IGetAssignmentContext,
  FormAssignment
>;
export type ICancelAssignmentContext = ISecurityContext & {
  assignmentId: string;
  cancelReason: string;
  expectedRevision?: number;
  memberId?: string | null;
};
export type ICancelAssignmentUseCase = BaseUseCase<
  ICancelAssignmentContext,
  FormAssignment
>;
export type IReplaceAssignmentContext = ISecurityContext & {
  assignmentId: string;
  newCompanyMemberId?: string;
  newRoleId?: string;
  cancelReason: string;
  memberId?: string | null;
};
export type IReplaceAssignmentUseCase = BaseUseCase<
  IReplaceAssignmentContext,
  FormAssignment
>;

export type OccurrenceAssignmentItem = {
  id: string;
  assignmentId: string;
  occurrenceId: string;
  companyId: string;
  formVersionId: string;
  roleId?: string | null;
  companyMemberId?: string | null;
  roleName?: string | null;
  memberName?: string | null;
  assignmentType: 'PERSONAL' | 'ROLE';
  recipientLabel: string;
  workflowStatus: FormTaskWorkflowStatus;
  latestSubmissionId?: string | null;
  latestSubmissionRevision?: number | null;
  isOverdue: boolean;
  canStart: boolean;
  canContinue: boolean;
  canCreateCorrection: boolean;
  canView: boolean;
  createdAt: Date;
};

export type IListOccurrenceAssignmentsContext = ISecurityContext & {
  occurrenceId: string;
  companyId?: string;
};

export type IListOccurrenceAssignmentsUseCase = BaseUseCase<
  IListOccurrenceAssignmentsContext,
  OccurrenceAssignmentItem[]
>;

// Submission
export type IStartAssignmentSubmissionContext = ISecurityContext & {
  assignmentId: string;
  memberId?: string | null;
};
export type ISaveFormSubmissionDraftContext = ISecurityContext & {
  submissionId: string;
  memberId?: string | null;
  expectedRevision: number;
  answers: { fieldId: string; value?: unknown }[];
};
export type ISubmitFormSubmissionContext = ISecurityContext & {
  submissionId: string;
  memberId?: string | null;
  expectedRevision: number;
};
export type ICreateCorrectionContext = ISecurityContext & {
  submissionId: string;
  memberId?: string | null;
};
export type ICreateCorrectionUseCase = BaseUseCase<
  ICreateCorrectionContext,
  FormSubmission
>;
export type IGetFormSubmissionContext = ISecurityContext & {
  id: string;
  companyId?: string;
};
export type IListFormSubmissionsContext = ISecurityContext & {
  companyId?: string;
  assignmentId?: string;
};

export type FormSubmissionItem = FormSubmission & {
  planId?: string;
  planName?: string;
  formTemplateId?: string;
  templateName?: string;
  occurrenceOpensAt?: Date | null;
  occurrenceDueAt?: Date | null;
  occurrenceKey?: string | null;
  recipientLabel?: string | null;
  startedByName?: string | null;
  submittedByName?: string | null;
  finalReviewAction?: FormReviewAction | null;
  finalReviewNote?: string | null;
  finalReviewAt?: Date | null;
  reviewerName?: string | null;
  submissionSequence?: number;
  isLatest?: boolean;
};

export type FormSubmissionDetail = {
  submission: FormSubmission;
  template: FormTemplate | null;
  version: FormVersion | null;
  sections: FormSection[];
  fields: FormField[];
  answers: FormAnswer[];
  attachments: FormAnswerAttachment[];
  contributors: FormSubmissionContributor[];
};

export type IStartFormSubmissionUseCase = BaseUseCase<
  IStartAssignmentSubmissionContext,
  FormSubmission
>;
export type ISaveFormSubmissionDraftUseCase = BaseUseCase<
  ISaveFormSubmissionDraftContext,
  FormSubmission
>;
export type ISubmitFormSubmissionUseCase = BaseUseCase<
  ISubmitFormSubmissionContext,
  FormSubmission
>;
export type IGetFormSubmissionUseCase = BaseUseCase<
  IGetFormSubmissionContext,
  FormSubmissionDetail | null
>;
export type IListFormSubmissionsUseCase = BaseUseCase<
  IListFormSubmissionsContext,
  FormSubmissionItem[]
>;

// Review
export type ReviewQueueItem = FormSubmission & {
  templateName?: string;
  submitterName?: string | null;
};
export type IListReviewQueueUseCase = BaseUseCase<
  ISecurityContext & { companyId: string },
  ReviewQueueItem[]
>;
export type IGetReviewDetailUseCase = BaseUseCase<
  ISecurityContext & { submissionId: string },
  FormReviewEntry[]
>;
export type IRecordAnswerReviewUseCase = BaseUseCase<
  ISecurityContext & {
    submissionId: string;
    expectedRevision: number;
    supersedesEntryId?: string;
    answerId: string;
    action: FormReviewAction;
    note?: string;
  },
  FormReviewEntry
>;
export type IRecordSectionReviewUseCase = BaseUseCase<
  ISecurityContext & {
    submissionId: string;
    expectedRevision: number;
    supersedesEntryId?: string;
    sectionId: string;
    action: FormReviewAction;
    note?: string;
  },
  FormReviewEntry[]
>;
export type IFinalizeSubmissionReviewUseCase = BaseUseCase<
  ISecurityContext & {
    submissionId: string;
    expectedRevision: number;
    action: FormReviewAction;
    note?: string;
  },
  FormReviewEntry
>;

export type IDeleteFormFieldContext = ISecurityContext & {
  formTemplateId: string;
  fieldId: string;
};
export type IEditFormFieldContext = IDeleteFormFieldContext & {
  data: EditFormField;
};
export type IEditFormFieldUseCase = BaseUseCase<
  IEditFormFieldContext,
  FormField
>;
export type IDeleteFormFieldUseCase = BaseUseCase<
  IDeleteFormFieldContext,
  void
>;
export type IDeleteFormSectionContext = ISecurityContext & {
  formTemplateId: string;
  sectionId: string;
};
export type IDeleteFormSectionUseCase = BaseUseCase<
  IDeleteFormSectionContext,
  void
>;

export type IFormAttachmentUploadContext = ISecurityContext & {
  submissionId: string;
  fieldId: string;
  expectedRevision: number;
  originalName: string;
  bytes: Uint8Array;
};

export type IFormAttachmentContext = ISecurityContext & {
  attachmentId: string;
  expectedRevision?: number;
};

export interface IFormAttachmentUseCase {
  upload(context: IFormAttachmentUploadContext): Promise<FormAnswerAttachment>;
  download(context: IFormAttachmentContext): Promise<{
    attachment: FormAnswerAttachment;
    bytes: Uint8Array;
  }>;
  remove(context: IFormAttachmentContext): Promise<void>;
}
