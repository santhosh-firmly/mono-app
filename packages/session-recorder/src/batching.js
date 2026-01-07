import { debugLog } from './utils.js';

/**
 * @class Batching
 * Manages event batching with hybrid flush strategy (time, size, or count)
 */
export class Batching {
	/**
	 * Creates a new BatchManager instance
	 * @param {Object} config - Configuration object
	 * @param {string} config.sessionId - The session ID for this batch manager
	 * @param {number} config.batchInterval - Time interval in ms for automatic flushing
	 * @param {number} config.maxBatchSize - Maximum batch size in bytes
	 * @param {number} config.maxEvents - Maximum number of events per batch
	 * @param {Function} config.onFlush - Callback function called when batch is flushed
	 */
	constructor(config) {
		this.config = config;
		this.sessionId = config.sessionId;
		this.events = [];
		this.intervalId = null;
		this.lastFlushTime = Date.now();
	}

	/**
	 * Starts the batch manager with automatic flushing
	 * @returns {void}
	 */
	start() {
		if (this.intervalId) {
			debugLog('Batch manager already started');
			return;
		}

		this.lastFlushTime = Date.now();
		this.intervalId = setInterval(() => {
			if (this.events.length > 0) {
				this.flush('time');
			}
		}, this.config.batchInterval);

		debugLog('Batch manager started', { interval: this.config.batchInterval });
	}

	/**
	 * Stops the batch manager and clears the automatic flush timer
	 * @returns {void}
	 */
	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			debugLog('Batch manager stopped');
		}
	}

	/**
	 * Adds an event to the current batch and checks if flush limits are reached
	 * @param {Object} event - The event to add to the batch
	 * @returns {void}
	 */
	addEvent(event) {
		this.events.push(event);

		// Check if any flush limits are exceeded
		// Calculate payload size once and reuse it to avoid redundant JSON.stringify calls
		const payloadSize = this.#getPayloadSize();
		if (this.#shouldFlush(payloadSize)) {
			const reason = this.#getFlushReason(payloadSize);
			debugLog('Flushing batch (limit reached)', {
				eventCount: this.events.length,
				payloadSize,
				reason
			});
			this.flush(reason);
		}
	}

	/**
	 * Flushes the current batch of events
	 * @param {string} [reason='manual'] - Reason for flushing (time, size, count, manual)
	 * @returns {Array} Array of events that were flushed
	 */
	flush(reason = 'manual') {
		if (this.events.length === 0) {
			return [];
		}

		const eventsToFlush = [...this.events];
		this.events = [];
		this.lastFlushTime = Date.now();

		debugLog('Flushing batch', { eventCount: eventsToFlush.length, reason });

		if (typeof this.config.onFlush === 'function') {
			this.config.onFlush(eventsToFlush, reason);
		}

		return eventsToFlush;
	}

	/**
	 * Gets statistics about the current batch
	 * @returns {Object} Statistics object
	 * @returns {number} .eventCount - Number of events in current batch
	 * @returns {number} .payloadSize - Estimated payload size in bytes
	 * @returns {number} .timeSinceLastFlush - Time in ms since last flush
	 */
	getStats() {
		return {
			eventCount: this.events.length,
			payloadSize: this.#getPayloadSize(),
			timeSinceLastFlush: Date.now() - this.lastFlushTime
		};
	}

	/**
	 * Checks if the batch should be flushed based on configured limits
	 * @param {number} payloadSize - Pre-calculated payload size to avoid redundant JSON.stringify
	 * @returns {boolean} True if any limit is exceeded
	 * @private
	 */
	#shouldFlush(payloadSize) {
		return (
			this.events.length >= this.config.maxEvents || payloadSize >= this.config.maxBatchSize
		);
	}

	/**
	 * Determines the reason for flushing based on which limit was exceeded
	 * @param {number} payloadSize - Pre-calculated payload size to avoid redundant JSON.stringify
	 * @returns {string} The flush reason ('count', 'size', or 'unknown')
	 * @private
	 */
	#getFlushReason(payloadSize) {
		if (this.events.length >= this.config.maxEvents) {
			return 'count';
		}
		if (payloadSize >= this.config.maxBatchSize) {
			return 'size';
		}
		return 'unknown';
	}

	/**
	 * Calculates the estimated payload size for the current events
	 * @returns {number} Payload size in bytes
	 * @private
	 */
	#getPayloadSize() {
		return JSON.stringify({
			sessionId: this.sessionId,
			events: this.events
		}).length;
	}
}
