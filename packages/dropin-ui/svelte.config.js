import adapter from '@sveltejs/adapter-cloudflare-workers';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		version: {
			name: process.env.npm_package_version
		}
	},
	preprocess: [vitePreprocess()]
};

export default config;
