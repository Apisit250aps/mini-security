import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type {
  FormAnswer,
  FormField,
  FormSection,
  FormSubmission,
  FormSubmissionContributor,
  FormTemplate,
  FormTemplateRole,
  FormVersion,
  SubmissionReview,
} from '#entities/form';
import type {
  CreateFormField,
  CreateFormSection,
  CreateFormTemplate,
  SubmissionReviewAction,
  UpdateFormTemplate,
} from '#schema/form';

// ==========================================
// 1. Form Template & Builder Contexts & Use Cases
// ==========================================

export type ICreateFormTemplateContext = ISecurityContext & {
  data: CreateFormTemplate;
};

export type IUpdateFormTemplateContext = ISecurityContext & {
  id: string;
  data: UpdateFormTemplate;
};

export type IGetFormTemplateContext = ISecurityContext & {
  id: string;
};

export type IListFormTemplatesByCompanyContext = ISecurityContext & {
  companyId: string;
};

export type IAssignFormRolesContext = ISecurityContext & {
  formTemplateId: string;
  roleIds: string[];
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
  roles: FormTemplateRole[];
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

export type IAssignFormRolesUseCase = BaseUseCase<
  IAssignFormRolesContext,
  FormTemplateRole[]
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

// ==========================================
// 2. Form Submission Contexts & Use Cases
// ==========================================

export type IStartFormSubmissionContext = ISecurityContext & {
  formTemplateId: string;
  roleId: string;
  memberId: string;
};

export type ISaveFormSubmissionDraftContext = ISecurityContext & {
  submissionId: string;
  memberId: string;
  expectedRevision: number;
  answers: {
    fieldId: string;
    value?: unknown;
  }[];
};

export type ISubmitFormSubmissionContext = ISecurityContext & {
  submissionId: string;
  memberId: string;
  expectedRevision: number;
};

export type ICloneFormSubmissionContext = ISecurityContext & {
  submissionId: string;
  memberId: string;
};

export type IGetFormSubmissionContext = ISecurityContext & {
  id: string;
};

export type IListFormSubmissionsContext = ISecurityContext & {
  companyId?: string;
  roleId?: string;
  formTemplateId?: string;
};

export type FormSubmissionDetail = {
  submission: FormSubmission;
  template: FormTemplate | null;
  version: FormVersion | null;
  sections: FormSection[];
  fields: FormField[];
  answers: FormAnswer[];
  contributors: FormSubmissionContributor[];
  review: SubmissionReview | null;
};

export type IStartFormSubmissionUseCase = BaseUseCase<
  IStartFormSubmissionContext,
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

export type ICloneFormSubmissionUseCase = BaseUseCase<
  ICloneFormSubmissionContext,
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

// ==========================================
// 3. Submission Review Contexts & Use Cases
// ==========================================

export type IReviewFormSubmissionContext = ISecurityContext & {
  submissionId: string;
  memberId: string;
  action: SubmissionReviewAction;
  note?: string | null;
};

export type IReviewFormSubmissionUseCase = BaseUseCase<
  IReviewFormSubmissionContext,
  SubmissionReview
>;
