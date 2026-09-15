import type { BaseRepository } from '../index';
import type {
  FormAnswer, FormAnswerAttachment, FormField, FormSection, FormSubmission, FormSubmissionContributor, FormTemplate, FormVersion,
  FormPlan, FormPlanTarget, FormPlanPeriod, FormOccurrence, FormAssignment, FormReviewEntry
} from '#entities/form';
import type {
  CreateFormAnswer, CreateFormAnswerAttachment, CreateFormField, CreateFormSection, CreateFormSubmission, CreateFormSubmissionContributor,
  CreateFormTemplate, CreateFormVersion, UpdateFormAnswer, UpdateFormField, UpdateFormSection, UpdateFormSubmission, UpdateFormTemplate, UpdateFormVersion,
  CreateFormPlan, UpdateFormPlan, CreateFormPlanTarget, CreateFormPlanPeriod, CreateFormOccurrence, UpdateFormOccurrence, CreateFormAssignment, UpdateFormAssignment, CreateFormReviewEntry
} from '#schema/form';

export interface IFormTemplateRepository extends BaseRepository<FormTemplate, CreateFormTemplate, UpdateFormTemplate> {
  findByCompanyId(companyId: string): Promise<FormTemplate[]>;
  findByIdAndCompany(id: string, companyId: string): Promise<FormTemplate | null>;
}

export interface IFormVersionRepository extends BaseRepository<FormVersion, CreateFormVersion, UpdateFormVersion> {
  findByTemplateId(templateId: string): Promise<FormVersion[]>;
  findPublishedByTemplateId(templateId: string): Promise<FormVersion | null>;
  findDraftByTemplateId(templateId: string): Promise<FormVersion | null>;
  findByTemplateAndVersion(templateId: string, version: number): Promise<FormVersion | null>;
  getLatestVersionNumber(templateId: string): Promise<number>;
}

export interface IFormSectionRepository extends BaseRepository<FormSection, CreateFormSection, UpdateFormSection> {
  findByVersionId(versionId: string): Promise<FormSection[]>;
  deleteByVersionId(versionId: string): Promise<void>;
  reorderItems(items: Array<{ id: string; sortOrder: number }>): Promise<void>;
}

export interface IFormFieldRepository extends BaseRepository<FormField, CreateFormField, UpdateFormField> {
  findByVersionId(versionId: string): Promise<FormField[]>;
  findBySectionId(sectionId: string): Promise<FormField[]>;
  deleteByVersionId(versionId: string): Promise<void>;
  reorderItems(items: Array<{ id: string; sortOrder: number }>): Promise<void>;
}

export interface IFormPlanRepository extends BaseRepository<FormPlan, CreateFormPlan, UpdateFormPlan> {
  findByTemplateId(templateId: string, companyId: string): Promise<FormPlan[]>;
  findActive(companyId: string, templateId: string): Promise<FormPlan | null>;
  listPlans(companyId: string, page: number, limit: number): Promise<FormPlan[]>;
}

export interface IFormPlanTargetRepository {
  findByPlanId(planId: string): Promise<FormPlanTarget[]>;
  create(target: CreateFormPlanTarget): Promise<FormPlanTarget>;
  delete(id: string): Promise<void>;
}

export interface IFormPlanPeriodRepository {
  findByPlanId(planId: string): Promise<FormPlanPeriod[]>;
  create(period: CreateFormPlanPeriod): Promise<FormPlanPeriod>;
}

export interface IFormOccurrenceRepository {
  findById(id: string): Promise<FormOccurrence | null>;
  findByPlanId(planId: string): Promise<FormOccurrence[]>;
  findByOccurrenceKey(planId: string, occurrenceKey: string): Promise<FormOccurrence | null>;
  create(occurrence: CreateFormOccurrence): Promise<FormOccurrence>;
  cancel(id: string, update: UpdateFormOccurrence): Promise<FormOccurrence>;
  list(companyId: string): Promise<FormOccurrence[]>;
}

export interface IFormAssignmentRepository {
  findById(id: string): Promise<FormAssignment | null>;
  findByOccurrenceId(occurrenceId: string): Promise<FormAssignment[]>;
  findByMemberId(companyId: string, memberId: string): Promise<FormAssignment[]>;
  findByRoleId(companyId: string, roleId: string): Promise<FormAssignment[]>;
  findActiveByOccurrenceAndRole(occurrenceId: string, roleId: string): Promise<FormAssignment | null>;
  findActiveByOccurrenceAndMember(occurrenceId: string, memberId: string): Promise<FormAssignment | null>;
  create(assignment: CreateFormAssignment): Promise<FormAssignment>;
  cancel(id: string, update: UpdateFormAssignment): Promise<FormAssignment>;
}

export interface IFormSubmissionRepository extends BaseRepository<FormSubmission, CreateFormSubmission, UpdateFormSubmission> {
  findByCompanyId(companyId: string): Promise<FormSubmission[]>;
  findByAssignmentId(assignmentId: string, companyId: string): Promise<FormSubmission[]>;
  findDraftByAssignmentId(assignmentId: string, companyId: string): Promise<FormSubmission | null>;
  findBySupersedesId(supersedesId: string): Promise<FormSubmission | null>;
}

export interface IFormSubmissionContributorRepository {
  findBySubmissionId(submissionId: string): Promise<FormSubmissionContributor[]>;
  create(entity: CreateFormSubmissionContributor): Promise<FormSubmissionContributor>;
  isContributor(submissionId: string, memberId: string): Promise<boolean>;
  findMemberIdsForRevisionLineage(submissionId: string): Promise<string[]>;
}

export interface IFormAnswerRepository extends BaseRepository<FormAnswer, CreateFormAnswer, UpdateFormAnswer> {
  findBySubmissionId(submissionId: string): Promise<FormAnswer[]>;
  findBySubmissionAndField(submissionId: string, fieldId: string): Promise<FormAnswer | null>;
  upsertAnswer(answer: CreateFormAnswer): Promise<FormAnswer>;
}

export interface IFormAnswerAttachmentRepository {
  findById(id: string): Promise<FormAnswerAttachment | null>;
  findByAnswerId(answerId: string): Promise<FormAnswerAttachment[]>;
  findByAnswerIds(answerIds: string[]): Promise<FormAnswerAttachment[]>;
  create(attachment: CreateFormAnswerAttachment): Promise<FormAnswerAttachment>;
  delete(id: string): Promise<void>;
}

export interface IFormReviewEntryRepository {
  findBySubmissionId(submissionId: string): Promise<FormReviewEntry[]>;
  findHeadByTarget(submissionId: string, targetType: 'answer' | 'section' | 'final', targetId?: string): Promise<FormReviewEntry | null>;
  create(entry: CreateFormReviewEntry): Promise<FormReviewEntry>;
  list(companyId: string): Promise<FormReviewEntry[]>;
}
