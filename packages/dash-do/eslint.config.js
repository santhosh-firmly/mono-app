import * as babelParser from '@babel/eslint-parser';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/allure/**', '**/parked/**', '**/.wrangler/**', '**/tools/**', '**/adapters-catalog.js'],
    },
    eslint.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            globals: {
                ...globals.worker,

                // Cloudflare
                HTMLRewriter: true,
                crypto: true,
                structuredClone: true,
                DecompressionStream: true,
                ReadableStream: true,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    plugins: ['@babel/plugin-syntax-import-assertions'],
                },
            },
        },
        plugins: {
            prettier: prettierPlugin,
            import: importPlugin,
        },
        settings: {
            react: {
                version: '999.999.999',
            },
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
                    endOfLine: 'lf',
                },
            ],
            'no-restricted-syntax': 'off',
            'class-methods-use-this': 'off',
            'no-underscore-dangle': 'off',
            'no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'none',
                    ignoreRestSiblings: true,
                    reportUsedIgnorePattern: false,
                },
            ],
            'max-len': [
                'error',
                {
                    code: 180,
                    ignorePattern: '^import',
                    ignoreStrings: true,
                },
            ],
            'function-call-argument-newline': ['error', 'consistent'],
            'no-plusplus': 'off',
            'no-throw-literal': 'off',
            'comma-dangle': ['error', 'always-multiline'],
            'no-await-in-loop': 'off',
            'no-param-reassign': ['error', { props: false }],
            'eol-last': ['error', 'always'],
            'no-useless-concat': 'off',
            'max-classes-per-file': 'off',

            // Console
            'no-console': 'warn',

            // Import
            'import/prefer-default-export': 'off',
            'import/no-cycle': 'off',
            'import/extensions': ['error', 'always'],
            'import/no-unresolved': ['error', { ignore: ['cloudflare:test'] }],
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
