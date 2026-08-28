import dotenv from 'dotenv';
import { findEnvFile } from './path';

dotenv.config({ path: findEnvFile() });

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

  load(key: string, defaultValue = ''): string {
    return process.env[key] || defaultValue;
  }

  loadNumber(key: string, defaultValue = '0'): number {
    return Number(this.load(key, defaultValue));
  }
}

export const config = new Config();

export default config;
