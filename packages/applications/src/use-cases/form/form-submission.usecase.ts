import { PermissionGuard } from '../../lib/guard';
import { requireRevisionMatch } from '../../lib/concurrency';
import {
  hasFormPermission,
  requireAssignmentMember,
  requireWritableAssignment,
} from './form-access';
import { validateFormAnswer } from './form-answer-validation';
import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  FormSubmission,
  FormReviewEntry,
} from '@repo/domains/entities/form';
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
  FormSubmissionItem,
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
import type { IUserRepository } from '@repo/domains/repositories/user';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
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
    private readonly planRepo?: IFormPlanRepository,
  ) {}

  @RequirePermission('form_submission:create')
  async execute(
    context: IStartAssignmentSubmissionContext,
  ): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const { assignment } = await requireWritableAssignment(
        context,
        context.assignmentId,
        this.assignmentRepo,
        this.occurrenceRepo,
        this.memberRepo,
        this.planRepo,
      );

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

      const previous = await this.submissionRepo.findByAssignmentId(
        assignment.id,
        assignment.companyId,
      );
      if (previous.length)
        throw new BadRequestError(
          'This assignment already has a submitted response. Open it to create a correction if returned.',
        );
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

export class SaveFormSubmissionDraftUseCase
  implements ISaveFormSubmissionDraftUseCase
{
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly answerRepo: IFormAnswerRepository,
    private readonly contributorRepo: IFormSubmissionContributorRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly planRepo?: IFormPlanRepository,
  ) {}

  @RequirePermission('form_submission:update')
  async execute(
    context: ISaveFormSubmissionDraftContext,
  ): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const submission = await this.submissionRepo.findById(
        context.submissionId,
      );
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
      await requireWritableAssignment(
        context,
        submission.assignmentId,
        this.assignmentRepo,
        this.occurrenceRepo,
        this.memberRepo,
        this.planRepo,
      );
      const fields = await this.fieldRepo.findByVersionId(
        submission.formVersionId,
      );
      const fieldMap = new Map(fields.map((field) => [field.id, field]));
      if (
        new Set(context.answers.map((answer) => answer.fieldId)).size !==
        context.answers.length
      ) {
        throw new ValidationError('Duplicate answer fields');
      }
      for (const answer of context.answers) {
        const field = fieldMap.get(answer.fieldId);
        if (!field)
          throw new ValidationError(
            'Field does not belong to this form version',
          );
        await validateFormAnswer(field, answer.value);
      }

      requireRevisionMatch(
        submission.revision,
        context.expectedRevision,
        () =>
          new DuplicateError(
            'Optimistic lock conflict: form submission has been modified. Please refresh and retry.',
          ),
      );

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

export class SubmitFormSubmissionUseCase
  implements ISubmitFormSubmissionUseCase
{
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
  async execute(
    context: ISubmitFormSubmissionContext,
  ): Promise<FormSubmission> {
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!context.memberId) {
        throw new BadRequestError('Member ID is required');
      }
      const memberId = context.memberId;

      const submission = await this.submissionRepo.findById(
        context.submissionId,
      );
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
      const { occurrence } = await requireWritableAssignment(
        context,
        submission.assignmentId,
        this.assignmentRepo,
        this.occurrenceRepo,
        this.memberRepo,
      );

      requireRevisionMatch(
        submission.revision,
        context.expectedRevision,
        () =>
          new DuplicateError(
            'Optimistic lock conflict: form submission has been modified.',
          ),
      );

      const plan = await this.planRepo.findById(occurrence.planId);
      if (!plan) throw new NotFoundError('Plan not found');

      if (
        occurrence.dueAt.getTime() < Date.now() &&
        plan.latePolicy === 'DENY'
      ) {
        throw new BadRequestError('Submission is past due');
      }

      const fields = await this.fieldRepo.findByVersionId(
        submission.formVersionId,
      );
      const answers = await this.answerRepo.findBySubmissionId(submission.id);
      const answerMap = new Map(answers.map((a) => [a.fieldId, a]));

      for (const field of fields) {
        const answer = answerMap.get(field.id);
        await validateFormAnswer(field, answer?.value, true);
        if (field.isRequired) {
          if (field.type === 'IMAGE' || field.type === 'FILE') {
            if (!answer) {
              throw new ValidationError(
                `Required field "${field.label}" has no attachments`,
              );
            }
            const attachments = await this.attachmentRepo.findByAnswerId(
              answer.id,
            );
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

      const now = new Date();
      const submittedAt =
        submission.createdAt && submission.createdAt.getTime() > now.getTime()
          ? new Date(submission.createdAt.getTime() + 1000)
          : now;

      return this.submissionRepo.update(submission.id, {
        submittedBy: memberId,
        submittedAt,
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
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly planRepo?: IFormPlanRepository,
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

      await requireWritableAssignment(
        context,
        original.assignmentId,
        this.assignmentRepo,
        this.occurrenceRepo,
        this.memberRepo,
        this.planRepo,
      );
      const review = await this.reviewEntryRepo.findHeadByTarget(
        original.id,
        'final',
      );
      if (!review || review.action !== 'RETURN') {
        throw new BadRequestError('Only RETURNED submissions can be corrected');
      }

      const existingClone = await this.submissionRepo.findBySupersedesId(
        original.id,
      );
      if (existingClone) {
        throw new DuplicateError(
          'A correction for this response already exists',
        );
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

      const originalAnswers = await this.answerRepo.findBySubmissionId(
        original.id,
      );
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

      const originalContributors =
        await this.contributorRepo.findBySubmissionId(original.id);
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
    private readonly attachmentRepo: IFormAnswerAttachmentRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  async execute(
    context: IGetFormSubmissionContext,
  ): Promise<FormSubmissionDetail | null> {
    await PermissionGuard.requirePermission(
      hasFormPermission(context, 'form_review:read')
        ? 'form_review:read'
        : 'form_submission:read',
      context,
    );
    return this.unitOfWork.transaction(async () => {
      const companyId = context.companyId ?? context.activeCompanyId;
      const submission = await this.submissionRepo.findById(context.id);
      if (!submission || (companyId && submission.companyId !== companyId))
        return null;

      PermissionGuard.requireCompanyScope(context, submission.companyId);
      if (
        !hasFormPermission(context, 'form_review:read') &&
        !hasFormPermission(context, 'form_plan:manage')
      ) {
        const assignment = await this.assignmentRepo.findById(
          submission.assignmentId,
        );
        if (!assignment) throw new NotFoundError('Assignment not found');
        await requireAssignmentMember(context, assignment, this.memberRepo);
      }
      const [version, sections, fields, answers, contributors] =
        await Promise.all([
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
        attachments: await this.attachmentRepo.findByAnswerIds(
          answers.map((answer) => answer.id),
        ),
        contributors,
      };
    });
  }
}

// ==========================================
// 6. List Form Submissions
// ==========================================

export class ListFormSubmissionsUseCase implements IListFormSubmissionsUseCase {
  constructor(
    private readonly submissionRepo: IFormSubmissionRepository,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly occurrenceRepo?: IFormOccurrenceRepository,
    private readonly planRepo?: IFormPlanRepository,
    private readonly templateRepo?: IFormTemplateRepository,
    private readonly reviewEntryRepo?: IFormReviewEntryRepository,
    private readonly roleRepo?: IRoleRepository,
    private readonly userRepo?: IUserRepository,
  ) {}

  @RequirePermission('form_submission:read')
  async execute(
    context: IListFormSubmissionsContext,
  ): Promise<FormSubmissionItem[]> {
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!companyId) throw new BadRequestError('Company is required');
    PermissionGuard.requireCompanyScope(context, companyId);
    const submissions = context.assignmentId
      ? await this.submissionRepo.findByAssignmentId(
          context.assignmentId,
          companyId,
        )
      : await this.submissionRepo.findByCompanyId(companyId);

    let allowed: FormSubmission[] = [];
    if (
      hasFormPermission(context, 'form_review:read') ||
      hasFormPermission(context, 'form_plan:manage')
    ) {
      allowed = submissions;
    } else {
      const member = context.memberId
        ? await this.memberRepo.findById(context.memberId)
        : null;
      if (
        !member?.isActive ||
        member.companyId !== companyId ||
        member.userId !== context.user?.id
      )
        throw new ForbiddenError('Active company membership is required');
      for (const submission of submissions) {
        const assignment = await this.assignmentRepo.findById(
          submission.assignmentId,
        );
        if (
          assignment &&
          (assignment.companyMemberId === member.id ||
            (assignment.roleId && assignment.roleId === member.roleId))
        )
          allowed.push(submission);
      }
    }

    if (allowed.length === 0) return [];

    // Calculate lineage sequence and isLatest per assignment
    const submissionsByAssignment = new Map<string, FormSubmission[]>();
    for (const sub of allowed) {
      const list = submissionsByAssignment.get(sub.assignmentId) ?? [];
      list.push(sub);
      submissionsByAssignment.set(sub.assignmentId, list);
    }

    const sequenceMap = new Map<string, number>();
    const latestSet = new Set<string>();

    for (const [, assignSubs] of submissionsByAssignment.entries()) {
      const supersededSet = new Set(
        assignSubs
          .map((s) => s.supersedesSubmissionId)
          .filter((id): id is string => Boolean(id)),
      );
      const leaves = assignSubs.filter((s) => !supersededSet.has(s.id));
      leaves.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (leaves[0]) {
        latestSet.add(leaves[0].id);
      }

      const root = assignSubs.find((s) => !s.supersedesSubmissionId);
      if (root) {
        sequenceMap.set(root.id, 1);
        let curr = root;
        let seq = 1;
        while (curr) {
          const next = assignSubs.find(
            (s) => s.supersedesSubmissionId === curr.id,
          );
          if (next) {
            seq++;
            sequenceMap.set(next.id, seq);
            curr = next;
          } else {
            break;
          }
        }
      }
      let fallbackSeq = 1;
      const sortedByCreated = [...assignSubs].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      for (const sub of sortedByCreated) {
        if (!sequenceMap.has(sub.id)) {
          sequenceMap.set(sub.id, fallbackSeq);
        }
        fallbackSeq++;
      }
    }

    // Batch fetch assignments
    const assignmentIds = [...new Set(allowed.map((s) => s.assignmentId))];
    const assignments = await Promise.all(
      assignmentIds.map((id) => this.assignmentRepo.findById(id)),
    );
    const assignmentMap = new Map(
      assignments
        .filter((a): a is NonNullable<typeof a> => a != null)
        .map((a) => [a.id, a]),
    );

    // Batch fetch occurrences
    const occurrenceIds = [
      ...new Set(Array.from(assignmentMap.values()).map((a) => a.occurrenceId)),
    ];
    const occurrences = this.occurrenceRepo
      ? await Promise.all(
          occurrenceIds.map((id) => this.occurrenceRepo!.findById(id)),
        )
      : [];
    const occurrenceMap = new Map(
      occurrences
        .filter((o): o is NonNullable<typeof o> => o != null)
        .map((o) => [o.id, o]),
    );

    // Batch fetch plans
    const planIds = [
      ...new Set(Array.from(occurrenceMap.values()).map((o) => o.planId)),
    ];
    const plans = this.planRepo
      ? await Promise.all(planIds.map((id) => this.planRepo!.findById(id)))
      : [];
    const planMap = new Map(
      plans
        .filter((p): p is NonNullable<typeof p> => p != null)
        .map((p) => [p.id, p]),
    );

    // Batch fetch templates
    const templateIds = [
      ...new Set(
        Array.from(occurrenceMap.values()).map((o) => o.formTemplateId),
      ),
    ];
    const templates = this.templateRepo
      ? await Promise.all(
          templateIds.map((id) => this.templateRepo!.findById(id)),
        )
      : [];
    const templateMap = new Map(
      templates
        .filter((t): t is NonNullable<typeof t> => t != null)
        .map((t) => [t.id, t]),
    );

    // Batch fetch final reviews
    const finalReviews = this.reviewEntryRepo
      ? await this.reviewEntryRepo.findHeadFinalBySubmissionIds(
          allowed.map((s) => s.id),
        )
      : [];
    const finalReviewMap = new Map<string, FormReviewEntry>(
      finalReviews.map((r) => [r.submissionId, r]),
    );

    // Collect all member IDs to resolve user names
    const memberIds = new Set<string>();
    for (const sub of allowed) {
      if (sub.startedBy) memberIds.add(sub.startedBy);
      if (sub.submittedBy) memberIds.add(sub.submittedBy);
    }
    for (const r of finalReviews) {
      if (r.reviewedBy) memberIds.add(r.reviewedBy);
    }
    for (const a of assignmentMap.values()) {
      if (a.companyMemberId) memberIds.add(a.companyMemberId);
    }

    const members = await Promise.all(
      Array.from(memberIds).map((id) => this.memberRepo.findById(id)),
    );
    const memberMap = new Map(
      members
        .filter((m): m is NonNullable<typeof m> => m != null)
        .map((m) => [m.id, m]),
    );

    // Batch fetch users
    const userIds = [
      ...new Set(Array.from(memberMap.values()).map((m) => m.userId)),
    ];
    const users = this.userRepo
      ? await Promise.all(userIds.map((id) => this.userRepo!.findById(id)))
      : [];
    const userMap = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => u != null)
        .map((u) => [u.id, u]),
    );

    // Batch fetch roles
    const roleIds = [
      ...new Set(
        Array.from(assignmentMap.values())
          .map((a) => a.roleId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const roles = this.roleRepo
      ? await Promise.all(roleIds.map((id) => this.roleRepo!.findById(id)))
      : [];
    const roleMap = new Map(
      roles
        .filter((r): r is NonNullable<typeof r> => r != null)
        .map((r) => [r.id, r]),
    );

    const resolveMemberUserName = (mId: string | null | undefined) => {
      if (!mId) return null;
      const mem = memberMap.get(mId);
      if (!mem) return null;
      const user = userMap.get(mem.userId);
      return user?.name ?? user?.email ?? null;
    };

    return allowed.map((sub) => {
      const assignment = assignmentMap.get(sub.assignmentId);
      const occurrence = assignment
        ? occurrenceMap.get(assignment.occurrenceId)
        : null;
      const plan = occurrence ? planMap.get(occurrence.planId) : null;
      const template = occurrence
        ? templateMap.get(occurrence.formTemplateId)
        : null;
      const role = assignment?.roleId ? roleMap.get(assignment.roleId) : null;
      const assignMember = assignment?.companyMemberId
        ? memberMap.get(assignment.companyMemberId)
        : null;
      const assignUser = assignMember ? userMap.get(assignMember.userId) : null;

      const finalReview = finalReviewMap.get(sub.id);

      const isPersonal = Boolean(assignment?.companyMemberId);
      const recipientLabel = isPersonal
        ? `งานส่วนตัว (${assignUser?.name ?? 'สมาชิก'})`
        : role?.name
          ? `ทีม ${role.name}`
          : 'งานกลุ่ม';

      return {
        ...sub,
        planId: plan?.id,
        planName: plan?.name ?? template?.name ?? 'แบบฟอร์มตรวจสอบ',
        formTemplateId: template?.id ?? occurrence?.formTemplateId,
        templateName: template?.name,
        occurrenceOpensAt: occurrence?.opensAt ?? null,
        occurrenceDueAt: occurrence?.dueAt ?? null,
        occurrenceKey: occurrence?.occurrenceKey ?? null,
        recipientLabel,
        startedByName: resolveMemberUserName(sub.startedBy),
        submittedByName: resolveMemberUserName(sub.submittedBy),
        finalReviewAction: finalReview?.action ?? null,
        finalReviewNote: finalReview?.note ?? null,
        finalReviewAt: finalReview?.createdAt ?? null,
        reviewerName: resolveMemberUserName(finalReview?.reviewedBy),
        submissionSequence: sequenceMap.get(sub.id) ?? 1,
        isLatest: latestSet.has(sub.id),
      } as FormSubmissionItem;
    });
  }
}
