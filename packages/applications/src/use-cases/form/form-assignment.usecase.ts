import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  FormAssignment,
  FormOccurrence,
  FormPlan,
  FormSubmission,
  FormReviewEntry,
} from '@repo/domains/entities/form';
import type {
  IListMyAssignmentsContext,
  IListMyAssignmentsUseCase,
  MyAssignmentItem,
  IGetAssignmentContext,
  IGetAssignmentUseCase,
  ICancelAssignmentContext,
  ICancelAssignmentUseCase,
  IReplaceAssignmentContext,
  IReplaceAssignmentUseCase,
  FormTaskWorkflowStatus,
  FormTaskAvailableActions,
  OccurrenceAssignmentItem,
  IListOccurrenceAssignmentsContext,
  IListOccurrenceAssignmentsUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormTemplateRepository,
  IFormPlanRepository,
  IFormSubmissionRepository,
  IFormReviewEntryRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type { IUserRepository } from '@repo/domains/repositories/user';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import {
  NotFoundError,
  DuplicateError,
  BadRequestError,
} from '../../lib/error';
import { requireRevisionMatch } from '#lib/index';

function resolveAssignmentWorkflowAndActions(params: {
  assignment: FormAssignment;
  occurrence: FormOccurrence;
  plan: FormPlan | null;
  submissions: FormSubmission[];
  finalReviewMap: Map<string, FormReviewEntry>;
  now: Date;
  isAssignedToCurrentActor: boolean;
}): {
  latestSubmission: FormSubmission | null;
  workflowStatus: FormTaskWorkflowStatus;
  isOverdue: boolean;
  availableActions: FormTaskAvailableActions;
} {
  const {
    assignment,
    occurrence,
    plan,
    submissions,
    finalReviewMap,
    now,
    isAssignedToCurrentActor,
  } = params;

  const isCancelled = Boolean(assignment.cancelledAt || occurrence.cancelledAt);

  // Find latest submission in lineage: the one not superseded by any other submission
  let latestSubmission: FormSubmission | null = null;
  if (submissions.length > 0) {
    const supersededSet = new Set(
      submissions
        .map((s) => s.supersedesSubmissionId)
        .filter((id): id is string => Boolean(id)),
    );
    const unSuperceded = submissions.filter((s) => !supersededSet.has(s.id));
    // Sort by createdAt desc if multiple
    unSuperceded.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    latestSubmission = unSuperceded[0] ?? null;
  }

  let workflowStatus: FormTaskWorkflowStatus = 'NOT_STARTED';

  if (isCancelled) {
    workflowStatus = 'CANCELLED';
  } else if (!latestSubmission) {
    workflowStatus = 'NOT_STARTED';
  } else if (latestSubmission.submittedAt == null) {
    workflowStatus = latestSubmission.supersedesSubmissionId
      ? 'CORRECTION_DRAFT'
      : 'DRAFT';
  } else {
    // Latest submission is submitted
    const finalReview = finalReviewMap.get(latestSubmission.id);
    if (finalReview) {
      if (finalReview.action === 'APPROVE') {
        workflowStatus = 'APPROVED';
      } else if (finalReview.action === 'RETURN') {
        // Check if there's already a successor submission
        const successor = submissions.find(
          (s) => s.supersedesSubmissionId === latestSubmission!.id,
        );
        if (successor) {
          workflowStatus = successor.submittedAt
            ? 'IN_REVIEW'
            : 'CORRECTION_DRAFT';
        } else {
          workflowStatus = 'RETURNED';
        }
      } else {
        workflowStatus = 'IN_REVIEW';
      }
    } else {
      workflowStatus = 'IN_REVIEW';
    }
  }

  const isOverdue =
    !isCancelled &&
    occurrence.dueAt.getTime() < now.getTime() &&
    !['APPROVED', 'COMPLETED', 'CANCELLED'].includes(workflowStatus);

  const latePolicy = plan?.latePolicy ?? 'DENY';

  let canStart = false;
  let canContinue = false;
  let canCreateCorrection = false;
  let canView = Boolean(latestSubmission);
  let disabledReason: string | null = null;

  if (!isAssignedToCurrentActor) {
    disabledReason = 'คุณไม่ได้เป็นผู้รับมอบหมายงานนี้';
  } else if (workflowStatus === 'CANCELLED') {
    disabledReason = 'งานหรือรอบตรวจถูกยกเลิกแล้ว';
  } else if (occurrence.opensAt.getTime() > now.getTime()) {
    canView = false;
    disabledReason = 'รอบตรวจยังไม่ถึงเวลาเปิด';
  } else if (isOverdue && latePolicy === 'DENY') {
    disabledReason = 'หมดเวลากรอกตามนโยบายของแผนการตรวจ';
  } else {
    if (workflowStatus === 'NOT_STARTED') {
      canStart = true;
    } else if (
      workflowStatus === 'DRAFT' ||
      workflowStatus === 'CORRECTION_DRAFT'
    ) {
      canContinue = true;
    } else if (workflowStatus === 'RETURNED') {
      canCreateCorrection = true;
    }
  }

  return {
    latestSubmission,
    workflowStatus,
    isOverdue,
    availableActions: {
      canStart,
      canContinue,
      canCreateCorrection,
      canView,
      disabledReason,
    },
  };
}

export class ListMyAssignmentsUseCase implements IListMyAssignmentsUseCase {
  constructor(
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly occurrenceRepo?: IFormOccurrenceRepository,
    private readonly templateRepo?: IFormTemplateRepository,
    private readonly roleRepo?: IRoleRepository,
    private readonly planRepo?: IFormPlanRepository,
    private readonly submissionRepo?: IFormSubmissionRepository,
    private readonly reviewEntryRepo?: IFormReviewEntryRepository,
  ) {}

  @RequirePermission('form_submission:read')
  async execute(
    context: IListMyAssignmentsContext,
  ): Promise<MyAssignmentItem[]> {
    const member = await this.memberRepo.findById(context.memberId);
    if (
      !member ||
      !member.isActive ||
      member.userId !== context.user?.id ||
      member.companyId !== context.companyId
    ) {
      throw new NotFoundError('Company member not found');
    }

    const [byMember, byRole] = await Promise.all([
      this.assignmentRepo.findByMemberId(context.companyId, context.memberId),
      this.assignmentRepo.findByRoleId(context.companyId, member.roleId),
    ]);

    const merged = new Map<string, FormAssignment>();
    for (const a of byMember) {
      if (a.cancelledAt == null) merged.set(a.id, a);
    }
    for (const a of byRole) {
      if (a.cancelledAt == null) merged.set(a.id, a);
    }

    const assignments = Array.from(merged.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    if (!this.occurrenceRepo || !this.templateRepo) {
      return assignments as MyAssignmentItem[];
    }

    const occurrenceIds = [...new Set(assignments.map((a) => a.occurrenceId))];
    const occurrences = await Promise.all(
      occurrenceIds.map((id) => this.occurrenceRepo!.findById(id)),
    );
    const occurrenceMap = new Map(
      occurrences
        .filter((o): o is NonNullable<typeof o> => o != null)
        .map((o) => [o.id, o]),
    );

    // Filter assignments whose occurrence is valid and open
    const now = new Date();
    const activeAssignments = assignments.filter((a) => {
      const occurrence = occurrenceMap.get(a.occurrenceId);
      return occurrence && !occurrence.cancelledAt && occurrence.opensAt <= now;
    });

    const activeOccurrenceList = activeAssignments
      .map((a) => occurrenceMap.get(a.occurrenceId))
      .filter((o): o is NonNullable<typeof o> => o != null);

    const planIds = [...new Set(activeOccurrenceList.map((o) => o.planId))];
    const plans = this.planRepo
      ? await Promise.all(planIds.map((id) => this.planRepo!.findById(id)))
      : [];
    const planMap = new Map(
      plans
        .filter((p): p is NonNullable<typeof p> => p != null)
        .map((p) => [p.id, p]),
    );

    const templateIds = [
      ...new Set(activeOccurrenceList.map((o) => o.formTemplateId)),
    ];
    const templates = await Promise.all(
      templateIds.map((id) => this.templateRepo!.findById(id)),
    );
    const templateMap = new Map(
      templates
        .filter((t): t is NonNullable<typeof t> => t != null)
        .map((t) => [t.id, t]),
    );

    const roleIds = [
      ...new Set(
        activeAssignments
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

    // Fetch submissions for all active assignments
    const assignmentIds = activeAssignments.map((a) => a.id);
    const submissions =
      this.submissionRepo && assignmentIds.length > 0
        ? await this.submissionRepo.findByAssignmentIds(
            assignmentIds,
            context.companyId,
          )
        : [];

    const submissionsByAssignment = new Map<string, FormSubmission[]>();
    for (const sub of submissions) {
      const list = submissionsByAssignment.get(sub.assignmentId) ?? [];
      list.push(sub);
      submissionsByAssignment.set(sub.assignmentId, list);
    }

    // Fetch final reviews for submissions
    const submissionIds = submissions.map((s) => s.id);
    const finalReviews =
      this.reviewEntryRepo && submissionIds.length > 0
        ? await this.reviewEntryRepo.findHeadFinalBySubmissionIds(submissionIds)
        : [];
    const finalReviewMap = new Map<string, FormReviewEntry>(
      finalReviews.map((r) => [r.submissionId, r]),
    );

    return activeAssignments.map((a) => {
      const occurrence = occurrenceMap.get(a.occurrenceId)!;
      const plan = planMap.get(occurrence.planId) ?? null;
      const template = templateMap.get(occurrence.formTemplateId) ?? null;
      const role = a.roleId ? roleMap.get(a.roleId) : null;
      const assignSubs = submissionsByAssignment.get(a.id) ?? [];

      const { latestSubmission, workflowStatus, isOverdue, availableActions } =
        resolveAssignmentWorkflowAndActions({
          assignment: a,
          occurrence,
          plan,
          submissions: assignSubs,
          finalReviewMap,
          now,
          isAssignedToCurrentActor: true,
        });

      const isPersonal = Boolean(a.companyMemberId);
      const recipientLabel = isPersonal
        ? 'งานส่วนตัว'
        : role?.name
          ? `ทีม ${role.name}`
          : 'งานกลุ่ม';

      return {
        ...a,
        planId: plan?.id ?? occurrence.planId,
        planName: plan?.name ?? template?.name ?? 'แบบฟอร์มตรวจสอบ',
        formTemplateId: template?.id ?? occurrence.formTemplateId,
        templateName: template?.name,
        templateDescription: template?.description,
        opensAt: occurrence.opensAt,
        dueAt: occurrence.dueAt,
        timezone: plan?.timezone ?? 'Asia/Bangkok',
        latePolicy: plan?.latePolicy ?? 'DENY',
        assignmentType: isPersonal ? 'PERSONAL' : 'ROLE',
        recipientLabel,
        roleName: role?.name ?? null,
        memberName: context.user?.name ?? null,
        latestSubmissionId: latestSubmission?.id ?? null,
        latestSubmissionRevision: latestSubmission?.revision ?? null,
        workflowStatus,
        isOverdue,
        availableActions,
      } as MyAssignmentItem;
    });
  }
}

export class GetAssignmentUseCase implements IGetAssignmentUseCase {
  constructor(
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_submission:read')
  async execute(context: IGetAssignmentContext): Promise<FormAssignment> {
    const assignment = await this.assignmentRepo.findById(context.assignmentId);
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!assignment || (companyId && assignment.companyId !== companyId)) {
      throw new NotFoundError('Assignment not found');
    }

    if (context.memberId) {
      const member = await this.memberRepo.findById(context.memberId);
      if (!member) {
        throw new NotFoundError('Company member not found');
      }

      if (
        assignment.companyMemberId !== context.memberId &&
        assignment.roleId !== member.roleId
      ) {
        throw new NotFoundError('Assignment not found');
      }
    }

    return assignment;
  }
}

export class CancelAssignmentUseCase implements ICancelAssignmentUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: ICancelAssignmentContext): Promise<FormAssignment> {
    return this.unitOfWork.transaction(async () => {
      const assignment = await this.assignmentRepo.findById(
        context.assignmentId,
      );
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!assignment || (companyId && assignment.companyId !== companyId)) {
        throw new NotFoundError('Assignment not found');
      }
      if (assignment.cancelledAt != null) {
        throw new BadRequestError('Assignment already cancelled');
      }

      const occurrence = await this.occurrenceRepo.findById(
        assignment.occurrenceId,
      );
      if (!occurrence || occurrence.cancelledAt != null) {
        throw new BadRequestError(
          'Cannot cancel assignment for a cancelled occurrence',
        );
      }

      requireRevisionMatch(
        assignment.revision,
        context.expectedRevision,
        () => new DuplicateError('Optimistic lock conflict'),
        { optional: true },
      );

      return this.assignmentRepo.cancel(assignment.id, {
        cancelledAt: new Date(),
        cancelledBy: context.memberId ?? context.userId,
        cancelReason: context.cancelReason,
      });
    });
  }
}

export class ReplaceAssignmentUseCase implements IReplaceAssignmentUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly assignmentRepo: IFormAssignmentRepository,
  ) {}

  @RequirePermission('form_plan:manage')
  async execute(context: IReplaceAssignmentContext): Promise<FormAssignment> {
    return this.unitOfWork.transaction(async () => {
      const oldAssignment = await this.assignmentRepo.findById(
        context.assignmentId,
      );
      if (!oldAssignment || oldAssignment.companyId !== context.companyId) {
        throw new NotFoundError('Assignment not found');
      }
      if (oldAssignment.cancelledAt != null) {
        throw new BadRequestError('Assignment already cancelled');
      }

      await this.assignmentRepo.cancel(oldAssignment.id, {
        cancelledAt: new Date(),
        cancelledBy: context.memberId ?? context.userId,
        cancelReason: context.cancelReason,
      });

      return this.assignmentRepo.create({
        companyId: oldAssignment.companyId,
        occurrenceId: oldAssignment.occurrenceId,
        formVersionId: oldAssignment.formVersionId,
        roleId: context.newRoleId ?? null,
        companyMemberId: context.newCompanyMemberId ?? null,
        replacesAssignmentId: oldAssignment.id,
        assignedBy: context.memberId ?? context.userId,
        revision: 1,
      });
    });
  }
}

export class ListOccurrenceAssignmentsUseCase
  implements IListOccurrenceAssignmentsUseCase
{
  constructor(
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly occurrenceRepo: IFormOccurrenceRepository,
    private readonly planRepo: IFormPlanRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly roleRepo?: IRoleRepository,
    private readonly submissionRepo?: IFormSubmissionRepository,
    private readonly reviewEntryRepo?: IFormReviewEntryRepository,
    private readonly userRepo?: IUserRepository,
  ) {}

  @RequirePermission('form_plan:read')
  async execute(
    context: IListOccurrenceAssignmentsContext,
  ): Promise<OccurrenceAssignmentItem[]> {
    const occurrence = await this.occurrenceRepo.findById(context.occurrenceId);
    const companyId = context.companyId ?? context.activeCompanyId;
    if (!occurrence || (companyId && occurrence.companyId !== companyId)) {
      throw new NotFoundError('Occurrence not found');
    }

    const plan = await this.planRepo.findById(occurrence.planId);
    const assignments = await this.assignmentRepo.findByOccurrenceId(
      occurrence.id,
    );

    const now = new Date();
    const currentMember = context.memberId
      ? await this.memberRepo.findById(context.memberId)
      : null;

    // Batch fetch roles
    const roleIds = [
      ...new Set(
        assignments
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

    // Batch fetch members
    const memberIds = [
      ...new Set(
        assignments
          .map((a) => a.companyMemberId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const members = await Promise.all(
      memberIds.map((id) => this.memberRepo.findById(id)),
    );
    const memberMap = new Map(
      members
        .filter((m): m is NonNullable<typeof m> => m != null)
        .map((m) => [m.id, m]),
    );

    // Batch fetch users
    const userIds = [
      ...new Set(
        members
          .filter((m): m is NonNullable<typeof m> => m != null)
          .map((m) => m.userId),
      ),
    ];
    const users = this.userRepo
      ? await Promise.all(userIds.map((id) => this.userRepo!.findById(id)))
      : [];
    const userMap = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => u != null)
        .map((u) => [u.id, u]),
    );

    // Batch fetch submissions for assignments
    const assignmentIds = assignments.map((a) => a.id);
    const submissions =
      this.submissionRepo && assignmentIds.length > 0
        ? await this.submissionRepo.findByAssignmentIds(
            assignmentIds,
            occurrence.companyId,
          )
        : [];

    const submissionsByAssignment = new Map<string, FormSubmission[]>();
    for (const sub of submissions) {
      const list = submissionsByAssignment.get(sub.assignmentId) ?? [];
      list.push(sub);
      submissionsByAssignment.set(sub.assignmentId, list);
    }

    // Batch fetch final reviews
    const submissionIds = submissions.map((s) => s.id);
    const finalReviews =
      this.reviewEntryRepo && submissionIds.length > 0
        ? await this.reviewEntryRepo.findHeadFinalBySubmissionIds(submissionIds)
        : [];
    const finalReviewMap = new Map<string, FormReviewEntry>(
      finalReviews.map((r) => [r.submissionId, r]),
    );

    return assignments.map((a) => {
      const role = a.roleId ? roleMap.get(a.roleId) : null;
      const mem = a.companyMemberId ? memberMap.get(a.companyMemberId) : null;
      const u = mem ? userMap.get(mem.userId) : null;
      const memberName = u?.name ?? null;
      const assignSubs = submissionsByAssignment.get(a.id) ?? [];

      const isPersonal = Boolean(a.companyMemberId);
      const isAssignedToActor = Boolean(
        currentMember &&
          ((isPersonal && a.companyMemberId === currentMember.id) ||
            (!isPersonal && a.roleId && a.roleId === currentMember.roleId)),
      );

      const { latestSubmission, workflowStatus, isOverdue, availableActions } =
        resolveAssignmentWorkflowAndActions({
          assignment: a,
          occurrence,
          plan,
          submissions: assignSubs,
          finalReviewMap,
          now,
          isAssignedToCurrentActor: isAssignedToActor,
        });

      const recipientLabel = isPersonal
        ? `งานส่วนตัว (${memberName ?? 'สมาชิก'})`
        : role?.name
          ? `ทีม ${role.name}`
          : 'งานกลุ่ม';

      return {
        id: a.id,
        assignmentId: a.id,
        occurrenceId: a.occurrenceId,
        companyId: a.companyId,
        formVersionId: a.formVersionId,
        roleId: a.roleId ?? null,
        companyMemberId: a.companyMemberId ?? null,
        roleName: role?.name ?? null,
        memberName,
        assignmentType: isPersonal ? 'PERSONAL' : 'ROLE',
        recipientLabel,
        workflowStatus,
        latestSubmissionId: latestSubmission?.id ?? null,
        latestSubmissionRevision: latestSubmission?.revision ?? null,
        isOverdue,
        canStart: availableActions.canStart,
        canContinue: availableActions.canContinue,
        canCreateCorrection: availableActions.canCreateCorrection,
        canView: availableActions.canView,
        createdAt: a.createdAt,
      };
    });
  }
}
