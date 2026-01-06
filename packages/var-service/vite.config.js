import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const plugins = [tailwindcss(), sveltekit()];

	const isBuild = ctx.command === 'build';
	const isPreview = ctx.isPreview === true;
	const isTest = ctx.mode === 'test';
	const isStorybook =
		process.env.npm_lifecycle_script?.includes('storybook') || process.env.STORYBOOK === 'true';

	if (!isBuild && !isPreview && !isTest && !isStorybook) {
		plugins.push(
			cloudflare({
				configPath: './wrangler.jsonc'
			})
		);
	}

	return {
		plugins,
		test: {
			projects: [
				{
					extends: './vite.config.js',
					test: {
						name: 'client',
						environment: 'jsdom',
						clearMocks: true,
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**']
					}
				},
				{
					extends: './vite.config.js',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
					}
				}
			]
		}
	};
});
