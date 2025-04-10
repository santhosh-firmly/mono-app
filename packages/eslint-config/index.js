import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import noRelativeLibImports from './rules/no-relative-lib-imports.js';

/**
 * @param {object} options
 * @param {string} options.gitignorePath - Path to the .gitignore file
 * @param {object} options.svelteConfig - Svelte config object
 * @returns {import('eslint').Linter.Config[]}
 */
export default function createConfig({ gitignorePath, svelteConfig, ignores = [] }) {
	return [
		includeIgnoreFile(gitignorePath),
		js.configs.recommended,
		...svelte.configs.recommended,
		prettier,
		...svelte.configs.prettier,
		{
			ignores
		},
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
}
