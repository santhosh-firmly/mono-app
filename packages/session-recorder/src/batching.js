/**
 * BatchManager - Manages event batching with hybrid flush strategy
 * Flushes based on: time OR size OR event count (whichever comes first)
 */

import { debugLog } from './utils.js';

export class BatchManager {
	constructor(config) {
		this.config = config;
		this.sessionId = config.sessionId;
		this.events = [];
		this.intervalId = null;
		this.lastFlushTime = Date.now();
	}

	start() {
		if (this.intervalId) return;

		this.lastFlushTime = Date.now();
		this.intervalId = setInterval(() => {
			if (this.events.length > 0) {
				this.flush('time');
			}
		}, this.config.batchInterval);

		debugLog('Batch manager started', { interval: this.config.batchInterval });
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	addEvent(event) {
		// Calculate payload size if we add this event
		const testPayload = JSON.stringify({
			sessionId: this.sessionId,
			events: [...this.events, event]
		});

		// Flush if adding this event would exceed limits
		if (
			this.events.length + 1 >= this.config.maxEvents ||
			testPayload.length >= this.config.maxBatchSize
		) {
			debugLog('Flushing batch (prevent overflow)', {
				eventCount: this.events.length,
				payloadSize: testPayload.length
			});
			this.flush('overflow');
		}

		this.events.push(event);
	}

	flush(reason = 'manual') {
		if (this.events.length === 0) return [];

		const eventsToFlush = [...this.events];
		this.events = [];
		this.lastFlushTime = Date.now();

		debugLog('Flushing batch', { eventCount: eventsToFlush.length, reason });

		if (typeof this.config.onFlush === 'function') {
			this.config.onFlush(eventsToFlush, reason);
		}

		return eventsToFlush;
	}

	getStats() {
		const payloadSize = JSON.stringify({
			sessionId: this.sessionId,
			events: this.events
		}).length;

		return {
			eventCount: this.events.length,
			payloadSize,
			timeSinceLastFlush: Date.now() - this.lastFlushTime
		};
	}

	getEventCount() {
		return this.events.length;
	}
}
