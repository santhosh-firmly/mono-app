import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		version: {
			name: process.env.npm_package_version
		},
		alias: {
			'$lib-v4': './src/lib-v4',
			$dist: './dist'
		}
	},
	preprocess: [vitePreprocess()]
};

export default config;
