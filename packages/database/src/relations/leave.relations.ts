import type { RelationsHelper } from './types';

export const leaveRelations = (r: RelationsHelper) => ({
  company: {
    leaveTypes: r.many.leaveTypes(),
  },
  companyMember: {
    leaveQuotas: r.many.leaveQuotas(),
    leaveRequests: r.many.leaveRequests(),
  },
  user: {
    reviewedLeaveRequests: r.many.leaveRequests(),
  },
  leaveTypes: {
    company: r.one.company({
      from: r.leaveTypes.companyId,
      to: r.company.id,
    }),
    quotas: r.many.leaveQuotas(),
    requests: r.many.leaveRequests(),
  },
  leaveQuotas: {
    member: r.one.companyMember({
      from: r.leaveQuotas.companyMemberId,
      to: r.companyMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveQuotas.leaveTypeId,
      to: r.leaveTypes.id,
    }),
  },
  leaveRequests: {
    member: r.one.companyMember({
      from: r.leaveRequests.companyMemberId,
      to: r.companyMember.id,
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
