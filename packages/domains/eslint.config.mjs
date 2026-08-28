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
              group: [
                '@repo/database*',
                '@repo/applications*',
                '@repo/infrastructures*',
                '@repo/client*',
                '@repo/ui*',
              ],
              message:
                'Domain layer cannot import from other internal packages (Clean Architecture boundary).',
            },
          ],
        },
      ],
    },
  },
];
