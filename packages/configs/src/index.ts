import BaseConfig from './base';
/**
 * Application configuration
 */
class Config extends BaseConfig {
  /**
   * Database configuration
   */
  databaseUrl = this.load('DATABASE_URL', '');
  /**
   * Backend configuration
   */
  backend = {
    origin: this.load('BACKEND_ORIGIN', 'http://localhost:8000'),
    port: this.loadNumber('BACKEND_PORT', '8000'),
    url: this.load('BACKEND_URL', 'http://localhost:8000'),
    corsOrigins: this.load('BACKEND_CORS_ORIGINS', 'http://localhost:3000'),
  };
  /**
   * Authentication configuration
   */
  auth = {
    secret: this.load('BETTER_AUTH_SECRET', ''),
    url: this.load('BETTER_AUTH_URL', 'http://localhost:8000'),
  };
}

export const config = new Config();

export default config;
