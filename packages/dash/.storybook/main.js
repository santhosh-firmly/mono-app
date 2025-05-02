/** @type { import('@storybook/sveltekit').StorybookConfig } */
const config = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
	addons: [
		'@storybook/addon-essentials',
		{
			name: '@storybook/addon-svelte-csf',
			options:
				// TODO: Temporary when using V4 and project is not migrated.
				{ legacyTemplate: true }
		},
		'@chromatic-com/storybook',
		'@storybook/addon-interactions',
		'@storybook/addon-postcss'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	staticDirs: ['../static']
};
export default config;
