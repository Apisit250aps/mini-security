import { hasFormPermission, requireAssignmentMember } from './form-access';
import { PermissionGuard } from '../../lib/guard';
import { requireRevisionMatch } from '../../lib/concurrency';
import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  IListReviewQueueUseCase,
  ReviewQueueItem,
  IGetReviewDetailUseCase,
  IRecordAnswerReviewUseCase,
  IRecordSectionReviewUseCase,
  IFinalizeSubmissionReviewUseCase,
} from '@repo/domains/applications/form';
import type {
  FormSubmission,
  FormReviewEntry,
} from '@repo/domains/entities/form';
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
  IFormVersionRepository,
  IFormTemplateRepository,
} from '@repo/domains/repositories/form';
import type { IOrganizationMemberRepository } from '@repo/domains/repositories/organization';
import type { ISecurityContext } from '@repo/domains/constants';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  DuplicateError,
} from '../../lib/error';

async function requireReviewActor(
  context: ISecurityContext,
  submission: FormSubmission,
  members: IOrganizationMemberRepository,
  contributors: IFormSubmissionContributorRepository,
) {
  PermissionGuard.requireOrganizationScope(context, submission.organizationId);
  const actor = context.memberId
    ? await members.findById(context.memberId)
    : null;
  if (
    !actor?.isActive ||
    actor.organizationId !== submission.organizationId ||
    actor.userId !== context.user?.id
  )
    throw new ForbiddenError('Active organization membership is required');
  const ids = new Set(
    [
      ...(await contributors.findMemberIdsForRevisionLineage(submission.id)),
      submission.startedBy,
      submission.submittedBy,
    ].filter((id): id is string => !!id),
  );
  const participants = await Promise.all(
    [...ids].map((id) => members.findById(id)),
  );
  if (
    participants.some((member) => member?.userId === actor.userId) &&
    !hasFormPermission(context, 'form_review:self')
  )
    throw new ForbiddenError(
      'Self-review requires form_review:self permission',
    );
}

export class ListReviewQueueUseCase implements IListReviewQueueUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly planRepo: IFormPlanRepository,
    private readonly versionRepo?: IFormVersionRepository,
    private readonly templateRepo?: IFormTemplateRepository,
    private readonly memberRepo?: IOrganizationMemberRepository,
  ) {}

  @RequirePermission('form_review:read')
  async execute(
    context: ISecurityContext & { organizationId: string },
  ): Promise<ReviewQueueItem[]> {
    const allReviews = await this.reviewEntryRepo.list(context.organizationId);
    const finalReviewSubIds = new Set(
      allReviews
        .filter(
          (r) => r.answerId == null && ['APPROVE', 'RETURN'].includes(r.action),
        )
        .map((r) => r.submissionId),
    );
    const allSubs = await this.submissionRepo.findByOrganizationId(
      context.organizationId,
    );
    const pendingSubs: FormSubmission[] = [];
    for (const sub of allSubs) {
      if (!sub.submittedAt || finalReviewSubIds.has(sub.id)) continue;
      const assignment = await this.assignmentRepo.findById(sub.assignmentId);
      if (!assignment || assignment.cancelledAt) continue;
      const occurrence = await this.occurrenceRepo.findById(
        assignment.occurrenceId,
      );
      if (!occurrence || occurrence.cancelledAt) continue;
      const plan = await this.planRepo.findById(occurrence.planId);
      if (plan) pendingSubs.push(sub);
    }

    if (!this.versionRepo || !this.templateRepo) {
      return pendingSubs as ReviewQueueItem[];
    }

    const versionIds = [...new Set(pendingSubs.map((s) => s.formVersionId))];
    const versions = await Promise.all(
      versionIds.map((id) => this.versionRepo!.findById(id)),
    );
    const versionMap = new Map(
      versions
        .filter((v): v is NonNullable<typeof v> => v != null)
        .map((v) => [v.id, v]),
    );

    const templateIds = [
      ...new Set(Array.from(versionMap.values()).map((v) => v.formTemplateId)),
    ];
    const templates = await Promise.all(
      templateIds.map((id) => this.templateRepo!.findById(id)),
    );
    const templateMap = new Map(
      templates
        .filter((t): t is NonNullable<typeof t> => t != null)
        .map((t) => [t.id, t]),
    );

    const memberIds = [
      ...new Set(
        pendingSubs
          .map((s) => s.submittedBy)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const members = this.memberRepo
      ? await Promise.all(memberIds.map((id) => this.memberRepo!.findById(id)))
      : [];
    const memberMap = new Map(
      members
        .filter((m): m is NonNullable<typeof m> => m != null)
        .map((m) => [m.id, m]),
    );

    return pendingSubs.map((sub) => {
      const version = versionMap.get(sub.formVersionId);
      const template = version ? templateMap.get(version.formTemplateId) : null;
      const member = sub.submittedBy ? memberMap.get(sub.submittedBy) : null;

      return {
        ...sub,
        templateName: template?.name,
        submitterName: member?.userId
          ? `พนักงาน ID: ${member.userId.slice(0, 8)}`
          : null,
      } as ReviewQueueItem;
    });
  }
}

export class GetReviewDetailUseCase implements IGetReviewDetailUseCase {
  constructor(
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: IOrganizationMemberRepository,
  ) {}

  async execute(
    context: ISecurityContext & { submissionId: string },
  ): Promise<FormReviewEntry[]> {
    await PermissionGuard.requirePermission(
      hasFormPermission(context, 'form_review:read')
        ? 'form_review:read'
        : 'form_submission:read',
      context,
    );
    const submission = await this.submissionRepo.findById(context.submissionId);
    if (!submission) throw new NotFoundError('Submission not found');
    PermissionGuard.requireOrganizationScope(
      context,
      submission.organizationId,
    );
    if (!hasFormPermission(context, 'form_review:read')) {
      const assignment = await this.assignmentRepo.findById(
        submission.assignmentId,
      );
      if (!assignment) throw new NotFoundError('Assignment not found');
      await requireAssignmentMember(context, assignment, this.memberRepo);
    }
    const entries = await this.reviewEntryRepo.findBySubmissionId(
      context.submissionId,
    );
    return entries.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }
}

export class RecordAnswerReviewUseCase implements IRecordAnswerReviewUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: IOrganizationMemberRepository,
  ) {}

  @RequirePermission('form_review:answer')
  async execute(
    context: ISecurityContext & {
      submissionId: string;
      expectedRevision: number;
      answerId: string;
      action: FormReviewAction;
      note?: string;
      supersedesEntryId?: string;
    },
  ): Promise<FormReviewEntry> {
    return this.unitOfWork.transaction(async () => {
      const memberId = context.memberId as string;
      const organizationId = context.organizationId!;
      const submission = await this.submissionRepo.findById(
        context.submissionId,
      );
      if (!submission) throw new NotFoundError('Submission not found');
      if (submission.organizationId !== organizationId)
        throw new ForbiddenError('Organization mismatch');
      if (!submission.submittedAt)
        throw new BadRequestError('Submission is not submitted');
      requireRevisionMatch(
        submission.revision,
        context.expectedRevision,
        () => new DuplicateError('Review changed. Refresh and retry.'),
      );

      const finalEntry = await this.reviewEntryRepo.findHeadByTarget(
        submission.id,
        'final',
      );
      if (finalEntry)
        throw new BadRequestError('Submission is already finalized');

      await requireReviewActor(
        context,
        submission,
        this.memberRepo,
        this.contributorRepo,
      );

      if (context.action === 'APPROVE' || context.action === 'RETURN') {
        throw new BadRequestError('Invalid action for answer review');
      }
      if (
        context.action === 'NEEDS_CHANGES' &&
        (!context.note || context.note.trim().length === 0)
      ) {
        throw new BadRequestError('Note is required for NEEDS_CHANGES');
      }

      const answer = await this.answerRepo.findById(context.answerId);
      if (!answer || answer.submissionId !== submission.id) {
        throw new NotFoundError('Answer not found in this submission');
      }

      const headEntry = await this.reviewEntryRepo.findHeadByTarget(
        submission.id,
        'answer',
        context.answerId,
      );
      if ((headEntry?.id ?? null) !== (context.supersedesEntryId ?? null))
        throw new DuplicateError(
          'supersedesEntryId must match the current review head',
        );

      await this.submissionRepo.update(submission.id, {
        revision: submission.revision + 1,
      });
      return await this.reviewEntryRepo.create({
        organizationId,
        submissionId: submission.id,
        formVersionId: submission.formVersionId,
        answerId: context.answerId,
        action: context.action,
        note: context.note?.trim() ?? null,
        reviewedBy: memberId,
        supersedesEntryId: context.supersedesEntryId ?? null,
      });
    });
  }
}

/** Section review is an atomic batch of answer reviews, with no section result persisted. */
export class RecordSectionReviewUseCase implements IRecordSectionReviewUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: IOrganizationMemberRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_review:section')
  async execute(
    context: ISecurityContext & {
      submissionId: string;
      expectedRevision: number;
      sectionId: string;
      action: FormReviewAction;
      note?: string;
    },
  ): Promise<FormReviewEntry[]> {
    return this.unitOfWork.transaction(async () => {
      const submission = await this.submissionRepo.findById(
        context.submissionId,
      );
      if (!submission) throw new NotFoundError('Submission not found');
      if (!submission.submittedAt)
        throw new BadRequestError('Submission is not submitted');
      requireRevisionMatch(
        submission.revision,
        context.expectedRevision,
        () => new DuplicateError('Review changed. Refresh and retry.'),
      );
      await requireReviewActor(
        context,
        submission,
        this.memberRepo,
        this.contributorRepo,
      );
      if (await this.reviewEntryRepo.findHeadByTarget(submission.id, 'final'))
        throw new BadRequestError('Submission is already finalized');
      if (context.action !== 'PASS' && context.action !== 'NEEDS_CHANGES')
        throw new BadRequestError('Invalid answer review action');
      if (context.action === 'NEEDS_CHANGES' && !context.note?.trim())
        throw new BadRequestError('Note is required for NEEDS_CHANGES');
      const section = await this.sectionRepo.findById(context.sectionId);
      if (!section || section.formVersionId !== submission.formVersionId)
        throw new NotFoundError('Section not found in this form version');
      const fields = (
        await this.fieldRepo.findByVersionId(submission.formVersionId)
      ).filter((f) => f.formSectionId === section.id);
      const answers = await this.answerRepo.findBySubmissionId(submission.id);
      const results: FormReviewEntry[] = [];
      for (const field of fields) {
        const answer = answers.find((a) => a.fieldId === field.id);
        if (!answer)
          throw new BadRequestError('A field has no answer to review');
        const head = await this.reviewEntryRepo.findHeadByTarget(
          submission.id,
          'answer',
          answer.id,
        );
        results.push(
          await this.reviewEntryRepo.create({
            organizationId: submission.organizationId,
            submissionId: submission.id,
            formVersionId: submission.formVersionId,
            answerId: answer.id,
            action: context.action,
            note: context.note?.trim() ?? null,
            reviewedBy: context.memberId!,
            supersedesEntryId: head?.id ?? null,
          }),
        );
      }
      if (results.length)
        await this.submissionRepo.update(submission.id, {
          revision: submission.revision + 1,
        });
      return results;
    });
  }
}

export class FinalizeSubmissionReviewUseCase
  implements IFinalizeSubmissionReviewUseCase
{
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly reviewEntryRepo: IFormReviewEntryRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: IOrganizationMemberRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly planRepo: IFormPlanRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_review:finalize')
  async execute(
    context: ISecurityContext & {
      submissionId: string;
      expectedRevision: number;
      action: FormReviewAction;
      note?: string;
    },
  ): Promise<FormReviewEntry> {
    return this.unitOfWork.transaction(async () => {
      const memberId = context.memberId as string;
      const organizationId = context.organizationId!;
      const submission = await this.submissionRepo.findById(
        context.submissionId,
      );
      if (!submission) throw new NotFoundError('Submission not found');
      if (submission.organizationId !== organizationId)
        throw new ForbiddenError('Organization mismatch');
      if (!submission.submittedAt)
        throw new BadRequestError('Submission is not submitted');
      requireRevisionMatch(
        submission.revision,
        context.expectedRevision,
        () => new DuplicateError('Review changed. Refresh and retry.'),
      );

      const existingFinal = await this.reviewEntryRepo.findHeadByTarget(
        submission.id,
        'final',
      );
      if (existingFinal)
        throw new BadRequestError('Submission is already finalized');

      await requireReviewActor(
        context,
        submission,
        this.memberRepo,
        this.contributorRepo,
      );

      if (context.action !== 'APPROVE' && context.action !== 'RETURN') {
        throw new BadRequestError('Finalize action must be APPROVE or RETURN');
      }

      const assignment = await this.assignmentRepo.findById(
        submission.assignmentId,
      );
      if (!assignment) throw new NotFoundError('Assignment not found');
      const occurrence = await this.occurrenceRepo.findById(
        assignment.occurrenceId,
      );
      if (!occurrence) throw new NotFoundError('Occurrence not found');
      const plan = await this.planRepo.findById(occurrence.planId);
      if (!plan) throw new NotFoundError('Plan not found');

      const allEntries = await this.reviewEntryRepo.findBySubmissionId(
        submission.id,
      );
      const supersededIds = new Set(
        allEntries.map((e) => e.supersedesEntryId).filter((id) => id != null),
      );
      const headEntries = allEntries.filter((e) => !supersededIds.has(e.id));

      if (
        context.action === 'RETURN' &&
        (!context.note || context.note.trim().length === 0)
      ) {
        throw new BadRequestError('Note is required for RETURN');
      }

      if (context.action === 'APPROVE') {
        const hasNeedsChanges = headEntries.some(
          (e) => e.action === 'NEEDS_CHANGES',
        );
        if (hasNeedsChanges) {
          throw new BadRequestError(
            'Cannot APPROVE while there are active NEEDS_CHANGES entries',
          );
        }
      }

      await this.submissionRepo.update(submission.id, {
        revision: submission.revision + 1,
      });
      return await this.reviewEntryRepo.create({
        organizationId,
        submissionId: submission.id,
        formVersionId: submission.formVersionId,
        answerId: null,
        action: context.action,
        note: context.note?.trim() ?? null,
        reviewedBy: memberId,
        supersedesEntryId: null,
      });
    });
  }
}
