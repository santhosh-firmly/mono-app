import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import tailwindcss from '@tailwindcss/vite';
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

	const isBuild = ['build'].includes(ctx.command);
	const isPreview = ctx.isPreview === true;
	const isTest = ctx.mode === 'test';
	const isStorybook =
		process.env.npm_lifecycle_script?.includes('storybook') || process.env.STORYBOOK === 'true';

	// Only add the Cloudflare plugin if we are not building for production, SvelteKit is already bulding for Cloudflare Workers
	// Also skip Cloudflare plugin when running Storybook to avoid configuration conflicts
	if (!isBuild && !isPreview && !isTest && !isStorybook) {
		plugins.push(cloudflare());
	}

	return { plugins };
});
