import { cartGetCart, cartUpdateSku } from '$lib/services/cart';
import { initialize } from '$lib/services/bootstrap';

const DOMAIN = 'shop.liquid-iv.com';

export const ACTIONS = {
	CART: 'cart',
	UPDATE_LINE_ITEM: 'update_line_item',
	ADD_PROMO_CODE: 'add_promo_code',
	REMOVE_ALL_CODES: 'remove_all_codes',
	CALCULATE_SHIPPING: 'calculate_shipping',
	SET_SHIPPING_ADDRESS: 'set_shipping_ADDRESS',
	UPDATE_SHIPPING_METHOD: 'update_shipping_method',
	GO_BACK: 'go_back',
	USE_FAST_CHECKOUT: 'use_fast_checkout',
	INPUT_SHIPPING_ADDRESS_COMPLETION: 'input_shipping_address_completion',
	SELECT_SHIPPING_ADDRESS_COMPLETION: 'select_shipping_address_completion',
	INPUT_BILLING_ADDRESS_COMPLETION: 'input_billing_address_completion',
	SELECT_BILLING_ADDRESS_COMPLETION: 'select_billing_address_completion',
	SET_CREDIT_CARD: 'set_credit_card',
	PLACE_ORDER: 'place_order'
};

export let data = $state({
	cart: null,
	pending: {
		cart: true
	}
});

export async function start(apiId, cfServer) {
	await initialize(apiId, cfServer);

	cartGetCart(DOMAIN).then((res) => {
		data.pending.cart = false;
		data.cart = res.data;
	});
}

// Actions
function handleUpdateLineItem(payload) {
	data.pending[ACTIONS.UPDATE_LINE_ITEM] = true;
	cartUpdateSku(payload.sku, payload.quantity, [], DOMAIN)
		.then((res) => {
			data.cart = res.data;
		})
		.catch((err) => {
			console.error('Error updating line item:', err);
		})
		.finally(() => {
			data.pending[ACTIONS.UPDATE_LINE_ITEM] = false;
		});
}

export function dispatch(event, payload) {
	switch (event) {
		case ACTIONS.UPDATE_LINE_ITEM:
			handleUpdateLineItem(payload);
			break;

		default:
			break;
	}
}
