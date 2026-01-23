import { track, EVENT_TYPE_UX } from '$lib/services/telemetry.js';

const LAYOUT_TRANSITION_TIMES = {
	sidebar: 300,
	popup: 0,
	bottomsheet: 0,
	fullscreen: 0
};

/**
 * @typedef {'sidebar' | 'popup' | 'bottomsheet' | 'fullscreen'} LayoutType
 */

/**
 * @typedef {'pdp' | 'checkout' | 'error'} BuyNowMode
 */

/**
 * Buy Now state managing layout orchestration and mode transitions.
 * Handles layout type selection, transition timing, and navigation
 * between PDP, checkout, and error views.
 *
 * @property {LayoutType} layoutType - Current layout type for the widget
 * @property {number} layoutTransitionTime - Transition duration in milliseconds
 * @property {boolean} isLayoutActive - Whether the layout is currently visible
 * @property {BuyNowMode} mode - Current mode/view (pdp, checkout, or error)
 * @property {string} errorMessage - Error message to display in error mode
 * @property {string} errorCode - Error code to display in error mode
 *
 * @method setupLayout - Configures the layout type and its transition time
 * @method goToCheckout - Navigates to checkout view
 * @method goToPdp - Navigates to PDP view
 * @method setError - Sets error state with message
 * @method clearError - Clears error state and returns to PDP
 * @method close - Deactivates the layout to trigger close animation
 */
class BuyNow {
	layoutType = $state('fullscreen');
	layoutTransitionTime = $state(0);
	isLayoutActive = $state(true);
	mode = $state('pdp');
	errorMessage = $state('');
	errorCode = $state('');

	setupLayout(uiMode) {
		this.layoutType = LAYOUT_TRANSITION_TIMES[uiMode] !== undefined ? uiMode : 'fullscreen';
		this.layoutTransitionTime = LAYOUT_TRANSITION_TIMES[this.layoutType];
	}

	goToCheckout() {
		this.#setMode('checkout', 'page_checkout');
	}

	goToPdp() {
		this.#setMode('pdp', 'page_pdp');
	}

	setError(err, message = '', code = '') {
		this.errorMessage = message || (err instanceof Error ? err.message : String(err));
		this.errorCode = code;
		this.mode = 'error';
		track('page_error', EVENT_TYPE_UX, { error: this.errorMessage, code: this.errorCode });
	}

	clearError() {
		this.errorMessage = '';
		this.errorCode = '';
		if (this.mode === 'error') this.mode = 'pdp';
	}

	close() {
		this.isLayoutActive = false;
	}

	#setMode(mode, eventName) {
		this.mode = mode;
		track(eventName, EVENT_TYPE_UX);
	}
}

let instance = null;

export function initializeBuyNow(initialMode = 'checkout') {
	instance = new BuyNow();
	instance.mode = initialMode;
	return instance;
}

export function getBuyNow() {
	if (!instance) throw new Error('BuyNow not initialized');
	return instance;
}

export function resetBuyNow() {
	instance = null;
}
