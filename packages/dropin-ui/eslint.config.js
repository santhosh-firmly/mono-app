import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

import noRelativeLibImports from './eslint-rules/no-relative-lib-imports.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			custom: {
				rules: {
					'no-relative-lib-imports': noRelativeLibImports
				}
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.js'],

		languageOptions: {
			parserOptions: {
				svelteConfig
			}
		}
	}
];
