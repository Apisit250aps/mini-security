import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormSubmission } from '@repo/domains/entities/form';
import type {
  ICreateCorrectionContext,
  ICreateCorrectionUseCase,
  IGetFormSubmissionContext,
  IGetFormSubmissionUseCase,
  IListFormSubmissionsContext,
  IListFormSubmissionsUseCase,
  ISaveFormSubmissionDraftContext,
  ISaveFormSubmissionDraftUseCase,
  IStartAssignmentSubmissionContext,
  IStartFormSubmissionUseCase,
  ISubmitFormSubmissionContext,
  ISubmitFormSubmissionUseCase,
  FormSubmissionDetail,
} from '@repo/domains/applications/form';
import type {
  IFormAnswerAttachmentRepository,
  IFormAnswerRepository,
  IFormAssignmentRepository,
  IFormFieldRepository,
  IFormOccurrenceRepository,
  IFormPlanRepository,
  IFormReviewEntryRepository,
  IFormSectionRepository,
  IFormSubmissionContributorRepository,
  IFormSubmissionRepository,
  IFormTemplateRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import {
  BadRequestError,
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

// ==========================================
// 1. Start Form Submission
// ==========================================

export class StartFormSubmissionUseCase implements IStartFormSubmissionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_submission:create')
  async execute(context: IStartAssignmentSubmissionContext): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const assignment = await this.assignmentRepo.findById(context.assignmentId);
      if (!assignment || (companyId && assignment.companyId !== companyId)) {
        throw new NotFoundError('Assignment not found');
      }
      if (assignment.cancelledAt != null) {
        throw new BadRequestError('Assignment is cancelled');
      }

      const occurrence = await this.occurrenceRepo.findById(assignment.occurrenceId);
      if (!occurrence || occurrence.cancelledAt != null) {
        throw new BadRequestError('Occurrence is cancelled');
      }

      const member = await this.memberRepo.findById(memberId);
      if (!member || (companyId && member.companyId !== companyId)) {
        throw new NotFoundError('Member not found');
      }

      if (
        assignment.companyMemberId !== memberId &&
        assignment.roleId !== member.roleId
      ) {
        throw new ForbiddenError('You are not authorized for this assignment');
      }

      const draft = await this.submissionRepo.findDraftByAssignmentId(
        context.assignmentId,
        assignment.companyId,
      );

      if (draft) {
        if (draft.submittedAt == null) {
          const isContributor = await this.contributorRepo.isContributor(
            draft.id,
            memberId,
          );
          if (!isContributor) {
            await this.contributorRepo.create({
              companyId: draft.companyId,
              submissionId: draft.id,
              memberId,
            });
          }
          return draft;
        }
      }

      const submission = await this.submissionRepo.create({
        companyId: assignment.companyId,
        assignmentId: assignment.id,
        formVersionId: assignment.formVersionId,
        startedBy: memberId,
        submittedBy: null,
        revision: 1,
        supersedesSubmissionId: null,
        submittedAt: null,
      });

      await this.contributorRepo.create({
        companyId: submission.companyId,
        submissionId: submission.id,
        memberId,
      });

      return submission;
    });
  }
}

// ==========================================
// 2. Save Form Submission Draft
// ==========================================

export class SaveFormSubmissionDraftUseCase implements ISaveFormSubmissionDraftUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_submission:update')
  async execute(context: ISaveFormSubmissionDraftContext): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const submission = await this.submissionRepo.findById(context.submissionId);
      if (!submission || (companyId && submission.companyId !== companyId)) {
        throw new NotFoundError('Form submission not found');
      }
      if (submission.submittedAt != null) {
        throw new BadRequestError('Cannot edit answers for a submitted form');
      }

      const isContributor = await this.contributorRepo.isContributor(
        submission.id,
        memberId,
      );
      if (!isContributor) {
        const assignment = await this.assignmentRepo.findById(submission.assignmentId);
        if (!assignment) throw new NotFoundError('Assignment not found');

        const member = await this.memberRepo.findById(memberId);
        if (!member) throw new NotFoundError('Member not found');

        if (
          assignment.companyMemberId !== memberId &&
          assignment.roleId !== member.roleId
        ) {
          throw new ForbiddenError('You are not authorized to edit this submission');
        }
      }

      if (submission.revision !== context.expectedRevision) {
        throw new DuplicateError(
          'Optimistic lock conflict: form submission has been modified. Please refresh and retry.',
        );
      }

      for (const ans of context.answers) {
        await this.answerRepo.upsertAnswer({
          companyId: submission.companyId,
          formVersionId: submission.formVersionId,
          submissionId: submission.id,
          fieldId: ans.fieldId,
          value: ans.value ?? null,
          updatedBy: memberId,
        });
      }

      if (!isContributor) {
        await this.contributorRepo.create({
          companyId: submission.companyId,
          submissionId: submission.id,
          memberId,
        });
      }

      return this.submissionRepo.update(submission.id, {
        revision: submission.revision + 1,
      });
    });
  }
}

// ==========================================
// 3. Submit Form Submission
// ==========================================

export class SubmitFormSubmissionUseCase implements ISubmitFormSubmissionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly planRepo: IFormPlanRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly attachmentRepo: IFormAnswerAttachmentRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_submission:submit')
  async execute(context: ISubmitFormSubmissionContext): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const submission = await this.submissionRepo.findById(context.submissionId);
      if (!submission || (companyId && submission.companyId !== companyId)) {
        throw new NotFoundError('Form submission not found');
      }
      if (submission.submittedAt != null) {
        throw new BadRequestError('Cannot submit an already submitted form');
      }

      const isContributor = await this.contributorRepo.isContributor(
        submission.id,
        memberId,
      );
      const assignment = await this.assignmentRepo.findById(submission.assignmentId);
      if (!assignment) throw new NotFoundError('Assignment not found');

      if (!isContributor) {
        const member = await this.memberRepo.findById(memberId);
        if (!member) throw new NotFoundError('Member not found');
        if (
          assignment.companyMemberId !== memberId &&
          assignment.roleId !== member.roleId
        ) {
          throw new ForbiddenError('You are not authorized to submit this form');
        }
      }

      if (submission.revision !== context.expectedRevision) {
        throw new DuplicateError(
          'Optimistic lock conflict: form submission has been modified.',
        );
      }

      const occurrence = await this.occurrenceRepo.findById(assignment.occurrenceId);
      if (!occurrence) throw new NotFoundError('Occurrence not found');

      const plan = await this.planRepo.findById(occurrence.planId);
      if (!plan) throw new NotFoundError('Plan not found');

      if (occurrence.dueAt.getTime() < Date.now() && plan.latePolicy === 'DENY') {
        throw new BadRequestError('Submission is past due');
      }

      const fields = await this.fieldRepo.findByVersionId(submission.formVersionId);
      const answers = await this.answerRepo.findBySubmissionId(submission.id);
      const answerMap = new Map(answers.map((a) => [a.fieldId, a]));

      for (const field of fields) {
        const answer = answerMap.get(field.id);
        if (field.isRequired) {
          if (field.type === 'IMAGE' || field.type === 'FILE') {
            if (!answer) {
              throw new ValidationError(
                `Required field "${field.label}" has no attachments`,
              );
            }
            const attachments = await this.attachmentRepo.findByAnswerId(answer.id);
            if (attachments.length === 0) {
              throw new ValidationError(
                `Required field "${field.label}" requires at least one attachment`,
              );
            }
          } else {
            if (
              !answer ||
              answer.value === null ||
              answer.value === undefined ||
              answer.value === ''
            ) {
              throw new ValidationError(
                `Required question "${field.label}" must be answered before submitting`,
              );
            }
          }
        } else {
          if (!answer) {
            await this.answerRepo.upsertAnswer({
              companyId: submission.companyId,
              formVersionId: submission.formVersionId,
              submissionId: submission.id,
              fieldId: field.id,
              value: null,
              updatedBy: memberId,
            });
          }
        }
      }

      if (!isContributor) {
        await this.contributorRepo.create({
          companyId: submission.companyId,
          submissionId: submission.id,
          memberId,
        });
      }

      return this.submissionRepo.update(submission.id, {
        submittedBy: memberId,
        submittedAt: new Date(),
        revision: submission.revision + 1,
      });
    });
  }
}

// ==========================================
// 4. Create Correction Submission
// ==========================================

export class CreateCorrectionUseCase implements ICreateCorrectionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly attachmentRepo: IFormAnswerAttachmentRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_submission:create')
  async execute(context: ICreateCorrectionContext): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const original = await this.submissionRepo.findById(context.submissionId);
      if (!original || (companyId && original.companyId !== companyId)) {
        throw new NotFoundError('Original submission not found');
      }
      if (original.submittedAt == null) {
        throw new BadRequestError('Submission has not been submitted yet');
      }

      const review = await this.reviewEntryRepo.findHeadByTarget(original.id, 'final');
      if (!review || review.action !== 'RETURN') {
        throw new BadRequestError('Only RETURNED submissions can be corrected');
      }

      const existingClone = await this.submissionRepo.findBySupersedesId(original.id);
      if (existingClone) {
        throw new DuplicateError('A correction for this response already exists');
      }

      const clone = await this.submissionRepo.create({
        companyId: original.companyId,
        assignmentId: original.assignmentId,
        formVersionId: original.formVersionId,
        startedBy: memberId,
        submittedBy: null,
        revision: 1,
        supersedesSubmissionId: original.id,
        submittedAt: null,
      });

      const originalAnswers = await this.answerRepo.findBySubmissionId(original.id);
      for (const ans of originalAnswers) {
        const newAnswer = await this.answerRepo.create({
          companyId: original.companyId,
          formVersionId: original.formVersionId,
          submissionId: clone.id,
          fieldId: ans.fieldId,
          value: ans.value ?? null,
          updatedBy: ans.updatedBy,
        });

        const attachments = await this.attachmentRepo.findByAnswerId(ans.id);
        for (const att of attachments) {
          await this.attachmentRepo.create({
            companyId: original.companyId,
            answerId: newAnswer.id,
            storageKey: att.storageKey,
            originalName: att.originalName,
            mimeType: att.mimeType,
            sizeBytes: att.sizeBytes,
            sortOrder: att.sortOrder,
            uploadedBy: att.uploadedBy,
          });
        }
      }

      const originalContributors = await this.contributorRepo.findBySubmissionId(original.id);
      const memberIdSet = new Set(originalContributors.map((c) => c.memberId));
      memberIdSet.add(memberId);

      for (const mId of memberIdSet) {
        await this.contributorRepo.create({
          companyId: original.companyId,
          submissionId: clone.id,
          memberId: mId,
        });
      }

      return clone;
    });
  }
}

// ==========================================
// 5. Get Form Submission Detail
// ==========================================

export class GetFormSubmissionUseCase implements IGetFormSubmissionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_submission:read')
  async execute(context: IGetFormSubmissionContext): Promise<FormSubmissionDetail | null> {
    return this.unitOfWork.transaction(async () => {
      const submission = await this.submissionRepo.findById(context.id);
      if (!submission || submission.companyId !== context.companyId) return null;

      const [
        version,
        sections,
        fields,
        answers,
        contributors,
      ] = await Promise.all([
        this.versionRepo.findById(submission.formVersionId),
        this.sectionRepo.findByVersionId(submission.formVersionId),
        this.fieldRepo.findByVersionId(submission.formVersionId),
        this.answerRepo.findBySubmissionId(submission.id),
        this.contributorRepo.findBySubmissionId(submission.id),
      ]);

      const template = version
        ? await this.templateRepo.findById(version.formTemplateId)
        : null;

      return {
        submission,
        template,
        version,
        sections,
        fields,
        answers,
        contributors,
      };
    });
  }
}

// ==========================================
// 6. List Form Submissions
// ==========================================

export class ListFormSubmissionsUseCase implements IListFormSubmissionsUseCase {
  constructor(private readonly submissionRepo: IFormSubmissionRepository) {}

  @RequirePermission('form_submission:read')
  async execute(context: IListFormSubmissionsContext): Promise<FormSubmission[]> {
    if (context.assignmentId && context.companyId) {
      return this.submissionRepo.findByAssignmentId(context.assignmentId, context.companyId);
    }
    if (context.companyId) {
      return this.submissionRepo.findByCompanyId(context.companyId);
    }
    return this.submissionRepo.findAll();
  }
}
