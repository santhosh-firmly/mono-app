/**
 * Stubs `cloudflare:*` protocol imports during local dev.
 * These modules are only available inside workerd (Cloudflare Workers runtime).
 * The foundation package imports from `cloudflare:workers` at the module level,
 * which crashes Node.js since it doesn't support the `cloudflare:` protocol.
 * During build, the adapter targets Cloudflare Workers where these are natively available.
 */
export function cloudflareModuleStubs() {
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

/**
 * Returns Vite config additions needed for Cloudflare-based services during local dev.
 * - Prepends the `cloudflareModuleStubs` plugin to the provided plugins array
 * - Returns SSR config to bundle `foundation` (which imports `cloudflare:*` at module level)
 *
 * @param {import('vite').ConfigEnv} ctx - Vite config environment context
 * @param {{ plugins: import('vite').Plugin[] }} options - Must include the plugins array to mutate
 * @returns {object} Vite config to spread into the return object (contains `ssr` when in dev)
 */
export function cloudflareDevConfig(ctx, { plugins }) {
	const isStorybook =
		process.env.npm_lifecycle_script?.includes('storybook') || process.env.STORYBOOK === 'true';

	const isDev = ctx.command !== 'build' && !isStorybook && !ctx.isPreview && ctx.mode !== 'test';

	if (isDev) {
		plugins.unshift(cloudflareModuleStubs());
		return {
			ssr: {
				noExternal: ['foundation']
			}
		};
	}

	return {};
}
