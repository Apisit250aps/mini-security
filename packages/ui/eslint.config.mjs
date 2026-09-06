import { config } from '@repo/configs/eslint/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    rules: {
      '@typescript-eslint/no-restricted-types': 'off',
    },
  },
];
