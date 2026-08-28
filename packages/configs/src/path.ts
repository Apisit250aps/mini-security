import fs from 'node:fs';
import path from 'node:path';

const findEnvFile = () => {
  let directory = process.cwd();

  while (true) {
    const envFile = path.join(directory, '.env');
    if (fs.existsSync(envFile)) {
      return envFile;
    }

    const parentDirectory = path.dirname(directory);
    if (parentDirectory === directory) {
      return undefined;
    }
    directory = parentDirectory;
  }
};

export { findEnvFile };
