/**
 * Global Client Configuration
 * Safe for use in browser and React client components.
 */
export class ClientConfig {
  /**
   * API endpoints (relative paths for Next.js proxy rewrite)
   */
  readonly api = {
    authBaseUrl: '/api/auth',
    baseUrl: '/api',
  };

  /**
   * App metadata and common settings
   */
  readonly app = {
    name: 'Mini Security',
  };
}

export const clientConfig = new ClientConfig();

export default clientConfig;

