import { config } from '@repo/eslint-config/base';

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
              group: ['@repo/applications*', '@repo/client*', '@repo/ui*'],
              message:
                'Infrastructure layer cannot import from Application, Client, or UI layers (Clean Architecture boundary).',
            },
          ],
        },
      ],
    },
  },
];
