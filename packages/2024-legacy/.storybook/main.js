/** @type { import('@storybook/sveltekit').StorybookConfig } */
const config = {
	stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/addon-svelte-csf',
		'storybook-dark-mode',
		{
			name: '@storybook/addon-coverage',
			options: {
				istanbul: {
					include: ['src/**.svelte', 'src/**.js'],
					excludeNodeModules: true
				}
			}
		}
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: 'tag'
	},
	staticDirs: [
		// Svelte project static folder
		'../static',
		// Storybook static folder
		'static'
	]
};
export default config;
