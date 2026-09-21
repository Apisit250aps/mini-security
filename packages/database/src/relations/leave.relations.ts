import type { RelationsHelper } from './types';

export const leaveRelations = (r: RelationsHelper) => ({
  organization: {
    leaveTypes: r.many.leaveTypes(),
  },
  organizationMember: {
    leaveQuotas: r.many.leaveQuotas(),
    leaveRequests: r.many.leaveRequests(),
  },
  user: {
    reviewedLeaveRequests: r.many.leaveRequests(),
  },
  leaveTypes: {
    organization: r.one.organization({
      from: r.leaveTypes.organizationId,
      to: r.organization.id,
    }),
    quotas: r.many.leaveQuotas(),
    requests: r.many.leaveRequests(),
  },
  leaveQuotas: {
    member: r.one.organizationMember({
      from: r.leaveQuotas.organizationMemberId,
      to: r.organizationMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveQuotas.leaveTypeId,
      to: r.leaveTypes.id,
    }),
  },
  leaveRequests: {
    member: r.one.organizationMember({
      from: r.leaveRequests.organizationMemberId,
      to: r.organizationMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveRequests.leaveTypeId,
      to: r.leaveTypes.id,
    }),
    reviewedByUser: r.one.user({
      from: r.leaveRequests.reviewedBy,
      to: r.user.id,
    }),
  },
});
