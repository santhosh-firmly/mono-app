import remarkGfm from 'remark-gfm';

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
		'@storybook/addon-interactions',
		'@storybook/addon-postcss',
		'@storybook/addon-themes',
		'@storybook/addon-links',
		{
			name: '@storybook/addon-docs',
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm]
					}
				}
			}
		}
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	staticDirs: ['../static']
};
export default config;
