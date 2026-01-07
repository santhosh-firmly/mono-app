// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import createConfig from '@firmly/eslint-config';
import svelteConfig from './svelte.config.js';

export default createConfig({
	svelteConfig
});
