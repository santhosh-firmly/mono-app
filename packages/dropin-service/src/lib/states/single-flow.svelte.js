import { cartGetCart, cartUpdateSku } from '$lib/services/cart';
import { initialize } from '$lib/services/bootstrap';

const DOMAIN = 'shop.liquid-iv.com';

export let data = $state({
	cart: null,
	pending: {
		cart: true
	}
});

// Actions
function handleUpdateLineItem(payload) {
	data.pending['update_line_item'] = true;
	cartUpdateSku(payload.sku, payload.quantity, [], DOMAIN)
		.then((res) => {
			data.cart = res.data;
		})
		.catch((err) => {
			console.error('Error updating line item:', err);
		})
		.finally(() => {
			data.pending['update_line_item'] = false;
		});
}

export function dispatch(event, payload) {
	switch (event) {
		case 'update_line_item':
			handleUpdateLineItem(payload);
			break;

		default:
			break;
	}
}

export async function start(apiId, cfServer) {
	await initialize(apiId, cfServer);

	cartGetCart(DOMAIN).then((res) => {
		data.pending.cart = false;
		data.cart = res.data;
	});
}
