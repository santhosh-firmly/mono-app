import { fileURLToPath } from 'node:url';
import createConfig from '@mono-app/eslint-config';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default createConfig({
	gitignorePath,
	svelteConfig,
	// Temporary because v4 have a lot of Svelte lint errors
	ignores: ['**/src/lib-v4/**']
});
