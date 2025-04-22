import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const config = {
		plugins: [sveltekit()]
	};

	if (!['build'].includes(ctx.command) && ctx.isPreview === false) {
		config.plugins.push(cloudflare());
	}

	return config;
});
