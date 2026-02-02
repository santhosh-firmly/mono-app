import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const config = {
		plugins: [sveltekit()],
		server: {
			proxy: {
				// Catalog API proxy for local development
				// In production, this is handled via Cloudflare service bindings
				'/admin/api/catalog': {
					target: 'https://getallproducts-wf.firmly-dev.workers.dev',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/admin\/api\/catalog/, '/api'),
					headers: {
						Cookie: 'fdev=firmly-dev-2024'
					}
				}
			}
		}
	};

	// Cloudflare vite plugin provides bindings/D1/KV support in dev mode
	// Not needed for build - adapter-cloudflare handles production bundling
	// Skip if SKIP_CLOUDFLARE_PLUGIN env is set (useful for testing without Cloudflare bindings)
	if (ctx.command !== 'build' && !process.env.SKIP_CLOUDFLARE_PLUGIN) {
		config.plugins.push(cloudflare());
	}

	return config;
});
