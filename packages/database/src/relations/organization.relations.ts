import type { RelationsHelper } from './types';

export const organizationRelations = (r: RelationsHelper) => ({
  organization: {
    members: r.many.organizationMember(),
  },
  site: {
    organization: r.one.organization({
      from: r.site.organizationId,
      to: r.organization.id,
    }),
    members: r.many.organizationMember(),
  },
  organizationMember: {
    organization: r.one.organization({
      from: r.organizationMember.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.organizationMember.userId,
      to: r.user.id,
    }),
    role: r.one.role({
      from: r.organizationMember.roleId,
      to: r.role.id,
    }),
    site: r.one.site({
      from: r.organizationMember.siteId,
      to: r.site.id,
    }),
  },
});
