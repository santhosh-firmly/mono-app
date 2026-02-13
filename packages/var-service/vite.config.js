import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflareDevConfig } from '@firmly/vite-config';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const plugins = [tailwindcss(), sveltekit()];

	return {
		plugins,
		...cloudflareDevConfig(ctx, { plugins }),
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
