import type { RelationsHelper } from './types';

export const companyRelations = (r: RelationsHelper) => ({
  company: {
    members: r.many.companyMember(),
  },
  companyBranch: {
    company: r.one.company({
      from: r.companyBranch.companyId,
      to: r.company.id,
    }),
    members: r.many.companyMember(),
  },
  companyMember: {
    company: r.one.company({
      from: r.companyMember.companyId,
      to: r.company.id,
    }),
    user: r.one.user({
      from: r.companyMember.userId,
      to: r.user.id,
    }),
    role: r.one.role({
      from: r.companyMember.roleId,
      to: r.role.id,
    }),
    branch: r.one.companyBranch({
      from: r.companyMember.companyBranchId,
      to: r.companyBranch.id,
    }),
  },
});
