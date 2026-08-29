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
              group: ['@repo/infrastructures*', '@repo/database*', '@repo/ui*'],
              message:
                'Application layer cannot import from Infrastructure, Database, or UI layers (Clean Architecture boundary).',
            },
          ],
        },
      ],
    },
  },
];
