import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * Stubs `cloudflare:*` protocol imports during local dev.
 * These modules are only available inside workerd (Cloudflare Workers runtime).
 * The foundation package imports from `cloudflare:workers` at the module level,
 * which crashes Node.js since it doesn't support the `cloudflare:` protocol.
 * During build, the adapter targets Cloudflare Workers where these are natively available.
 */
function cloudflareModuleStubs() {
	return {
		name: 'cloudflare-module-stubs',
		enforce: 'pre',
		resolveId(id) {
			if (id.startsWith('cloudflare:')) {
				return `\0virtual:${id}`;
			}
		},
		load(id) {
			if (id.startsWith('\0virtual:cloudflare:')) {
				return 'export class DurableObject {} export class RpcTarget {} export class WorkerEntrypoint {} export default {};';
			}
		}
	};
}

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
	const isStorybook =
		process.env.npm_lifecycle_script?.includes('storybook') || process.env.STORYBOOK === 'true';

	const isDev = !isBuild && !isStorybook && !ctx.isPreview;

	if (isDev) {
		plugins.unshift(cloudflareModuleStubs());
	}

	return {
		plugins,
		...(isDev && {
			ssr: {
				noExternal: ['foundation']
			}
		})
	};
});
