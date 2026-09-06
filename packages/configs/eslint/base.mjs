import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
// shared base config
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-restricted-types': [
        'warn',
        {
          types: {
            unknown: {
              message:
                'Avoid using `unknown` directly; prefer explicit types, interfaces, or domain schemas.',
            },
            never: {
              message:
                'Avoid using `never` or `as never` for type assertions; prefer specific types or proper type narrowing instead.',
            },
          },
        },
      ],
    },
  },
  {
    ignores: ['dist/**', '.turbo/**', 'node_modules/**'],
  },
];
