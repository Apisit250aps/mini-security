import { config } from '@repo/configs/eslint/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@repo/client*', '@repo/ui*'],
              message:
                'Infrastructure layer cannot import from Client or UI layers (Clean Architecture boundary).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/repositories/**', 'src/lib/**', 'src/auth/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@repo/applications*', '@repo/client*', '@repo/ui*'],
              message:
                'Repository and library layers cannot import from Application, Client, or UI layers.',
            },
          ],
        },
      ],
    },
  },
];
