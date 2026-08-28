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
              group: ['@repo/ui*'],
              message:
                'API layer cannot import from UI layer (Clean Architecture boundary).',
            },
          ],
        },
      ],
    },
  },
];
