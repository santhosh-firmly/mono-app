import adapter from '@sveltejs/adapter-cloudflare';
// import { vitePreprocess } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        version: {
            name: process.env.npm_package_version
        }
    },
    preprocess: [
        vitePreprocess(),
        preprocess({
            postcss: true
        })
    ]
};

export default config;
