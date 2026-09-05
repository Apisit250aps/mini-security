import 'server-only';
import { permissionServicesGetMyPermissions } from '@repo/client';
import config from '@repo/configs';
import type { Permission } from '@repo/domains/entities';
import { headers } from 'next/headers';
import type { Session } from '../hooks/session-provider';

async function getPermissions(session: Session): Promise<Permission[]> {
  if (!session || session.user.isAdmin) return [];

  const requestHeaders = await headers();
  const { data } = await permissionServicesGetMyPermissions({
    baseURL: `${config.backend.url.replace(/\/$/, '')}/api`,
    headers: { cookie: requestHeaders.get('cookie') ?? '' },
    throwOnError: true,
  });

  return (data.data ?? []).map((permission) => ({
    ...permission,
    createdAt: new Date(permission.createdAt),
    updatedAt: new Date(permission.updatedAt),
  }));
}

export { getPermissions };
