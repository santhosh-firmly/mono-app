import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const config = {
		plugins: [sveltekit()]
	};

	// Cloudflare vite plugin provides bindings/D1/KV support in dev mode
	// Not needed for build - adapter-cloudflare handles production bundling
	if (ctx.command !== 'build') {
		config.plugins.push(cloudflare());
	}

	return config;
});
