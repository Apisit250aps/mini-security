import db from '../db';

import { eq, and } from 'drizzle-orm';
import { userPermissionsView } from '../views';

async function getUserPermissionActions(userId: string, companyId: string) {
  const result = await db
    .selectDistinct({
      action: userPermissionsView.action,
    })
    .from(userPermissionsView)
    .where(
      and(
        eq(userPermissionsView.userId, userId),
        eq(userPermissionsView.companyId, companyId),
        eq(userPermissionsView.isMemberActive, true),
      ),
    );

  return result.map((r) => r.action);
}

getUserPermissionActions(
  '01a06684-5bfc-70ac-aba9-43f6cbc046ac',
  '01a06691-7349-7191-af4b-dba806e92aed',
)
  .then(console.log)
  .catch(console.error);
