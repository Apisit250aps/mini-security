import { cache } from 'react';
import { headers } from 'next/headers';
import auth from '@repo/infrastructures/auth';

/**
 * Deduplicated per-request session fetcher for Server Components.
 * Prevents multiple database lookups when multiple layouts/pages check the session during the same request.
 */
export const getCachedSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});
