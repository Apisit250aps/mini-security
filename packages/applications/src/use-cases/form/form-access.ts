import type { ISecurityContext } from '@repo/domains/constants';
import type { FormAssignment } from '@repo/domains/entities/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  IFormAssignmentRepository,
  IFormOccurrenceRepository,
} from '@repo/domains/repositories/form';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../lib/error';
import { PermissionGuard } from '../../lib/guard';

export function hasFormPermission(
  context: ISecurityContext,
  action: string,
): boolean {
  const permissions = new Set(
    (context.permissions ?? '').split(',').map((p) => p.trim()),
  );
  return (
    context.user?.isAdmin === true ||
    permissions.has('*') ||
    permissions.has(action) ||
    permissions.has(`${action.split(':')[0]}:*`)
  );
}

/** Contributor history is audit data; access always uses current active membership. */
export async function requireAssignmentMember(
  context: ISecurityContext,
  assignment: FormAssignment,
  memberRepo: ICompanyMemberRepository,
): Promise<string> {
  PermissionGuard.requireCompanyScope(context, assignment.companyId);
  if (!context.memberId)
    throw new ForbiddenError('Active company membership is required');
  const member = await memberRepo.findById(context.memberId);
  if (
    !member ||
    !member.isActive ||
    member.companyId !== assignment.companyId ||
    member.userId !== context.user?.id
  ) {
    throw new ForbiddenError('Active company membership is required');
  }
  if (
    assignment.companyMemberId !== member.id &&
    !(assignment.roleId && assignment.roleId === member.roleId)
  ) {
    throw new ForbiddenError('You are not assigned to this form');
  }
  return member.id;
}

export async function requireWritableAssignment(
  context: ISecurityContext,
  assignmentId: string,
  assignmentRepo: IFormAssignmentRepository,
  occurrenceRepo: IFormOccurrenceRepository,
  memberRepo: ICompanyMemberRepository,
) {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) throw new NotFoundError('Assignment not found');
  const memberId = await requireAssignmentMember(
    context,
    assignment,
    memberRepo,
  );
  const occurrence = await occurrenceRepo.findById(assignment.occurrenceId);
  if (!occurrence || occurrence.companyId !== assignment.companyId)
    throw new NotFoundError('Occurrence not found');
  if (assignment.cancelledAt != null || occurrence.cancelledAt != null)
    throw new BadRequestError('Assignment or occurrence is cancelled');
  if (occurrence.opensAt.getTime() > Date.now())
    throw new BadRequestError('Occurrence is not open yet');
  return { assignment, occurrence, memberId };
}
