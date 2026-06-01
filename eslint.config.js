import eslintTs from 'super-configs/eslint/ts';

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
    ],
  },
  ...eslintTs,
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
    },
  },
];
