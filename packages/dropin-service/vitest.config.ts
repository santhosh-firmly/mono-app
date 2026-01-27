import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'dom',
					include: [
						'tests/lib/components/**/*.{test,spec}.js',
						'tests/lib/states/**/*.svelte.{test,spec}.{js,ts}',
						'tests/lib/composables/**/*.svelte.{test,spec}.{js,ts}',
						'tests/lib/directives/**/*.{test,spec}.{js,ts}',
						'tests/lib/services/mastercard-c2p.{test,spec}.{js,ts}'
					],
					setupFiles: ['./vitest.setup.ts'],
					browser: {
						enabled: true,
						instances: [
							{
								browser: 'chromium',
								headless: true,
								screenshotFailures: false
							}
						],
						provider: 'playwright'
					}
				}
			},
			{
				extends: true,
				test: {
					name: 'js',
					include: [
						'tests/lib/services/**/*.{test,spec}.{js,ts}',
						'tests/lib/utils/**/*.{test,spec}.{js,ts}',
						'tests/lib/server/**/*.{test,spec}.{js,ts}',
						'!tests/lib/services/mastercard-c2p.{test,spec}.{js,ts}'
					],
					setupFiles: ['./vitest.setup.ts'],
					environment: 'node'
				}
			}
		],
		coverage: {
			provider: 'v8',
			experimentalAstAwareRemapping: true,
			include: ['src/lib/**/*.{js,ts,svelte}'],
			exclude: [
				'src/lib-v4/**',
				'src/lib/views/**',
				'src/lib/**/*.stories.svelte',
				'src/lib/paraglide/**',
				'.svelte-kit/**',
				'node_modules/**',
				'src/lib/i18n.js',
				'src/lib/composables/animated-value.svelte.js',
				// Configurator: Development-only tool for testing checkout flow with mocked requests
				'src/lib/components/configurator/**',
				'src/lib/states/configurator/**',
				'src/lib/utils/configurator/**',
				'src/lib/utils/mocks/**'
			],
			thresholds: {
				statements: 95,
				branches: 90,
				functions: 90,
				lines: 95
			}
		}
	}
});
