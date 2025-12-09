/**
 * SessionRecorder - Main class for recording user sessions
 * Based on rrweb with 2025 best practices
 */

import { record } from 'rrweb';
import { mergeConfig } from './config.js';
import { BatchManager } from './batching.js';
import {
	generateSessionId,
	checkBrowserSupport,
	safeCallback,
	isBrowser,
	debugLog,
	calculateEventSize
} from './utils.js';

/**
 * SessionRecorder class
 */
export class SessionRecorder {
	/**
	 * @param {Object} userConfig - User configuration
	 * @param {string} userConfig.serviceUrl - URL of the dvr-service API endpoint
	 * @param {boolean} [userConfig.enabled=true] - Enable/disable recording
	 * @param {number} [userConfig.batchInterval=10000] - Batch interval in ms
	 * @param {number} [userConfig.maxBatchSize=61440] - Max batch size (60KB)
	 * @param {number} [userConfig.maxEvents=250] - Max events before flush
	 * @param {Object} [userConfig.maskInputOptions] - Input masking options
	 * @param {Object} [userConfig.sampling] - Sampling configuration
	 * @param {Function} [userConfig.onError] - Error callback
	 * @param {Function} [userConfig.onBatchSent] - Batch sent callback
	 */
	constructor(userConfig = {}) {
		if (!isBrowser()) {
			throw new Error('SessionRecorder can only be used in browser environments');
		}

		if (!userConfig.serviceUrl) {
			throw new Error('serviceUrl is required');
		}

		// Merge user config with defaults
		this.config = mergeConfig(userConfig);
		this.serviceUrl = userConfig.serviceUrl;

		// Check browser support
		const support = checkBrowserSupport();
		if (!support.mutationObserver) {
			throw new Error('Browser does not support MutationObserver (required by rrweb)');
		}

		// State
		this.sessionId = null;
		this.stopRecording = null;
		this.batchManager = null;
		this.isRecording = false;
		this.hasSeenFullSnapshot = false;

		// Browser event handlers
		this.visibilityChangeHandler = null;
		this.beforeUnloadHandler = null;
		this.pageHideHandler = null;

		debugLog('SessionRecorder initialized', { config: this.config, support });
	}

	/**
	 * Starts recording the session
	 * @returns {string} Session ID
	 */
	start() {
		if (this.isRecording) {
			debugLog('Recording already in progress');
			return this.sessionId;
		}

		if (!this.config.enabled) {
			debugLog('Recording is disabled');
			return null;
		}

		// Generate session ID
		this.sessionId = generateSessionId();
		this.hasSeenFullSnapshot = false;
		// Set isRecording BEFORE calling record() so events emitted during initialization are captured
		this.isRecording = true;

		debugLog('Starting recording', { sessionId: this.sessionId });

		// Initialize batch manager
		this.batchManager = new BatchManager({
			sessionId: this.sessionId,
			batchInterval: this.config.batchInterval,
			maxBatchSize: this.config.maxBatchSize,
			maxEvents: this.config.maxEvents,
			onFlush: (events, reason) => this._handleFlush(events, reason, false)
		});

		// Start rrweb recording
		try {
			debugLog('Calling rrweb.record with config', {
				checkoutEveryNth: this.config.checkoutEveryNth,
				maskAllInputs: this.config.maskAllInputs,
				inlineStylesheet: this.config.inlineStylesheet
			});

			this.stopRecording = record({
				emit: (event) => {
					try {
						this._handleEvent(event);
					} catch (error) {
						console.error('Error in emit handler:', error);
					}
				},
				checkoutEveryNth: this.config.checkoutEveryNth,
				checkoutEveryNms: this.config.checkoutEveryNms,
				maskAllInputs: this.config.maskAllInputs,
				maskInputOptions: this.config.maskInputOptions,
				maskTextSelector: this.config.maskTextSelector,
				blockClass: this.config.blockClass,
				blockSelector: this.config.blockSelector,
				ignoreClass: this.config.ignoreClass,
				inlineImages: this.config.inlineImages,
				inlineStylesheet: this.config.inlineStylesheet,
				sampling: this.config.sampling,
				errorHandler: this.config.errorHandler
			});

			debugLog('rrweb.record completed');

			// Start batch manager
			this.batchManager.start();

			// Setup browser close handlers
			this._setupBrowserCloseHandlers();

			debugLog('Recording started successfully');

			return this.sessionId;
		} catch (error) {
			console.error('Error starting recording:', error);
			safeCallback(this.config.onError, error);
			this.isRecording = false;
			return null;
		}
	}

	/**
	 * Stops recording and sends final batch
	 * Uses async fetch when called programmatically (not during browser close)
	 * @returns {Promise<void>}
	 */
	async stop() {
		if (!this.isRecording) {
			debugLog('No recording in progress');
			return;
		}

		debugLog('Stopping recording', { sessionId: this.sessionId });

		// Stop rrweb recording
		if (this.stopRecording) {
			this.stopRecording();
			this.stopRecording = null;
		}

		// Stop batch manager
		if (this.batchManager) {
			this.batchManager.stop();
		}

		// Send final batch using async method (we have time here)
		await this._sendFinalBatchAsync();

		// Remove browser close handlers
		this._removeBrowserCloseHandlers();

		// Reset state
		this.isRecording = false;
		this.sessionId = null;
		this.batchManager = null;

		debugLog('Recording stopped');
	}

	/**
	 * Handles incoming rrweb events
	 * @param {Object} event - rrweb event
	 * @private
	 */
	_handleEvent(event) {
		if (!this.isRecording || !this.batchManager) {
			return;
		}

		// Log ALL events for debugging
		debugLog('Received rrweb event', {
			type: event.type,
			timestamp: event.timestamp,
			hasData: !!event.data
		});

		this.batchManager.addEvent(event);

		// Immediately flush after receiving the first full snapshot
		// Type 2 = Full snapshot (contains DOM + CSS)
		// This ensures the initial snapshot is sent immediately before any incremental changes
		if (event.type === 2 && !this.hasSeenFullSnapshot) {
			this.hasSeenFullSnapshot = true;
			debugLog('Flushing initial full snapshot immediately', {
				eventType: event.type,
				eventCount: this.batchManager.getEventCount()
			});
			// Small delay to ensure Meta event (type 4) is also captured
			setTimeout(() => {
				if (this.batchManager) {
					this.batchManager.flush('initial_snapshot');
				}
			}, 100);
		}
	}

	/**
	 * Handles batch flush
	 * @param {Array} events - Events to send
	 * @param {string} reason - Flush reason
	 * @param {boolean} finalize - Is this the final batch?
	 * @private
	 */
	async _handleFlush(events, reason, finalize = false) {
		if (events.length === 0) {
			return;
		}

		debugLog('Flushing batch', {
			eventCount: events.length,
			reason,
			finalize,
			sessionId: this.sessionId
		});

		try {
			await this._sendBatch(events, finalize);
		} catch (error) {
			console.error('Error sending batch:', error);
			safeCallback(this.config.onError, error);
		}
	}

	/**
	 * Sends a batch of events to the server
	 * Splits large payloads into smaller batches to stay under request limits
	 * @param {Array} events - Events to send
	 * @param {boolean} finalize - Is this the final batch?
	 * @private
	 */
	async _sendBatch(events, finalize = false) {
		if (events.length === 0 && !finalize) {
			return;
		}

		// Split events into chunks that fit under 120KB payload limit (Cloudflare Workers limit is 128KB)
		const MAX_CHUNK_SIZE = 120 * 1024; // 120KB (safe margin under 128KB Cloudflare limit)
		const chunks = this._splitEventsByPayloadSize(events, MAX_CHUNK_SIZE, finalize);

		// Send each chunk
		for (let i = 0; i < chunks.length; i++) {
			const isLastChunk = i === chunks.length - 1;
			await this._sendSingleBatch(chunks[i], finalize && isLastChunk);
		}
	}

	/**
	 * Sends a single batch of events
	 * @param {Array} events - Events to send
	 * @param {boolean} finalize - Is this the final batch?
	 * @private
	 */
	async _sendSingleBatch(events, finalize = false) {
		let payload = JSON.stringify({
			sessionId: this.sessionId,
			events: events,
			...(finalize && { finalize: true })
		});

		let payloadSize = payload.length;

		// Safety check: Don't send payloads over 125KB (Cloudflare Workers limit is 128KB)
		if (payloadSize > 125 * 1024) {
			console.error('Payload too large, skipping send', {
				payloadSize,
				eventCount: events.length
			});
			safeCallback(
				this.config.onError,
				new Error(`Payload size ${payloadSize} exceeds limit`)
			);
			return;
		}

		// Send the batch
		const url = `${this.serviceUrl}/api/sessions`;

		// For final batch, use sendBeacon if available and size permits (sendBeacon limit is 64KB)
		if (finalize && payloadSize <= 60 * 1024) {
			await this._sendWithBeacon(url, payload, payloadSize);
		} else {
			await this._sendWithFetch(url, payload);
		}

		// Call callback
		safeCallback(this.config.onBatchSent, this.sessionId, events.length, payloadSize);

		debugLog('Batch sent successfully', {
			eventCount: events.length,
			size: payloadSize,
			finalize
		});
	}

	/**
	 * Sends data using sendBeacon with fetch fallback
	 * @param {string} url - API endpoint
	 * @param {string} payload - JSON payload
	 * @param {number} size - Payload size in bytes
	 * @private
	 */
	async _sendWithBeacon(url, payload, size) {
		const BEACON_LIMIT = 64 * 1024; // 64KB

		// Try sendBeacon first if size permits and API is available
		if (size < BEACON_LIMIT && typeof navigator.sendBeacon === 'function') {
			const blob = new Blob([payload], { type: 'application/json' });
			const sent = navigator.sendBeacon(url, blob);

			if (sent) {
				debugLog('Sent via sendBeacon', { size });
				return;
			}

			debugLog('sendBeacon returned false, falling back to fetch');
		}

		// Fallback to fetch with keepalive
		await this._sendWithFetch(url, payload, true);
	}

	/**
	 * Sends data synchronously using sendBeacon (for browser close handlers)
	 * This method MUST be synchronous to work in unload handlers
	 * @param {Array} events - Events to send
	 * @param {boolean} finalize - Is this the final batch?
	 * @private
	 */
	_sendBeaconSync(events, finalize = false) {
		const payload = JSON.stringify({
			sessionId: this.sessionId,
			events: events,
			...(finalize && { finalize: true })
		});

		const payloadSize = payload.length;
		const BEACON_LIMIT = 64 * 1024; // 64KB

		// Safety check: Don't send payloads over 60KB (safe margin under 64KB sendBeacon limit)
		if (payloadSize > 60 * 1024) {
			console.error('Payload too large for sendBeacon, data may be lost', {
				payloadSize,
				eventCount: events.length
			});
			safeCallback(
				this.config.onError,
				new Error(`Payload size ${payloadSize} exceeds sendBeacon limit`)
			);
			return;
		}

		const url = `${this.serviceUrl}/api/sessions`;

		// Use sendBeacon if available
		if (typeof navigator.sendBeacon === 'function' && payloadSize < BEACON_LIMIT) {
			const blob = new Blob([payload], { type: 'application/json' });
			const sent = navigator.sendBeacon(url, blob);

			if (sent) {
				debugLog('Sent via sendBeacon (sync)', { size: payloadSize, finalize });
				safeCallback(this.config.onBatchSent, this.sessionId, events.length, payloadSize);
			} else {
				console.error('sendBeacon failed, data may be lost');
				safeCallback(
					this.config.onError,
					new Error('sendBeacon returned false - data may be lost')
				);
			}
		} else {
			// No sendBeacon available - data will likely be lost
			console.error('sendBeacon not available in browser close handler, data will be lost');
			safeCallback(
				this.config.onError,
				new Error('sendBeacon not available - data will be lost on page close')
			);
		}
	}

	/**
	 * Sends data using fetch API
	 * @param {string} url - API endpoint
	 * @param {string} payload - JSON payload
	 * @param {boolean} keepalive - Use keepalive flag
	 * @private
	 */
	async _sendWithFetch(url, payload, keepalive = false) {
		try {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: payload
			};

			if (keepalive) {
				options.keepalive = true;
			}

			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			debugLog('Sent via fetch', { keepalive });
		} catch (error) {
			console.error('Error sending with fetch:', error);
			throw error;
		}
	}

	/**
	 * Sends the final batch when stopping programmatically
	 * Uses async fetch with keepalive since we have time to wait
	 * @private
	 */
	async _sendFinalBatchAsync() {
		if (!this.batchManager) {
			return;
		}

		const events = this.batchManager.flush('final');

		// Always send at least one request with finalize: true
		if (events.length === 0) {
			await this._sendBatch([], true);
			return;
		}

		// Split events into chunks that fit under 120KB payload limit
		const MAX_CHUNK_SIZE = 120 * 1024; // 120KB (safe margin under 128KB Cloudflare limit)
		const chunks = this._splitEventsByPayloadSize(events, MAX_CHUNK_SIZE, true);

		// Send all chunks except the last with finalize: false
		for (let i = 0; i < chunks.length - 1; i++) {
			await this._sendBatch(chunks[i], false);
		}

		// Send the last chunk with finalize: true
		await this._sendBatch(chunks[chunks.length - 1], true);
	}

	/**
	 * Sends the final batch when browser closes
	 * Uses synchronous sendBeacon to ensure delivery before page unload
	 * NOTE: Cannot be async - browser close handlers must be synchronous
	 * @private
	 */
	_sendFinalBatch() {
		if (!this.batchManager) {
			return;
		}

		const events = this.batchManager.flush('final');

		// Always send at least one request with finalize: true
		if (events.length === 0) {
			this._sendBeaconSync([], true);
			return;
		}

		// Split events into chunks that fit under 60KB sendBeacon limit
		const MAX_CHUNK_SIZE = 60 * 1024; // 60KB (safe margin under 64KB sendBeacon limit)
		const chunks = this._splitEventsByPayloadSize(events, MAX_CHUNK_SIZE, true);

		// Send all chunks except the last with finalize: false
		for (let i = 0; i < chunks.length - 1; i++) {
			this._sendBeaconSync(chunks[i], false);
		}

		// Send the last chunk with finalize: true
		this._sendBeaconSync(chunks[chunks.length - 1], true);
	}

	/**
	 * Splits events array into chunks where each chunk's payload size is under maxSize
	 * @param {Array} events - Array of rrweb events
	 * @param {number} maxSize - Maximum payload size in bytes for each chunk
	 * @param {boolean} finalize - Whether this is for a final batch
	 * @returns {Array<Array>} Array of event chunks
	 * @private
	 */
	_splitEventsByPayloadSize(events, maxSize, finalize) {
		// If empty, return empty array (handled by caller for finalize)
		if (events.length === 0) {
			return [];
		}

		const chunks = [];
		let currentChunk = [];

		for (const event of events) {
			const testChunk = [...currentChunk, event];
			// Calculate size WITHOUT finalize flag (only last chunk will have it)
			const testPayload = JSON.stringify({
				sessionId: this.sessionId,
				events: testChunk
			});

			if (testPayload.length > maxSize && currentChunk.length > 0) {
				// Current chunk is full, save it and start new chunk
				chunks.push(currentChunk);
				currentChunk = [event];
			} else {
				// Add event to current chunk
				currentChunk = testChunk;
			}
		}

		// Add final chunk
		if (currentChunk.length > 0) {
			chunks.push(currentChunk);
		}

		return chunks.length > 0 ? chunks : [];
	}

	/**
	 * Splits events array into chunks where each chunk's JSON size is under maxSize
	 * @param {Array} events - Array of rrweb events
	 * @param {number} maxSize - Maximum size in bytes for each chunk
	 * @returns {Array<Array>} Array of event chunks
	 * @private
	 */
	_splitEventsBySize(events, maxSize) {
		const chunks = [];
		let currentChunk = [];
		let currentSize = 0;

		for (const event of events) {
			const eventSize = JSON.stringify([event]).length;
			if (currentSize + eventSize > maxSize && currentChunk.length > 0) {
				chunks.push(currentChunk);
				currentChunk = [];
				currentSize = 0;
			}
			currentChunk.push(event);
			currentSize += eventSize;
		}

		if (currentChunk.length > 0) {
			chunks.push(currentChunk);
		}

		return chunks;
	}

	/**
	 * Sets up browser close event handlers
	 * Uses triple-strategy: visibilitychange + beforeunload + pagehide
	 * @private
	 */
	_setupBrowserCloseHandlers() {
		// Primary: visibilitychange (MDN recommendation 2025)
		this.visibilityChangeHandler = () => {
			if (document.visibilityState === 'hidden') {
				debugLog('Page hidden, sending final batch');
				this._sendFinalBatch();
			}
		};
		document.addEventListener('visibilitychange', this.visibilityChangeHandler);

		// Fallback: beforeunload (for Safari bug)
		this.beforeUnloadHandler = () => {
			debugLog('Before unload, sending final batch');
			this._sendFinalBatch();
		};
		window.addEventListener('beforeunload', this.beforeUnloadHandler);

		// Additional: pagehide (better mobile support)
		this.pageHideHandler = () => {
			debugLog('Page hide, sending final batch');
			this._sendFinalBatch();
		};
		window.addEventListener('pagehide', this.pageHideHandler);

		debugLog('Browser close handlers registered');
	}

	/**
	 * Removes browser close event handlers
	 * @private
	 */
	_removeBrowserCloseHandlers() {
		if (this.visibilityChangeHandler) {
			document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
			this.visibilityChangeHandler = null;
		}

		if (this.beforeUnloadHandler) {
			window.removeEventListener('beforeunload', this.beforeUnloadHandler);
			this.beforeUnloadHandler = null;
		}

		if (this.pageHideHandler) {
			window.removeEventListener('pagehide', this.pageHideHandler);
			this.pageHideHandler = null;
		}

		debugLog('Browser close handlers removed');
	}

	/**
	 * Gets current recording status
	 * @returns {Object} Status information
	 */
	getStatus() {
		return {
			isRecording: this.isRecording,
			sessionId: this.sessionId,
			...(this.batchManager && { batchStats: this.batchManager.getStats() })
		};
	}
}
