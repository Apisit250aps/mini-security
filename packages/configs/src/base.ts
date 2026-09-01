import dotenv from 'dotenv';
import { findEnvFile } from './path';
dotenv.config({ path: findEnvFile() });

class BaseConfig {
  load(key: string, defaultValue = ''): string {
    return process.env[key] || defaultValue;
  }

  loadNumber(key: string, defaultValue = '0'): number {
    return Number(this.load(key, defaultValue));
  }
}

export default BaseConfig;
