/**
 * Utility functions for session recorder
 */

/**
 * Generates a unique session ID
 * Format: session_{timestamp}_{random}
 * @returns {string} Unique session identifier
 */
export function generateSessionId() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	return `session_${timestamp}_${random}`;
}

/**
 * Calculates the size of events array in bytes
 * Used to determine when to flush based on size threshold
 * @param {Array} events - Array of rrweb events
 * @returns {number} Size in bytes
 */
export function calculateEventSize(events) {
	try {
		const json = JSON.stringify(events);
		// Use TextEncoder for accurate byte size (handles UTF-8)
		const encoder = new TextEncoder();
		return encoder.encode(json).length;
	} catch (error) {
		console.error('Error calculating event size:', error);
		// Fallback to approximate size
		return JSON.stringify(events).length;
	}
}

/**
 * Checks if the browser supports required APIs
 * @returns {Object} Support status for various APIs
 */
export function checkBrowserSupport() {
	return {
		mutationObserver: typeof MutationObserver !== 'undefined',
		sendBeacon: typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function',
		fetch: typeof fetch === 'function',
		visibilityAPI: typeof document !== 'undefined' && typeof document.visibilityState !== 'undefined'
	};
}

/**
 * Safely calls a callback function
 * @param {Function|null} callback - Callback function to call
 * @param {...any} args - Arguments to pass to callback
 */
export function safeCallback(callback, ...args) {
	if (typeof callback === 'function') {
		try {
			callback(...args);
		} catch (error) {
			console.error('Error in callback:', error);
		}
	}
}

/**
 * Creates a throttled version of a function
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, delay) {
	let lastCall = 0;
	return function (...args) {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			return func.apply(this, args);
		}
	};
}

/**
 * Checks if we're running in a browser environment
 * @returns {boolean} True if in browser
 */
export function isBrowser() {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Logs a debug message if debug mode is enabled
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments to log
 */
export function debugLog(message, ...args) {
	if (typeof window !== 'undefined' && window.__FIRMLY_SESSION_RECORDER_DEBUG__) {
		console.log(`[SessionRecorder] ${message}`, ...args);
	}
}
