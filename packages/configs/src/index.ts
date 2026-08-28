import dotenv from 'dotenv';
dotenv.config();

/**
 * Application configuration
 */
class Config {
  /**
   * Database configuration
   */
  databaseUrl = this.load('DATABASE_URL', '');
  /**
   * Backend configuration
   */
  backendOrigin = this.load('BACKEND_ORIGIN', 'http://localhost:8000');
  backendPort = this.loadNumber('BACKEND_PORT', '8000');
  backendUrl = this.load('BACKEND_URL', 'http://localhost:8000');
  /**
   * Authentication configuration
   */
  auth = {
    secret: this.load('BETTER_AUTH_SECRET', ''),
    url: this.load('BETTER_AUTH_URL', 'http://localhost:8000'),
  };

  load(key: string, defaultValue = ''): string {
    return process.env[key] || defaultValue;
  }

  loadNumber(key: string, defaultValue = '0'): number {
    return Number(this.load(key, defaultValue));
  }
}

export const config = new Config();

export default config;
