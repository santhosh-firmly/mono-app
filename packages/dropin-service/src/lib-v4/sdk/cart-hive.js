// @ts-nocheck
import { bindEvent } from '$lib-v4/browser/dash.js';
import { Cart } from './cart.js';
import { Subscribable } from './subscribable.js';

const DEFAULT_CURRENCY = 'USD';
let localCachedCartHive;

export class CartHive extends Subscribable {
	constructor(carts) {
		super();
		this.merchants = carts.reduce((acc, cart) => {
			acc[cart.shop_id] = new Cart(cart);
			acc[cart.shop_id].internalSubscribe(() => this.#recompute());
			return acc;
		}, {});

		this.#recompute(false);
	}

	// Class functions
	static fromJSON(jsonCart) {
		return new CartHive(Object.values(jsonCart.merchants));
	}

	static async get(excludes = []) {
		// TODO: cache carts in the UI for faster refresh
		if (!localCachedCartHive) {
			const resp = await window.firmly.sessionGetAllActiveCarts(excludes);
			const { carts } = await resp.data;

			localCachedCartHive = new CartHive(carts.filter((c) => c));
			localStorage?.setItem?.('fCartHive', JSON.stringify(localCachedCartHive));
		}

		return localCachedCartHive;
	}

	static async subscribe(callback) {
		// TODO: Bind to message channel only once and distribute the message across the subscribers
		bindEvent(window, 'message', (event) => {
			if (event.data?.action === 'firmly:updated:cart') {
				// Deserialize the cartHive as a class
				localCachedCartHive = CartHive.fromJSON(event.data.cartHive);
				localStorage?.setItem?.('fCartHive', JSON.stringify(localCachedCartHive));
				callback(localCachedCartHive);
			}
		});

		// Immediately call back the subscriber with current version
		const cartFromLocalStorage = localStorage?.getItem?.('fCartHive');
		if (cartFromLocalStorage) {
			callback(CartHive.fromJSON(JSON.parse(cartFromLocalStorage)));
		}

		localCachedCartHive = localCachedCartHive || (await this.get());
		callback(localCachedCartHive);

		// Internally subscribe to receive local changes (not published through messages)
		localCachedCartHive.internalSubscribe(callback);
	}

	// Instance functions
	#computeCurrencyField(fieldName) {
		return {
			value: Object.values(this.merchants).reduce((sum, c) => {
				return sum + (c[fieldName]?.value ?? 0);
			}, 0),
			currency: this.merchants[0]?.[fieldName]?.currency || DEFAULT_CURRENCY
		};
	}

	#computeTotals() {
		this.total_quantity = Object.values(this.merchants).reduce((sum, c) => {
			return sum + c.getTotalItemCount();
		}, 0);

		this.total = this.#computeCurrencyField('total');
		this.sub_total = this.#computeCurrencyField('sub_total');
		this.shipping_total = this.#computeCurrencyField('shipping_total');
		this.tax = this.#computeCurrencyField('tax');
		this.cart_discount = this.#computeCurrencyField('cart_discount');
		this.store_credit = this.#computeCurrencyField('store_credit');
	}

	async #reviewCarts(carts) {
		this.merchants = carts
			.filter((c) => c.cart_status === 'active')
			.reduce((acc, cart) => {
				acc[cart.shop_id] = cart;
				return acc;
			}, {});

		return this;
	}

	async #recompute(broadcastToAll = true) {
		this.#reviewCarts(Object.values(this.merchants));
		this.#computeTotals();

		if (this.getAllCarts().every((c) => c.shipping_info)) {
			this.shipping_info = this.getAllCarts().find((c) => c.shipping_info)?.shipping_info;
		} else {
			this.shipping_info = null;
		}

		if (this.getAllCarts().every((c) => c.billing_info)) {
			this.billing_info = this.getAllCarts().find((c) => c.billing_info)?.billing_info;
		} else {
			this.billing_info = null;
		}

		await this.dispatch(this);

		if (broadcastToAll && window !== window.top) {
			// Do not broadcast this message to the current window.
			window.top.postMessage(
				{
					action: 'firmly:updated:cart',
					cartHive: JSON.parse(JSON.stringify(this)) // TODO: Design alternative for this. message fails due to non cloneable functions
				},
				'*'
			);
		}

		return this;
	}

	async sessionTransfer(domain, transferPayload) {
		const res = await window.firmly.cartSessionTransfer(transferPayload, domain);
		if (res.status !== 200) {
			throw res.data;
		}

		const cart = res.data;
		this.merchants[cart.shop_id] = new Cart(cart);
		this.merchants[cart.shop_id].internalSubscribe(() => this.#recompute());
		return this.#recompute();
	}

	async addLineItem(domain, variantId, quantity, variantHandles) {
		// TODO: If cart already exists, there is no need to recreate Cart class.
		const res = await window.firmly.cartAddLineItem(variantId, quantity, variantHandles, domain);
		if (res.status !== 200) {
			throw res.data;
		}

		const cart = res.data;
		this.merchants[cart.shop_id] = new Cart(cart);
		this.merchants[cart.shop_id].internalSubscribe(() => this.#recompute());
		return this.#recompute();
	}

	async clear(shippingInfo) {
		await Promise.all(Object.values(this.merchants).map((c) => c.clear(shippingInfo)));
		return this.#recompute();
	}

	async setShippingInfo(shippingInfo) {
		await Promise.all(this.getAllCarts().map((c) => c.setShippingInfo(shippingInfo)));
		return this.#recompute();
	}

	getAllCarts() {
		return Object.values(this.merchants).filter((c) => c.getTotalItemCount() > 0);
	}
}
