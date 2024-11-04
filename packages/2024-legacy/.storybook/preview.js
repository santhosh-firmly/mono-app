import '../src/firmly-edge.postcss';
import { initialize, mswLoader } from 'msw-storybook-addon';

// Initialize MSW
initialize({ onUnhandledRequest: 'bypass' });

/** @type { import('@storybook/svelte').Preview } */
const preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/
			}
		},
		docs: {
			// theme: firmlyTheme,
		},
		darkMode: {
			stylePreview: true
		}
	},
	loaders: [mswLoader]
};

export default preview;
