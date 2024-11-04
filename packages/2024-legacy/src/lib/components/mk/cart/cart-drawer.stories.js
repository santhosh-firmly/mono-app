import { CartHive } from '$lib/sdk/cart-hive.js';
import { bootstrap } from '$lib/sdk/index.js';
import CartDrawer from './cart-drawer.svelte';
import { FirmlyAICartData, MagentoCartData, YoungRebelzCartData } from './cart.stories.js';
import MarginDecorator from './margin-decorator.svelte';

export default {
	title: 'Dynamo/CartDrawer',
	component: CartDrawer,
	tags: ['autodocs'],
	excludeStories: /Data$/,
	decorators: [() => MarginDecorator]
};

bootstrap();

export const ClosedEmptyCart = {
	args: {
		cartHive: new CartHive([]),
		blockScrolling: false,
		drawerOpen: false
	}
};

export const OpenEmptyCart = {
	args: {
		cartHive: new CartHive([]),
		blockScrolling: false,
		drawerOpen: true
	}
};

export const EmptyCartAddingProduct = {
	args: {
		cartHive: new CartHive([]),
		blockScrolling: false,
		addingToCart: true,
		drawerOpen: true
	}
};

export const SingleCart = {
	args: {
		cartHive: new CartHive([FirmlyAICartData]),
		blockScrolling: false,
		drawerOpen: true
	}
};

export const SingleCartAddingProduct = {
	args: {
		cartHive: new CartHive([FirmlyAICartData]),
		blockScrolling: false,
		addingToCart: true,
		drawerOpen: true
	}
};

export const MultipleCarts = {
	args: {
		cartHive: new CartHive([FirmlyAICartData, MagentoCartData, YoungRebelzCartData]),
		blockScrolling: false,
		drawerOpen: true
	}
};

export const MultipleCartsAddingProduct = {
	args: {
		cartHive: new CartHive([FirmlyAICartData, MagentoCartData, YoungRebelzCartData]),
		blockScrolling: false,
		addingToCart: true,
		drawerOpen: true
	}
};
