import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { SubmissionReview } from '@repo/domains/entities/form';
import type {
  IReviewFormSubmissionContext,
  IReviewFormSubmissionUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormSubmissionContributorRepository,
  IFormSubmissionRepository,
  ISubmissionReviewRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class ReviewFormSubmissionUseCase
  implements IReviewFormSubmissionUseCase
{
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly reviewRepo: ISubmissionReviewRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly roleRepo: IRoleRepository,
  ) {}

  @RequirePermission('form_submission:review')
  async execute(
    context: IReviewFormSubmissionContext,
  ): Promise<SubmissionReview> {
    return this.unitOfWork.transaction(async () => {
      const submission = await this.submissionRepo.findById(
        context.submissionId,
      );
      if (!submission) {
        throw new NotFoundError('Form submission not found');
      }

      if (submission.status !== 'SUBMITTED') {
        throw new BadRequestError(
          `Only SUBMITTED forms can be reviewed (current status: ${submission.status})`,
        );
      }

      // 1. Verify reviewer is an active member in the same company
      const reviewerMember = await this.memberRepo.findById(context.memberId);
      if (
        !reviewerMember ||
        !reviewerMember.isActive ||
        reviewerMember.companyId !== submission.companyId
      ) {
        throw new ForbiddenError(
          'Reviewer must be an active member of the company',
        );
      }

      // 2. Verify reviewer role has role_type = OWNER
      const reviewerRole = await this.roleRepo.findById(reviewerMember.roleId);
      if (!reviewerRole || reviewerRole.roleType !== 'OWNER') {
        throw new ForbiddenError(
          'Only users with OWNER role are authorized to approve or reject submissions',
        );
      }

      // 3. Anti-Self-Approval Rule:
      // Reviewer userId must not match startedBy, submittedBy, or any contributor in this submission or its revision lineage!
      const lineageMemberIds =
        await this.contributorRepo.findMemberIdsForRevisionLineage(
          submission.id,
        );

      // Also include startedBy and submittedBy
      lineageMemberIds.push(submission.startedBy);
      if (submission.submittedBy) {
        lineageMemberIds.push(submission.submittedBy);
      }

      // Lookup userIds for all lineage members
      const lineageUserIds = new Set<string>();
      for (const mId of lineageMemberIds) {
        const m = await this.memberRepo.findById(mId);
        if (m) {
          lineageUserIds.add(m.userId);
        }
      }

      if (lineageUserIds.has(reviewerMember.userId)) {
        throw new ForbiddenError(
          'Self-approval violation: An owner who started, submitted, or contributed to this response cannot review it.',
        );
      }

      // 4. Validate rejection note
      if (context.action === 'REJECT') {
        if (!context.note || context.note.trim().length === 0) {
          throw new ValidationError(
            'A non-empty rejection reason note is required when rejecting a submission',
          );
        }
      }

      // 5. Create submission review record
      const review = await this.reviewRepo.create({
        companyId: submission.companyId,
        submissionId: submission.id,
        reviewedBy: context.memberId,
        action: context.action,
        note: context.note?.trim() ?? null,
      });

      // 6. Update submission status to APPROVED or REJECTED
      const newStatus = context.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      await this.submissionRepo.update(submission.id, {
        status: newStatus,
        revision: submission.revision + 1,
      });

      return review;
    });
  }
}
