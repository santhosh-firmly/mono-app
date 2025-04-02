// @ts-nocheck
import { LineItem } from './line-item.js';
import { Subscribable } from './subscribable.js';
import { setOrderInLocalStorage } from './orders.js';

export class Cart extends Subscribable {
	constructor(cart) {
		super();
		this.#_updateCart(cart);
	}

	static async getCartForDomain(domain) {
		return new Cart({
			cart_status: 'active',
			shop_id: domain,
			line_items: []
		});
	}

	static async sessionTransfer(domain, transferPayload) {
		const res = await window.firmly.cartSessionTransfer(transferPayload, domain);
		if (res.status !== 200) {
			throw res.data;
		}

		return new Cart(res.data);
	}

	async addLineItem(sku, quantity, variantHandles) {
		const res = await window.firmly.cartAddLineItem(sku, quantity, variantHandles, this.shop_id);
		if (res.status !== 200) {
			throw res.data;
		}

		return this.#_updateCart(res.data);
	}

	#_enforceStatusActive() {
		if (this.cart_status !== 'active') {
			throw new Error('This Cart is not longer active. An order may have been placed already.');
		}
	}

	async #_updateCart(rawCart) {
		Object.assign(this, rawCart);
		this.line_items = rawCart.line_items.map(
			(l) => new LineItem(l, this.shop_id, this.cart_status !== 'active')
		);
		// If line items are changed, this cart must be updated
		this.line_items.forEach((l) => l.internalSubscribe((newCart) => this.#_updateCart(newCart)));
		await this.dispatch();
		return this;
	}

	async clear() {
		this.#_enforceStatusActive();
		const resp = await window.firmly.cartClear(this.shop_id);
		if (resp.status !== 200) {
			throw resp.data;
		}
		return this.#_updateCart(resp.data);
	}

	getShippingInfo() {
		return this.shipping_info;
	}

	async setShippingInfo(shippingInfo) {
		this.#_enforceStatusActive();

		const resp = await window.firmly.cartUpdateShippingInfo(shippingInfo, this.shop_id);
		if (resp.status !== 200) {
			throw resp.data;
		}

		return this.#_updateCart(resp.data);
	}

	// TODO: Recompute when creating the cart on the first time?
	getTotalItemCount() {
		return this.line_items.reduce((sum, l) => sum + l.quantity, 0);
	}

	getShippingRates() {
		return this.shipping_method_options;
	}

	async setShippingMethod(shippingMethod) {
		this.#_enforceStatusActive();
		const resp = await window.firmly.cartUpdateDelivery(shippingMethod, this.shop_id);
		if (resp.status !== 200) {
			throw resp.data;
		}
		return this.#_updateCart(resp.data);
	}

	async placeOrderWithCreditCart(creditCard, billingInfo) {
		this.#_enforceStatusActive();

		if (!creditCard) {
			throw new Error('Credit card cannot be null.');
		}

		// TODO: The API should validate the requirements.
		if (!billingInfo) {
			throw new Error('Billing info cannot be null.');
		}

		const tokenizeInput = {
			credit_card: creditCard,
			billing_info: billingInfo
		};

		let resp = await window.firmly.paymentCreditCardTokenize(tokenizeInput, this.payment_handle);
		if (resp.status !== 200) {
			throw resp.data;
		}

		resp = await window.firmly.cartCompleteOrder(resp.data.token, this.shop_id);
		if (resp.status !== 200) {
			throw resp.data;
		}

		setOrderInLocalStorage(resp.data);

		return this.#_updateCart(resp.data);
	}
}
