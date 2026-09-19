import BaseConfig from './base';
import { logger as terminalLogger } from './logger';
/**
 * Application configuration
 */
export class Config extends BaseConfig {
  /** Shared application logger used by infrastructure adapters. */
  logger = terminalLogger;
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
  /**
   * Field encryption configuration
   */
  encryption = {
    fieldKey: this.load('FIELD_ENCRYPTION_KEY', ''),
    lookupKey: this.load('FIELD_LOOKUP_KEY', ''),
    version: this.loadNumber('FIELD_ENCRYPTION_CURRENT_VERSION', '1'),
  };
}

export const config = new Config();

export * from './logger';

export default config;
