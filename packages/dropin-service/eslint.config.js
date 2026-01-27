import createConfig from '@firmly/eslint-config';
import svelteConfig from './svelte.config.js';

export default createConfig({
	svelteConfig,
	tailwindEntryPoint: 'src/app.css',
	// Temporary because v4 have a lot of Svelte lint errors
	ignores: ['**/src/lib-v4/**']
});
