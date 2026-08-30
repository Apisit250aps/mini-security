import { config } from '@repo/configs/eslint/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ['src/api/**', 'schema/**'],
  },
];
