import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import svelte from 'eslint-plugin-svelte';
import tailwind from 'eslint-plugin-tailwindcss';
import globals from 'globals';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/static/**', '**/storybook-static/**', '**/.storybook/**', '**/.svelte-kit/**', '**/.wrangler/**'],
    },
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    ...tailwind.configs['flat/recommended'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            prettier: prettierPlugin,
            import: importPlugin,
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    bracketSpacing: true,
                    singleQuote: true,
                    tabWidth: 4,
                    trailingComma: 'all',
                    useTabs: false,
                    printWidth: 180,
                    proseWrap: 'always',
                    experimentalTernaries: true,
                },
            ],
            'tailwindcss/no-custom-classname': 'off',
            // Import
            'import/prefer-default-export': 'off',
            'import/no-cycle': 'off',
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin', // Built-in modules (e.g., path, fs)
                        'external', // External libraries (e.g., react, lodash)
                        'internal', // Internal project modules
                        'parent', // Relative imports from parent directories
                        'sibling', // Relative imports from the same directory
                        'index', // Relative imports to the current file (index.js)
                        'object', // Import of object type
                        'type', // Import of type
                    ],
                    'newlines-between': 'always', // Enforce newlines between import groups
                    alphabetize: {
                        order: 'asc', // Sort imports alphabetically within each group
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
];
