import type { Context } from 'hono';
import type { ISecurityContext } from '@repo/domains/constants';
import type { Session } from '@repo/infrastructures/types/auth';
import { created, response, success, validator } from '../lib/response';

export abstract class Controller {
  protected securityContext(c: Context): ISecurityContext {
    const user: Session['user'] | undefined = c.get('user');
    const session = c.get('session') as
      | (Session['session'] & { memberId?: string | null })
      | undefined;
    return {
      user,
      userId: user?.id,
      organizationId: session?.activeOrganizationId ?? undefined,
      permissions: session?.permissions,
      activeOrganizationId: session?.activeOrganizationId,
      memberId: session?.memberId ?? null,
    };
  }

  protected readonly validator = validator;
  protected readonly response = response;
  protected readonly created = created;
  protected readonly success = success;
}

export default Controller;
