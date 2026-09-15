import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  IListReviewQueueUseCase,
  IGetReviewDetailUseCase,
  IRecordAnswerReviewUseCase,
  IRecordSectionReviewUseCase,
  IFinalizeSubmissionReviewUseCase,
} from '@repo/domains/applications/form';
import type { FormSubmission, FormReviewEntry } from '@repo/domains/entities/form';
import type { FormReviewAction } from '@repo/domains/schema/form';
import type {
  IFormSubmissionRepository,
  IFormReviewEntryRepository,
  IFormSubmissionContributorRepository,
  IFormAnswerRepository,
  IFormSectionRepository,
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormPlanRepository,
  IFormFieldRepository,
} from '@repo/domains/repositories/form';
import type { ISecurityContext } from '@repo/domains/constants';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/error';

export class ListReviewQueueUseCase implements IListReviewQueueUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
  ) {}

  @RequirePermission('form_review:read')
  async execute(context: ISecurityContext & { companyId: string }): Promise<FormSubmission[]> {
    const allReviews = await this.reviewEntryRepo.list(context.companyId);
    const finalReviewSubIds = new Set(
      allReviews
        .filter((r) => r.answerId == null && r.sectionId == null && ['APPROVE', 'RETURN'].includes(r.action))
        .map((r) => r.submissionId),
    );
    const allSubs = await this.submissionRepo.findByCompanyId(context.companyId);
    return allSubs.filter((sub) => sub.submittedAt != null && !finalReviewSubIds.has(sub.id));
  }
}

export class GetReviewDetailUseCase implements IGetReviewDetailUseCase {
  constructor(private readonly reviewEntryRepo: IFormReviewEntryRepository) {}

  @RequirePermission('form_review:read')
  async execute(context: ISecurityContext & { submissionId: string }): Promise<FormReviewEntry[]> {
    const entries = await this.reviewEntryRepo.findBySubmissionId(context.submissionId);
    return entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export class RecordAnswerReviewUseCase implements IRecordAnswerReviewUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_review:answer')
  async execute(
    context: ISecurityContext & { submissionId: string; answerId: string; action: FormReviewAction; note?: string; supersedesEntryId?: string },
  ): Promise<FormReviewEntry> {
    const memberId = context.memberId as string;
    const companyId = context.companyId!;
    const submission = await this.submissionRepo.findById(context.submissionId);
    if (!submission) throw new NotFoundError('Submission not found');
    if (submission.companyId !== companyId) throw new ForbiddenError('Company mismatch');
    if (!submission.submittedAt) throw new BadRequestError('Submission is not submitted');

    const finalEntry = await this.reviewEntryRepo.findHeadByTarget(submission.id, 'final');
    if (finalEntry) throw new BadRequestError('Submission is already finalized');

    const lineageMemberIds = await this.contributorRepo.findMemberIdsForRevisionLineage(submission.id);
    const isContributor =
      lineageMemberIds.includes(memberId) || submission.startedBy === memberId || submission.submittedBy === memberId;
    if (isContributor && !(context.permissions ?? '').includes('form_review:self')) {
      throw new ForbiddenError('Self-review requires form_review:self permission');
    }

    if (context.action === 'APPROVE' || context.action === 'RETURN') {
      throw new BadRequestError('Invalid action for answer review');
    }
    if (context.action === 'NEEDS_CHANGES' && (!context.note || context.note.trim().length === 0)) {
      throw new BadRequestError('Note is required for NEEDS_CHANGES');
    }

    const answer = await this.answerRepo.findById(context.answerId);
    if (!answer || answer.submissionId !== submission.id) {
      throw new NotFoundError('Answer not found in this submission');
    }

    if (context.supersedesEntryId) {
      const headEntry = await this.reviewEntryRepo.findHeadByTarget(submission.id, 'answer', context.answerId);
      if (!headEntry || headEntry.id !== context.supersedesEntryId) {
        throw new BadRequestError('supersedesEntryId is not the current head');
      }
    }

    return await this.reviewEntryRepo.create({
      companyId,
      submissionId: submission.id,
      formVersionId: submission.formVersionId,
      answerId: context.answerId,
      sectionId: null,
      action: context.action,
      note: context.note?.trim() ?? null,
      reviewedBy: memberId,
      supersedesEntryId: context.supersedesEntryId ?? null,
    });
  }
}

export class RecordSectionReviewUseCase implements IRecordSectionReviewUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
  ) {}

  @RequirePermission('form_review:section')
  async execute(
    context: ISecurityContext & { submissionId: string; sectionId: string; action: FormReviewAction; note?: string; supersedesEntryId?: string },
  ): Promise<FormReviewEntry> {
    const memberId = context.memberId as string;
    const companyId = context.companyId!;
    const submission = await this.submissionRepo.findById(context.submissionId);
    if (!submission) throw new NotFoundError('Submission not found');
    if (submission.companyId !== companyId) throw new ForbiddenError('Company mismatch');
    if (!submission.submittedAt) throw new BadRequestError('Submission is not submitted');

    const finalEntry = await this.reviewEntryRepo.findHeadByTarget(submission.id, 'final');
    if (finalEntry) throw new BadRequestError('Submission is already finalized');

    const lineageMemberIds = await this.contributorRepo.findMemberIdsForRevisionLineage(submission.id);
    const isContributor =
      lineageMemberIds.includes(memberId) || submission.startedBy === memberId || submission.submittedBy === memberId;
    if (isContributor && !(context.permissions ?? '').includes('form_review:self')) {
      throw new ForbiddenError('Self-review requires form_review:self permission');
    }

    if (context.action === 'APPROVE' || context.action === 'RETURN') {
      throw new BadRequestError('Invalid action for section review');
    }
    if (context.action === 'NEEDS_CHANGES' && (!context.note || context.note.trim().length === 0)) {
      throw new BadRequestError('Note is required for NEEDS_CHANGES');
    }

    const section = await this.sectionRepo.findById(context.sectionId);
    if (!section || section.formVersionId !== submission.formVersionId) {
      throw new NotFoundError('Section not found in this form version');
    }

    if (context.supersedesEntryId) {
      const headEntry = await this.reviewEntryRepo.findHeadByTarget(submission.id, 'section', context.sectionId);
      if (!headEntry || headEntry.id !== context.supersedesEntryId) {
        throw new BadRequestError('supersedesEntryId is not the current head');
      }
    }

    return await this.reviewEntryRepo.create({
      companyId,
      submissionId: submission.id,
      formVersionId: submission.formVersionId,
      answerId: null,
      sectionId: context.sectionId,
      action: context.action,
      note: context.note?.trim() ?? null,
      reviewedBy: memberId,
      supersedesEntryId: context.supersedesEntryId ?? null,
    });
  }
}

export class FinalizeSubmissionReviewUseCase implements IFinalizeSubmissionReviewUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly planRepo: IFormPlanRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_review:finalize')
  async execute(
    context: ISecurityContext & { submissionId: string; action: FormReviewAction; note?: string },
  ): Promise<FormReviewEntry> {
    return this.unitOfWork.transaction(async () => {
      const memberId = context.memberId as string;
      const companyId = context.companyId!;
      const submission = await this.submissionRepo.findById(context.submissionId);
      if (!submission) throw new NotFoundError('Submission not found');
      if (submission.companyId !== companyId) throw new ForbiddenError('Company mismatch');
      if (!submission.submittedAt) throw new BadRequestError('Submission is not submitted');

      const existingFinal = await this.reviewEntryRepo.findHeadByTarget(submission.id, 'final');
      if (existingFinal) throw new BadRequestError('Submission is already finalized');

      const lineageMemberIds = await this.contributorRepo.findMemberIdsForRevisionLineage(submission.id);
      const isContributor =
        lineageMemberIds.includes(memberId) || submission.startedBy === memberId || submission.submittedBy === memberId;
      if (isContributor && !(context.permissions ?? '').includes('form_review:self')) {
        throw new ForbiddenError('Self-review requires form_review:self permission');
      }

      if (context.action !== 'APPROVE' && context.action !== 'RETURN') {
        throw new BadRequestError('Finalize action must be APPROVE or RETURN');
      }

      const assignment = await this.assignmentRepo.findById(submission.assignmentId);
      if (!assignment) throw new NotFoundError('Assignment not found');
      const occurrence = await this.occurrenceRepo.findById(assignment.occurrenceId);
      if (!occurrence) throw new NotFoundError('Occurrence not found');
      const plan = await this.planRepo.findById(occurrence.planId);
      if (!plan) throw new NotFoundError('Plan not found');

      const reviewMode = plan.reviewMode;
      if (reviewMode === 'NONE') {
        throw new BadRequestError('This submission does not require review');
      }

      const allEntries = await this.reviewEntryRepo.findBySubmissionId(submission.id);
      const supersededIds = new Set(allEntries.map((e) => e.supersedesEntryId).filter((id) => id != null));
      const headEntries = allEntries.filter((e) => !supersededIds.has(e.id));

      if (context.action === 'RETURN' && (!context.note || context.note.trim().length === 0)) {
        throw new BadRequestError('Note is required for RETURN');
      }

      if (context.action === 'APPROVE') {
        const hasNeedsChanges = headEntries.some((e) => e.action === 'NEEDS_CHANGES');
        if (hasNeedsChanges) {
          throw new BadRequestError('Cannot APPROVE while there are active NEEDS_CHANGES entries');
        }

        if (reviewMode === 'ALL_SECTIONS') {
          const sections = await this.sectionRepo.findByVersionId(submission.formVersionId);
          for (const section of sections) {
            const head = headEntries.find((e) => e.sectionId === section.id);
            if (!head || head.action !== 'PASS') {
              throw new BadRequestError(`Section ${section.title} must have PASS before APPROVE`);
            }
          }
        }

        if (reviewMode === 'ALL_ANSWERS') {
          const fields = await this.fieldRepo.findByVersionId(submission.formVersionId);
          const answers = await this.answerRepo.findBySubmissionId(submission.id);
          
          for (const field of fields) {
            const answer = answers.find((a) => a.fieldId === field.id);
            if (!answer) {
              throw new BadRequestError(`Missing answer for field ${field.label}`);
            }
            const head = headEntries.find((e) => e.answerId === answer.id);
            if (!head || head.action !== 'PASS') {
              throw new BadRequestError(`Answer for field ${field.label} must have PASS before APPROVE`);
            }
          }
        }
      }

      return await this.reviewEntryRepo.create({
        companyId,
        submissionId: submission.id,
        formVersionId: submission.formVersionId,
        answerId: null,
        sectionId: null,
        action: context.action,
        note: context.note?.trim() ?? null,
        reviewedBy: memberId,
        supersedesEntryId: null,
      });
    });
  }
}
