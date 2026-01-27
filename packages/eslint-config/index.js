import { fileURLToPath } from 'node:url';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import globals from 'globals';
import noRelativeLibImports from './rules/no-relative-lib-imports.js';
import kebabCaseFilename from './rules/kebab-case-filename.js';

const gitignorePath = fileURLToPath(new URL('../../.gitignore', import.meta.url));

/**
 * @param {object} options
 * @param {string} owptions.gitignorePath - Path to the .gitignore file
 * @param {object} options.svelteConfig - Svelte config object
 * @returns {import('eslint').Linter.Config[]}
 */
export default function createConfig({ svelteConfig, ignores = [], tailwindEntryPoint = 'src/app.css' }) {
	return [
		includeIgnoreFile(gitignorePath),
		eslintPluginPrettierRecommended,
		js.configs.recommended,
		...svelte.configs.recommended,
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
						'no-relative-lib-imports': noRelativeLibImports,
						'kebab-case-filename': kebabCaseFilename
					}
				},
				'better-tailwindcss': betterTailwindcss
			},
			settings: {
				'better-tailwindcss': {
					entryPoint: tailwindEntryPoint
				}
			},
			rules: {
				'custom/kebab-case-filename': 'error',
				'better-tailwindcss/enforce-canonical-classes': 'warn'
			}
		},
		{
			files: ['**/*.svelte', '**/*.svelte.js'],
			languageOptions: {
				parserOptions: {
					svelteConfig
				}
			},
			rules: {
				'svelte/no-navigation-without-resolve': 'off'
			}
		},
		{
			files: ['**/*.svelte.test.js', '**/*.svelte.spec.js'],
			languageOptions: {
				globals: {
					$state: 'readonly',
					$derived: 'readonly',
					$effect: 'readonly',
					$props: 'readonly',
					$bindable: 'readonly',
					$inspect: 'readonly',
					$host: 'readonly'
				}
			}
		}
	];
}
