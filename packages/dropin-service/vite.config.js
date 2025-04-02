import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const plugins = [
		tailwindcss(),
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	];

	// Only add the Cloudflare plugin if we are not building for production, SvelteKit is already bulding for Cloudflare Workers
	if (!['build'].includes(ctx.command)) {
		plugins.push(cloudflare());
	}

	return {
		plugins,
		test: {
			workspace: [
				{
					extends: './vite.config.js',
					plugins: [svelteTesting()],

					test: {
						name: 'client',
						environment: 'jsdom',
						clearMocks: true,
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.js']
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
