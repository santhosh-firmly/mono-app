import preprocess from 'svelte-preprocess';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapterCloudflare(),
		version: {
			name: process.env.npm_package_version
		},
		alias: {
			$root: '/',
			$dist: './dist'
		}
	},
	preprocess: [
		vitePreprocess(),
		preprocess({
			postcss: true
		})
	],
	vitePlugin: {
		// set to true for defaults or customize with object
		inspector: {
			toggleKeyCombo: 'meta-shift',
			showToggleButton: 'always',
			toggleButtonPos: 'bottom-right'
		}
	}
};

export default config;
