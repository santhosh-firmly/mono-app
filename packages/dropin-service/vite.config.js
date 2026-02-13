import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cloudflareDevConfig } from '@firmly/vite-config';
import { defineConfig } from 'vite';

export default defineConfig((ctx) => {
	const plugins = [
		tailwindcss(),
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	];

	return {
		plugins,
		...cloudflareDevConfig(ctx, { plugins })
	};
});
