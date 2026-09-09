import type { RelationsHelper } from './types';

export const authRelations = (r: RelationsHelper) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    memberships: r.many.companyMember(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
});
