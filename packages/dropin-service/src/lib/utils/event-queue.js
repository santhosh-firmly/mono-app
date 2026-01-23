/**
 * Generic Event Queue
 * Manages event queueing and batched flushing with debounce.
 * Reusable for telemetry, analytics, or any batched event processing.
 */

export class EventQueue {
	/**
	 * Create an event queue
	 * @param {Object} options - Queue options
	 * @param {number} [options.flushDelay=200] - Delay in ms before auto-flush
	 * @param {Function} options.onFlush - Async callback to handle flushed events
	 */
	constructor({ flushDelay = 200, onFlush }) {
		if (typeof onFlush !== 'function') {
			throw new Error('EventQueue requires onFlush callback');
		}

		/** @type {Array<Object>} */
		this.queue = [];
		/** @type {number} */
		this.order = 0;
		/** @type {number|null} */
		this.timeout = null;
		/** @type {number} */
		this.flushDelay = flushDelay;
		/** @type {Function} */
		this.onFlush = onFlush;
	}

	/**
	 * Enqueue an event
	 * @param {Object} event - Event data
	 */
	enqueue(event) {
		const order = ++this.order;
		this.queue.push({
			...event,
			order
		});

		// Debounce flush
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => this.flush(), this.flushDelay);
	}

	/**
	 * Flush queued events immediately
	 * @returns {Promise<void>}
	 */
	async flush() {
		if (this.queue.length === 0) return;

		const events = [...this.queue];
		this.queue = [];
		clearTimeout(this.timeout);

		try {
			await this.onFlush(events);
		} catch (error) {
			console.error('EventQueue flush error:', error);
		}
	}

	/**
	 * Get current queue length
	 * @returns {number}
	 */
	get length() {
		return this.queue.length;
	}

	/**
	 * Clear queue without flushing
	 */
	clear() {
		this.queue = [];
		this.order = 0;
		clearTimeout(this.timeout);
	}
}
