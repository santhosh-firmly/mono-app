import '../src/app.css';
import { withThemeByClassName } from '@storybook/addon-themes';

/** @type { import('@storybook/sveltekit').Preview } */
const preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		options: {
			storySort: {
				order: [
					'Introduction',
					'Foundations',
					[
						'Theme',
						['Colors', 'Typography', 'Spacing'],
						'Iconography',
						'Buttons',
						'Layout'
					],
					'Forms',
					[
						'Input',
						'Textarea',
						'Select',
						'Checkbox',
						'Switch',
						'Combobox',
						'OTP Input',
						'Form Field'
					],
					'Data Display',
					['Charts', 'Cards', 'Tables'],
					'Feedback',
					['Alert', 'Badge', 'Progress', 'Copy To Clipboard'],
					'Overlays',
					['Dialog', 'Drawer', 'Popover', 'Dropdown Menu', 'Command'],
					'Navigation',
					['Page Header', 'Tabs', 'Pagination', 'Breadcrumb'],
					'Authentication',
					'Merchant',
					['Dashboard', 'Settings', 'Team', 'Products', 'Branding', 'Onboarding'],
					'Orders',
					'Admin',
					'Profile',
					'Pages',
					['Admin', 'Merchant', 'Public']
				]
			}
		}
	},
	decorators: [
		withThemeByClassName({
			themes: {
				light: '',
				dark: 'dark'
			},
			defaultTheme: 'light'
		})
	]
};

export default preview;
