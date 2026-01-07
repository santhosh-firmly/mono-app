import { safeCallback, debugLog } from './utils.js';

/**
 * @class Transport
 * Handles sending session recording data to the service
 */
export class Transport {
	/**
	 * @param {string} serviceUrl - The URL of the service to send data to
	 * @param {string} sessionId - The session ID
	 * @param {string|null} appName - Optional application name for metadata
	 * @param {Function} onError - Callback for errors
	 * @param {Function} onBatchSent - Callback when batch is sent
	 */
	constructor(serviceUrl, sessionId, appName, onError, onBatchSent) {
		this.serviceUrl = serviceUrl;
		this.sessionId = sessionId;
		this.appName = appName;
		this.onError = onError;
		this.onBatchSent = onBatchSent;
		this.beaconLimit = 64 * 1024;
	}

	/**
	 * Sends a batch of events to the service
	 * @param {Array} events - Array of events to send
	 * @param {boolean} [finalize=false] - Whether this is the final batch
	 * @returns {Promise<void>}
	 */
	async sendBatch(events, finalize = false) {
		if (events.length === 0 && !finalize) return;

		const payload = this.#createPayload(events, finalize);

		try {
			await fetch(`${this.serviceUrl}/api/sessions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: payload,
				keepalive: finalize
			});

			safeCallback(this.onBatchSent, this.sessionId, events.length, payload.length);
			debugLog('Batch sent', { eventCount: events.length, size: payload.length, finalize });
		} catch (error) {
			console.error('Failed to send batch:', error);
			safeCallback(this.onError, error);
		}
	}

	/**
	 * Sends the final batch synchronously using sendBeacon
	 * @param {Array} events - Array of events to send
	 */
	sendFinalBatchSync(events) {
		if (!navigator.sendBeacon || events.length === 0) return;

		const chunks = this.#splitIntoChunks(events, this.beaconLimit);

		chunks.forEach((chunk, index) => {
			const isLast = index === chunks.length - 1;
			const payload = this.#createPayload(chunk, isLast);
			const blob = new Blob([payload], { type: 'application/json' });
			navigator.sendBeacon(`${this.serviceUrl}/api/sessions`, blob);
		});

		debugLog('Final batches sent via sendBeacon', {
			chunks: chunks.length,
			totalEvents: events.length
		});
	}

	/**
	 * Creates a payload for sending
	 * @param {Array} events - Array of events
	 * @param {boolean} finalize - Whether this is the final batch
	 * @returns {string} JSON payload
	 */
	#createPayload(events, finalize) {
		return JSON.stringify({
			sessionId: this.sessionId,
			...(this.appName && { appName: this.appName }),
			events,
			...(finalize && { finalize: true })
		});
	}

	/**
	 * Splits events into chunks based on max size
	 * @param {Array} events - Array of events
	 * @param {number} maxSize - Maximum size in bytes
	 * @returns {Array<Array>} Array of event chunks
	 */
	#splitIntoChunks(events, maxSize) {
		const chunks = [];
		let currentChunk = [];

		for (const event of events) {
			const testPayload = this.#createPayload([...currentChunk, event], false);

			if (testPayload.length >= maxSize && currentChunk.length > 0) {
				chunks.push(currentChunk);
				currentChunk = [event];
			} else {
				currentChunk.push(event);
			}
		}

		if (currentChunk.length > 0) {
			chunks.push(currentChunk);
		}

		return chunks;
	}
}
