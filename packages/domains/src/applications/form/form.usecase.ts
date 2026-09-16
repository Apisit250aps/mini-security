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
  CreateFormOccurrence,
  CreateFormAssignment,
  FormReviewAction,
  FormRoleDistribution,
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
  data: CreateFormField;
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
export type ICreateFormPlanContext = ISecurityContext & {
  data: CreateFormPlan;
  targets: ICreateFormPlanTargetInput[];
  periods?: ICreateFormPlanPeriodInput[];
};
export type ICreateFormPlanUseCase = BaseUseCase<
  ICreateFormPlanContext,
  FormPlan
>;
export type IGetFormPlanContext = ISecurityContext & { id: string };
export type IGetFormPlanUseCase = BaseUseCase<IGetFormPlanContext, FormPlan>;
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

export type MyAssignmentItem = FormAssignment & {
  templateName?: string;
  templateDescription?: string | null;
  opensAt?: Date;
  dueAt?: Date;
  roleName?: string | null;
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
  FormSubmission[]
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
  FormReviewEntry
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
