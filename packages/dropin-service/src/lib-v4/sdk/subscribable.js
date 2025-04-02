// @ts-nocheck

export class Subscribable {
	constructor() {
		Object.defineProperty(this, '_subscribers', {
			value: new Set(),
			writable: false
		});
	}

	internalSubscribe(listener) {
		this._subscribers.add(listener);
		return () => {
			// This is a dispose function to be removed as a subscriber.
			this._subscribers.delete(listener);
		};
	}

	async dispatch(message) {
		return [...this._subscribers].map((s) => s(message));
	}
}
