/**
 * @firmly/session-recorder
 * Production-ready, GDPR-compliant session recorder for Firmly applications
 */

import { mergeConfig } from './config.js';
import { Batching } from './batching.js';
import { generateSessionId, debugLog } from './utils.js';
import { Transport } from './transport.js';
import { Page } from './page.js';
import { Recorder } from './recorder.js';

export class SessionRecorder {
	/**
	 * @param {Object} userConfig - Configuration object for the recorder
	 */
	constructor(userConfig = {}) {
		if (typeof window === 'undefined') {
			throw new Error('SessionRecorder requires a browser environment');
		}

		if (!userConfig.serviceUrl) {
			throw new Error('serviceUrl is required');
		}

		this.config = mergeConfig(userConfig);

		this.isRecording = false;
		this.sessionId = null;

		this.batchManager = null;
		this.dataSender = null;
		this.unloadHandler = null;
		this.recordingManager = null;
	}

	/**
	 * Starts the session recording
	 * @param {string} [sessionId] - Optional session ID to use (if not provided, generates a new one)
	 * @returns {string|null} The session ID if started, null if disabled
	 */
	start(sessionId) {
		if (this.isRecording) return this.sessionId;
		if (!this.config.enabled) return null;

		this.sessionId = sessionId || generateSessionId();
		this.isRecording = true;

		// Initialize components
		this.dataSender = new Transport(
			this.config.serviceUrl,
			this.sessionId,
			this.config.appName,
			this.config.onError,
			this.config.onBatchSent
		);

		this.batchManager = new Batching({
			sessionId: this.sessionId,
			batchInterval: this.config.batchInterval,
			maxBatchSize: this.config.maxBatchSize,
			maxEvents: this.config.maxEvents,
			onFlush: (events) => this.dataSender.sendBatch(events, false)
		});

		this.recordingManager = new Recorder(this.config, (event) => {
			if (this.isRecording && this.batchManager) {
				this.batchManager.addEvent(event);
			}
		});

		this.unloadHandler = new Page(() => {
			const events = this.batchManager?.flush('final') || [];
			this.dataSender.sendFinalBatchSync(events);
		});

		// Start components
		this.recordingManager.start();
		this.batchManager.start();
		this.unloadHandler.setup();

		debugLog('Recording started', { sessionId: this.sessionId });

		return this.sessionId;
	}

	/**
	 * Stops the session recording and sends final batch
	 * @returns {Promise<void>}
	 */
	async stop() {
		if (!this.isRecording) return;

		debugLog('Stopping recording', { sessionId: this.sessionId });

		this.recordingManager?.stop();
		this.batchManager?.stop();

		const events = this.batchManager?.flush('final') || [];
		await this.dataSender.sendBatch(events, true);

		this.unloadHandler?.remove();

		this.isRecording = false;
		this.sessionId = null;

		this.batchManager = null;
		this.dataSender = null;
		this.unloadHandler = null;
		this.recordingManager = null;
	}
}
