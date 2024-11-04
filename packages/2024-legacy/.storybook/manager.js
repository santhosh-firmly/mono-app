// .storybook/manager.js

import { addons } from '@storybook/manager-api';
import firmlyTheme from './theme.js';

addons.setConfig({
	theme: firmlyTheme
});
