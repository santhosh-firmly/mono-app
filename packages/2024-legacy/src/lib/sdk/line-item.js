// @ts-nocheck

import { Subscribable } from './subscribable.js';

export class LineItem extends Subscribable {
	constructor(lineItem, domain, readOnly) {
		super();
		this.domain = domain;
		this.readOnly = readOnly;
		Object.assign(this, lineItem);
	}

	#_enforceReadOnly() {
		if (this.readOnly) {
			throw new Error('This Cart is not longer active. An order may have been placed already.');
		}
	}

	async updateQuantity(quantity) {
		this.#_enforceReadOnly();

		const previousQuantity = this.quantity;

		const resp = await window.firmly.cartUpdateSku(
			this.sku,
			quantity,
			this.variant_handles,
			this.domain
		);
		if (resp.status !== 200) {
			throw resp.data;
		}

		window.top.postMessage(
			{
				action: 'firmly:updateQuantity:end',
				args: [this.domain, this, previousQuantity, quantity]
			},
			'*'
		);

		await this.dispatch(resp.data);

		return this;
	}

	async remove() {
		return this.updateQuantity(0);
	}
}
