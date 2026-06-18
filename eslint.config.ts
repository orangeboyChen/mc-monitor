import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
    {
        ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
    },
    {
        linterOptions: {
            reportUnusedDisableDirectives: 'off',
        },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            '@next/next': nextPlugin,
            'react-hooks': reactHooks,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        rules: {
            // Forbid `function` declarations: must use `const fn = () => {}`.
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

            // Sensible TS defaults.
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': 'off',
        },
    },
)
