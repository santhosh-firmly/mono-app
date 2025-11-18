import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const plugins = [tailwindcss(), sveltekit()];

	const isBuild = ctx.command === 'build';
	const isPreview = ctx.isPreview === true;
	const isStorybook =
		process.env.npm_lifecycle_script?.includes('storybook') || process.env.STORYBOOK === 'true';

	if (!isBuild && !isPreview && !isStorybook) {
		plugins.push(
			cloudflare({
				configPath: './wrangler.jsonc'
			})
		);
	}

	return { plugins };
});
