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
				}
			},
			checkoutEveryNth: this.config.checkoutEveryNth,
			checkoutEveryNms: this.config.checkoutEveryNms,
			maskAllInputs: this.config.maskAllInputs,
			maskInputOptions: this.config.maskInputOptions,
			blockClass: this.config.blockClass,
			maskTextClass: this.config.maskTextClass,
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

		try {
			await fetch(`${this.serviceUrl}/api/sessions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: payload,
				keepalive: finalize
			});

			safeCallback(this.config.onBatchSent, this.sessionId, events.length, payload.length);
			debugLog('Batch sent', { eventCount: events.length, size: payload.length, finalize });
		} catch (error) {
			console.error('Failed to send batch:', error);
			safeCallback(this.config.onError, error);
		}
	}

	async _sendFinalBatch() {
		const events = this.batchManager?.flush('final') || [];
		await this._sendBatch(events, true);
	}

	_sendFinalBatchSync() {
		const events = this.batchManager?.flush('final') || [];
		if (!navigator.sendBeacon) return;

		const BEACON_LIMIT = 64 * 1024;
		const chunks = this._splitIntoChunks(events, BEACON_LIMIT);

		chunks.forEach((chunk, index) => {
			const isLast = index === chunks.length - 1;
			const payload = JSON.stringify({
				sessionId: this.sessionId,
				events: chunk,
				...(isLast && { finalize: true })
			});

			const blob = new Blob([payload], { type: 'application/json' });
			navigator.sendBeacon(`${this.serviceUrl}/api/sessions`, blob);
		});

		debugLog('Final batches sent via sendBeacon', {
			chunks: chunks.length,
			totalEvents: events.length
		});
	}

	_splitIntoChunks(events, maxSize) {
		if (events.length === 0) return [];

		const chunks = [];
		let currentChunk = [];

		for (const event of events) {
			const testPayload = JSON.stringify({
				sessionId: this.sessionId,
				events: [...currentChunk, event]
			});

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
