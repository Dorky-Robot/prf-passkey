import typescriptEslint from '@typescript-eslint/eslint-plugin';
import security from 'eslint-plugin-security';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts', '__tests__/**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      security: security,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Security rules
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      
      // General rules
      'no-console': 'off', // Allow console in examples
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'security/detect-object-injection': 'off', // Tests need dynamic access
    },
  },
];