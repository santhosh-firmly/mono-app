/**
 * Hybrid batching strategy for session events
 * Flushes events based on: time OR size OR event count (whichever comes first)
 */

import { calculateEventSize, debugLog } from './utils.js';

/**
 * Manages event batching with hybrid strategy
 */
export class BatchManager {
	/**
	 * @param {Object} config - Batching configuration
	 * @param {string} config.sessionId - Session ID for payload calculation
	 * @param {number} config.batchInterval - Time interval in ms (default: 10000)
	 * @param {number} config.maxBatchSize - Max size in bytes (default: 61440 = 60KB)
	 * @param {number} config.maxEvents - Max event count (default: 250)
	 * @param {Function} config.onFlush - Callback when batch should be flushed
	 */
	constructor(config) {
		this.config = config;
		this.sessionId = config.sessionId;
		this.events = [];
		this.intervalId = null;
		this.lastFlushTime = Date.now();
	}

	/**
	 * Starts the time-based batching interval
	 */
	start() {
		if (this.intervalId) {
			return; // Already started
		}

		this.lastFlushTime = Date.now();
		this.intervalId = setInterval(() => {
			if (this.events.length > 0) {
				debugLog('Flushing batch (time-based)', {
					eventCount: this.events.length,
					timeSinceLastFlush: Date.now() - this.lastFlushTime
				});
				this.flush('time');
			}
		}, this.config.batchInterval);

		debugLog('Batch manager started', { interval: this.config.batchInterval });
	}

	/**
	 * Stops the batching interval
	 */
	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			debugLog('Batch manager stopped');
		}
	}

	/**
	 * Adds an event to the batch
	 * Checks if flush is needed based on size or count before adding to prevent oversized batches
	 * Calculates actual payload size including wrapper {sessionId, events}
	 * @param {Object} event - rrweb event
	 */
	addEvent(event) {
		// Calculate the full payload size if we add this event
		// This includes the wrapper structure: {sessionId, events: [...]}
		const testPayload = JSON.stringify({
			sessionId: this.sessionId,
			events: [...this.events, event]
		});
		const testPayloadSize = testPayload.length;

		// Check if adding this event would exceed limits
		if (
			this.events.length + 1 >= this.config.maxEvents ||
			testPayloadSize >= this.config.maxBatchSize
		) {
			const currentPayloadSize = JSON.stringify({
				sessionId: this.sessionId,
				events: this.events
			}).length;

			debugLog('Flushing batch (prevent overflow)', {
				eventCount: this.events.length,
				currentPayloadSize,
				testPayloadSize,
				maxEvents: this.config.maxEvents,
				maxSize: this.config.maxBatchSize
			});
			this.flush('prevent_overflow');
		}

		this.events.push(event);
	}

	/**
	 * Flushes the current batch
	 * @param {string} reason - Reason for flush (time, size, count, manual)
	 * @returns {Array} Events that were flushed
	 */
	flush(reason = 'manual') {
		if (this.events.length === 0) {
			return [];
		}

		const eventsToFlush = [...this.events];
		this.events = [];
		this.lastFlushTime = Date.now();

		// Call the flush callback
		if (typeof this.config.onFlush === 'function') {
			this.config.onFlush(eventsToFlush, reason);
		}

		return eventsToFlush;
	}

	/**
	 * Gets current batch stats
	 * @returns {Object} Batch statistics
	 */
	getStats() {
		return {
			eventCount: this.events.length,
			size: calculateEventSize(this.events),
			timeSinceLastFlush: Date.now() - this.lastFlushTime
		};
	}

	/**
	 * Checks if batch should be flushed
	 * @returns {Object} Status object with should flush and reason
	 */
	shouldFlush() {
		if (this.events.length === 0) {
			return { should: false, reason: null };
		}

		// Check event count
		if (this.events.length >= this.config.maxEvents) {
			return { should: true, reason: 'count' };
		}

		// Check size
		const currentSize = calculateEventSize(this.events);
		if (currentSize >= this.config.maxBatchSize) {
			return { should: true, reason: 'size' };
		}

		// Check time
		const timeSinceFlush = Date.now() - this.lastFlushTime;
		if (timeSinceFlush >= this.config.batchInterval) {
			return { should: true, reason: 'time' };
		}

		return { should: false, reason: null };
	}

	/**
	 * Clears all events without flushing
	 */
	clear() {
		this.events = [];
		debugLog('Batch cleared');
	}

	/**
	 * Gets the current event count
	 * @returns {number} Number of events in buffer
	 */
	getEventCount() {
		return this.events.length;
	}
}
