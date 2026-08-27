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
              group: [
                '@repo/applications*',
                '@repo/infrastructures*',
                '@repo/client*',
                '@repo/ui*',
              ],
              message:
                'Database layer cannot import from Application, Infrastructure, or UI layers (Clean Architecture boundary).',
            },
          ],
        },
      ],
    },
  },
];
