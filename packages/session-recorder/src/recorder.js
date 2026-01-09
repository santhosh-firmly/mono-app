import { record } from 'rrweb';
import { debugLog } from './utils.js';

/**
 * @class Recorder
 * Manages rrweb recording configuration and lifecycle
 */
export class Recorder {
	/**
	 * @param {Object} config - Configuration object for recording
	 * @param {Function} onEvent - Callback for emitted events
	 */
	constructor(config, onEvent) {
		this.config = config;
		this.onEvent = onEvent;
		this.stopRecording = null;
	}

	/**
	 * Starts the rrweb recording
	 * @returns {Function} The stop function from rrweb
	 */
	start() {
		const rrwebConfig = this.#buildRrwebConfig();
		debugLog('Starting rrweb recording', { maskAll: this.config.maskAll });

		this.stopRecording = record(rrwebConfig);
		return this.stopRecording;
	}

	/**
	 * Stops the rrweb recording
	 */
	stop() {
		if (this.stopRecording) {
			this.stopRecording();
			this.stopRecording = null;
		}
	}

	/**
	 * Builds the rrweb configuration object
	 * @returns {Object} The rrweb configuration
	 */
	#buildRrwebConfig() {
		const config = {
			emit: this.onEvent,
			checkoutEveryNth: this.config.checkoutEveryNth,
			checkoutEveryNms: this.config.checkoutEveryNms,
			blockSelector: this.config.blockSelector,
			inlineStylesheet: this.config.inlineStylesheet,
			sampling: this.config.sampling
		};

		if (this.config.maskAll) {
			// Mask everything when maskAll is true
			config.maskAllInputs = true;
			config.maskTextClass = /.*/;
			config.maskTextFn = (text) => '*'.repeat(text.length);
			config.maskInputFn = (text) => '*'.repeat(text.length);
		} else {
			// Use selective masking
			config.maskAllInputs = this.config.maskAllInputs;

			// Apply the same selector to both text and input masking
			if (this.config.maskSelector) {
				config.maskTextSelector = this.config.maskSelector;
				config.maskInputSelector = this.config.maskSelector;
			}
		}

		return config;
	}
}
