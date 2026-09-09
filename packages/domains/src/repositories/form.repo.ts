import type { BaseRepository } from '../index';
import type {
  FormAnswer,
  FormAnswerAttachment,
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
  CreateFormAnswer,
  CreateFormAnswerAttachment,
  CreateFormField,
  CreateFormSection,
  CreateFormSubmission,
  CreateFormSubmissionContributor,
  CreateFormTemplate,
  CreateFormTemplateRole,
  CreateFormVersion,
  CreateSubmissionReview,
  UpdateFormAnswer,
  UpdateFormField,
  UpdateFormSection,
  UpdateFormSubmission,
  UpdateFormTemplate,
  UpdateFormTemplateRole,
  UpdateFormVersion,
} from '#schema/form';

export interface IFormTemplateRepository
  extends BaseRepository<FormTemplate, CreateFormTemplate, UpdateFormTemplate> {
  findByCompanyId(companyId: string): Promise<FormTemplate[]>;
  findByIdAndCompany(
    id: string,
    companyId: string,
  ): Promise<FormTemplate | null>;
}

export interface IFormTemplateRoleRepository
  extends BaseRepository<
    FormTemplateRole,
    CreateFormTemplateRole,
    UpdateFormTemplateRole
  > {
  findByTemplateId(templateId: string): Promise<FormTemplateRole[]>;
  findByTemplateAndRole(
    templateId: string,
    roleId: string,
  ): Promise<FormTemplateRole | null>;
  findEnabledByCompanyAndRole(
    companyId: string,
    roleId: string,
  ): Promise<FormTemplateRole[]>;
  deleteByTemplateId(templateId: string): Promise<void>;
}

export interface IFormVersionRepository
  extends BaseRepository<FormVersion, CreateFormVersion, UpdateFormVersion> {
  findByTemplateId(templateId: string): Promise<FormVersion[]>;
  findPublishedByTemplateId(templateId: string): Promise<FormVersion | null>;
  findDraftByTemplateId(templateId: string): Promise<FormVersion | null>;
  findByTemplateAndVersion(
    templateId: string,
    version: number,
  ): Promise<FormVersion | null>;
  getLatestVersionNumber(templateId: string): Promise<number>;
}

export interface IFormSectionRepository
  extends BaseRepository<FormSection, CreateFormSection, UpdateFormSection> {
  findByVersionId(versionId: string): Promise<FormSection[]>;
  deleteByVersionId(versionId: string): Promise<void>;
}

export interface IFormFieldRepository
  extends BaseRepository<FormField, CreateFormField, UpdateFormField> {
  findByVersionId(versionId: string): Promise<FormField[]>;
  findBySectionId(sectionId: string): Promise<FormField[]>;
  deleteByVersionId(versionId: string): Promise<void>;
}

export interface IFormSubmissionRepository
  extends BaseRepository<
    FormSubmission,
    CreateFormSubmission,
    UpdateFormSubmission
  > {
  findByCompanyId(companyId: string): Promise<FormSubmission[]>;
  findByRoleId(roleId: string, companyId: string): Promise<FormSubmission[]>;
  findByTemplateAndRole(
    templateId: string,
    roleId: string,
    companyId: string,
  ): Promise<FormSubmission[]>;
  findDraftByRoleAndTemplate(
    roleId: string,
    templateId: string,
    companyId: string,
  ): Promise<FormSubmission | null>;
  findBySupersedesId(supersedesId: string): Promise<FormSubmission | null>;
}

export interface IFormSubmissionContributorRepository {
  findBySubmissionId(
    submissionId: string,
  ): Promise<FormSubmissionContributor[]>;
  create(
    entity: CreateFormSubmissionContributor,
  ): Promise<FormSubmissionContributor>;
  isContributor(submissionId: string, memberId: string): Promise<boolean>;
  findMemberIdsForRevisionLineage(submissionId: string): Promise<string[]>;
}

export interface IFormAnswerRepository
  extends BaseRepository<FormAnswer, CreateFormAnswer, UpdateFormAnswer> {
  findBySubmissionId(submissionId: string): Promise<FormAnswer[]>;
  findBySubmissionAndField(
    submissionId: string,
    fieldId: string,
  ): Promise<FormAnswer | null>;
  upsertAnswer(answer: CreateFormAnswer): Promise<FormAnswer>;
}

export interface IFormAnswerAttachmentRepository {
  findById(id: string): Promise<FormAnswerAttachment | null>;
  findByAnswerId(answerId: string): Promise<FormAnswerAttachment[]>;
  findByAnswerIds(answerIds: string[]): Promise<FormAnswerAttachment[]>;
  create(attachment: CreateFormAnswerAttachment): Promise<FormAnswerAttachment>;
  delete(id: string): Promise<void>;
}

export interface ISubmissionReviewRepository {
  findById(id: string): Promise<SubmissionReview | null>;
  findBySubmissionId(submissionId: string): Promise<SubmissionReview | null>;
  findByCompanyId(companyId: string): Promise<SubmissionReview[]>;
  create(review: CreateSubmissionReview): Promise<SubmissionReview>;
}
