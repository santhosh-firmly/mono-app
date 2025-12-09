/**
 * Utility functions for session recorder
 */

export function generateSessionId() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	return `session_${timestamp}_${random}`;
}

export function safeCallback(callback, ...args) {
	if (typeof callback === 'function') {
		try {
			callback(...args);
		} catch (error) {
			console.error('Error in callback:', error);
		}
	}
}

export function debugLog(message, ...args) {
	if (typeof window !== 'undefined' && window.__FIRMLY_SESSION_RECORDER_DEBUG__) {
		console.log(`[SessionRecorder] ${message}`, ...args);
	}
}
