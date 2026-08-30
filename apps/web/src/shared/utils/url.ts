/**
 * Returns the application origin URL safely in both SSR and client environments.
 */
export function getOriginUrl(path: string = ''): string {
  let origin = '';

  if (typeof window !== 'undefined') {
    origin = window.location.origin;
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    origin = process.env.NEXT_PUBLIC_APP_URL;
  } else if (process.env.VERCEL_URL) {
    origin = `https://${process.env.VERCEL_URL}`;
  } else {
    origin = 'http://localhost:3000';
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return path ? `${origin}${normalizedPath}` : origin;
}

/**
 * Constructs a callback URL for auth redirects.
 */
export function getCallbackUrl(path: string = '/admin/user'): string {
  return getOriginUrl(path);
}
