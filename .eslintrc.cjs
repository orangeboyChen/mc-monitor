/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // ---- Style rules requested by the user ----
    // 1. Single quotes only (TS-aware version of `quotes`).
    quotes: 'off',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'jsx-quotes': ['error', 'prefer-single'],

    // 2. No semicolons (TS-aware version of `semi`).
    semi: 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'none' },
        singleline: { delimiter: 'semi', requireLast: false },
      },
    ],

    // 3. Forbid `function` declarations: must use `const fn = () => {}`.
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'FunctionDeclaration',
        message: 'Use an arrow expression assigned to const: const fn = () => {}',
      },
      {
        selector: 'ExportDefaultDeclaration > FunctionDeclaration',
        message:
          'Use `const fn = () => {}` then `export default fn` instead of `export default function`.',
      },
      {
        selector: 'ExportNamedDeclaration > FunctionDeclaration',
        message: 'Use `export const fn = () => {}` instead of `export function fn() {}`.',
      },
    ],

    // ---- Sensible TS defaults ----
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
  ignorePatterns: ['.next/', 'node_modules/', 'next-env.d.ts'],
}
