import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormAssignment } from '@repo/domains/entities/form';
import type {
  IListMyAssignmentsContext,
  IListMyAssignmentsUseCase,
  IGetAssignmentContext,
  IGetAssignmentUseCase,
  ICancelAssignmentContext,
  ICancelAssignmentUseCase,
  IReplaceAssignmentContext,
  IReplaceAssignmentUseCase,
} from '@repo/domains/applications/form';
import type { IFormAssignmentRepository, IFormOccurrenceRepository } from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import { NotFoundError, DuplicateError, BadRequestError } from '../../lib/error';

export class ListMyAssignmentsUseCase implements IListMyAssignmentsUseCase {
  constructor(
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_submission:read')
  async execute(context: IListMyAssignmentsContext): Promise<FormAssignment[]> {
    const member = await this.memberRepo.findById(context.memberId);
    if (!member || member.companyId !== context.companyId) {
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

    return Array.from(merged.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
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
      const assignment = await this.assignmentRepo.findById(context.assignmentId);
      const companyId = context.companyId ?? context.activeCompanyId;
      if (!assignment || (companyId && assignment.companyId !== companyId)) {
        throw new NotFoundError('Assignment not found');
      }
      if (assignment.cancelledAt != null) {
        throw new BadRequestError('Assignment already cancelled');
      }

      const occurrence = await this.occurrenceRepo.findById(assignment.occurrenceId);
      if (!occurrence || occurrence.cancelledAt != null) {
        throw new BadRequestError('Cannot cancel assignment for a cancelled occurrence');
      }

      if (
        context.expectedRevision !== undefined &&
        assignment.revision !== context.expectedRevision
      ) {
        throw new DuplicateError('Optimistic lock conflict');
      }

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
      const oldAssignment = await this.assignmentRepo.findById(context.assignmentId);
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
