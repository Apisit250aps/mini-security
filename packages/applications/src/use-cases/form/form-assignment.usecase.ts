import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type { FormAssignment } from '@repo/domains/entities/form';
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
} from '@repo/domains/applications/form';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
  IFormTemplateRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import {
  NotFoundError,
  DuplicateError,
  BadRequestError,
} from '../../lib/error';

export class ListMyAssignmentsUseCase implements IListMyAssignmentsUseCase {
  constructor(
    private readonly assignmentRepo: IFormAssignmentRepository,
    private readonly memberRepo: ICompanyMemberRepository,
    private readonly occurrenceRepo?: IFormOccurrenceRepository,
    private readonly templateRepo?: IFormTemplateRepository,
    private readonly roleRepo?: IRoleRepository,
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

    const templateIds = [
      ...new Set(
        Array.from(occurrenceMap.values()).map((o) => o.formTemplateId),
      ),
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

    return assignments
      .filter((a) => {
        const occurrence = occurrenceMap.get(a.occurrenceId);
        return (
          occurrence &&
          !occurrence.cancelledAt &&
          occurrence.opensAt <= new Date()
        );
      })
      .map((a) => {
        const occurrence = occurrenceMap.get(a.occurrenceId);
        const template = occurrence
          ? templateMap.get(occurrence.formTemplateId)
          : null;
        const role = a.roleId ? roleMap.get(a.roleId) : null;

        return {
          ...a,
          templateName: template?.name,
          templateDescription: template?.description,
          opensAt: occurrence?.opensAt,
          dueAt: occurrence?.dueAt,
          roleName: role?.name,
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
