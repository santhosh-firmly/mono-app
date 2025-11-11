import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const plugins = [tailwindcss(), sveltekit()];

	const isBuild = ['build'].includes(ctx.command);
	const isPreview = ctx.isPreview === true;

	if (!isBuild && !isPreview) {
		plugins.push(cloudflare());
	}

	return { plugins };
});
