/**
 * SessionRecorder - Lightweight session recording based on rrweb
 */

import { record } from 'rrweb';
import { mergeConfig } from './config.js';
import { BatchManager } from './batching.js';
import { generateSessionId, safeCallback, debugLog } from './utils.js';

export class SessionRecorder {
	constructor(userConfig = {}) {
		if (typeof window === 'undefined') {
			throw new Error('SessionRecorder requires a browser environment');
		}

		if (!userConfig.serviceUrl) {
			throw new Error('serviceUrl is required');
		}

		this.config = mergeConfig(userConfig);
		this.serviceUrl = userConfig.serviceUrl;
		this.sessionId = null;
		this.stopRecording = null;
		this.batchManager = null;
		this.isRecording = false;
	}

	start() {
		if (this.isRecording) return this.sessionId;
		if (!this.config.enabled) return null;

		this.sessionId = generateSessionId();
		this.isRecording = true;

		// Initialize batch manager
		this.batchManager = new BatchManager({
			sessionId: this.sessionId,
			batchInterval: this.config.batchInterval,
			maxBatchSize: this.config.maxBatchSize,
			maxEvents: this.config.maxEvents,
			onFlush: (events) => this._sendBatch(events, false)
		});

		// Start rrweb recording
		this.stopRecording = record({
			emit: (event) => {
				if (this.isRecording && this.batchManager) {
					this.batchManager.addEvent(event);

					// Immediately flush after full snapshot to ensure CSS is sent
					if (event.type === 2) {
						setTimeout(() => this.batchManager?.flush('snapshot'), 100);
					}
				}
			},
			checkoutEveryNth: this.config.checkoutEveryNth,
			checkoutEveryNms: this.config.checkoutEveryNms,
			maskAllInputs: this.config.maskAllInputs,
			maskInputOptions: this.config.maskInputOptions,
			blockClass: this.config.blockClass,
			ignoreClass: this.config.ignoreClass,
			inlineStylesheet: this.config.inlineStylesheet,
			sampling: this.config.sampling
		});

		this.batchManager.start();
		this._setupPageUnloadHandler();

		debugLog('Recording started', { sessionId: this.sessionId });
		return this.sessionId;
	}

	async stop() {
		if (!this.isRecording) return;

		debugLog('Stopping recording', { sessionId: this.sessionId });

		if (this.stopRecording) {
			this.stopRecording();
			this.stopRecording = null;
		}

		if (this.batchManager) {
			this.batchManager.stop();
			await this._sendFinalBatch();
		}

		this._removePageUnloadHandler();
		this.isRecording = false;
		this.sessionId = null;
		this.batchManager = null;
	}

	async _sendBatch(events, finalize = false) {
		if (events.length === 0 && !finalize) return;

		const payload = JSON.stringify({
			sessionId: this.sessionId,
			events,
			...(finalize && { finalize: true })
		});

		const payloadSize = payload.length;
		const MAX_SIZE = 120 * 1024; // 120KB (safe under 128KB Cloudflare limit)

		if (payloadSize > MAX_SIZE) {
			console.error(`Payload too large: ${payloadSize} bytes`);
			safeCallback(
				this.config.onError,
				new Error(`Payload size ${payloadSize} exceeds limit`)
			);
			return;
		}

		try {
			await fetch(`${this.serviceUrl}/api/sessions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: payload,
				keepalive: finalize
			});

			safeCallback(this.config.onBatchSent, this.sessionId, events.length, payloadSize);
			debugLog('Batch sent', { eventCount: events.length, size: payloadSize, finalize });
		} catch (error) {
			console.error('Failed to send batch:', error);
			safeCallback(this.config.onError, error);
		}
	}

	async _sendFinalBatch() {
		const events = this.batchManager?.flush('final') || [];

		// Always send finalize request (even if no events)
		await this._sendBatch(events, true);
	}

	_sendFinalBatchSync() {
		const events = this.batchManager?.flush('final') || [];
		const payload = JSON.stringify({
			sessionId: this.sessionId,
			events,
			finalize: true
		});

		// Use sendBeacon for synchronous delivery on page unload
		if (navigator.sendBeacon && payload.length < 60 * 1024) {
			const blob = new Blob([payload], { type: 'application/json' });
			navigator.sendBeacon(`${this.serviceUrl}/api/sessions`, blob);
			debugLog('Final batch sent via sendBeacon', { eventCount: events.length });
		}
	}

	_setupPageUnloadHandler() {
		this._unloadHandler = () => this._sendFinalBatchSync();
		this._visibilityHandler = () => {
			if (document.visibilityState === 'hidden') {
				this._sendFinalBatchSync();
			}
		};

		window.addEventListener('visibilitychange', this._visibilityHandler);
		window.addEventListener('pagehide', this._unloadHandler);
	}

	_removePageUnloadHandler() {
		if (this._visibilityHandler) {
			window.removeEventListener('visibilitychange', this._visibilityHandler);
			this._visibilityHandler = null;
		}
		if (this._unloadHandler) {
			window.removeEventListener('pagehide', this._unloadHandler);
			this._unloadHandler = null;
		}
	}

	getStatus() {
		return {
			isRecording: this.isRecording,
			sessionId: this.sessionId,
			...(this.batchManager && { batchStats: this.batchManager.getStats() })
		};
	}
}
