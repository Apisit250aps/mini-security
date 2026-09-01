import {
  pageConfigs as PAGE_CONFIGS,
  type PageConfigId,
} from '@/configs/contains/page-configs';

/**
 * Joins a base URL path with an array of path parameter segments.
 *
 * @param basePath - The base path (e.g. '/inventory', '/problems')
 * @param params - Optional array of parameter segments (e.g. ['01', 'ASSET-123'])
 * @returns Clean path string (e.g. '/inventory/01/ASSET-123')
 */
export const joinUrlParams = (
  basePath: string,
  params?: (string | number | undefined | null)[],
): string => {
  const base = basePath === '/' ? '' : basePath.replace(/\/+$/, '');

  if (!params || params.length === 0) {
    return basePath;
  }

  const validSegments = params
    .filter(
      (p): p is string | number => p !== undefined && p !== null && p !== '',
    )
    .map((p) => String(p).replace(/^\/+|\/+$/g, ''));

  if (validSegments.length === 0) {
    return basePath;
  }

  return `${base}/${validSegments.join('/')}`;
};

/**
 * Builds a page URL using PageConfigId and an optional array of path parameters.
 *
 * @param pageId - Page identifier defined in PAGE_CONFIGS
 * @param params - Optional array of path parameters (e.g. [centerCode, assetId])
 * @returns Complete URL path
 */
export const buildPageUrl = (
  pageId: PageConfigId,
  params?: (string | number | undefined | null)[],
): string => {
  if (!PAGE_CONFIGS[pageId]) {
    throw new Error(`Invalid pageId: ${pageId}`);
  }
  return joinUrlParams(PAGE_CONFIGS[pageId].url, params);
};
