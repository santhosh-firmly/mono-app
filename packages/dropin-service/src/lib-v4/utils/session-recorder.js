import { record } from 'rrweb';

let events = [];
let stopRecording = null;
let intervalId = null;
let currentSessionId = null;

function generateSessionId() {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Start recording user sessions with enhanced PII protection
 * @param {string} serviceUrl - URL of the session-record-service
 * @param {Object} options - Recording options
 * @param {boolean} options.enabled - Whether recording is enabled (default: true)
 * @param {number} options.batchInterval - Interval to send events in ms (default: 10000)
 * @returns {Function} Stop recording function
 */
export function startRecording(serviceUrl, options = {}) {
	const { enabled = true, batchInterval = 10000 } = options;

	if (!enabled) {
		console.log('Session recording is disabled');
		return () => {};
	}

	if (stopRecording) {
		console.warn('Recording already in progress');
		return stopRecording;
	}

	if (!serviceUrl) {
		console.error('Session recording service URL is required');
		return () => {};
	}

	events = [];
	currentSessionId = generateSessionId();

	console.log('Starting recording with sessionId:', currentSessionId);

	try {
		stopRecording = record({
			emit(event) {
				events.push(event);
			},
			checkoutEveryNth: 100,
			// Privacy protection settings
			maskAllInputs: true, // Mask all inputs by default
			maskTextSelector: '[data-sensitive]', // Additional text masking
			blockClass: 'rrweb-block', // Block entire elements from recording
			ignoreClass: 'rrweb-ignore', // Ignore specific elements
			maskInputOptions: {
				password: true, // Always mask password inputs
				email: true, // Mask email inputs
				tel: true, // Mask phone numbers
				text: true, // Mask text inputs (for PII protection)
				textarea: true, // Mask textareas
				select: true // Mask select dropdowns (may contain addresses)
			},
			// Sampling configuration
			sampling: {
				// Don't record mouse movements to reduce data size
				mousemove: false,
				mouseInteraction: {
					MouseUp: false,
					MouseDown: false,
					Click: true,
					ContextMenu: false,
					DblClick: true,
					Focus: true,
					Blur: true,
					TouchStart: false,
					TouchEnd: false
				},
				scroll: 150, // Throttle scroll events
				input: 'last' // Only record last input value (which will be masked anyway)
			}
		});

		// Send events in batches
		intervalId = setInterval(() => {
			if (events.length > 0) {
				const eventsToSend = [...events];
				events = [];

				fetch(`${serviceUrl}/api/sessions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sessionId: currentSessionId,
						events: eventsToSend
					})
				}).catch((err) => {
					console.error('Failed to send recording events:', err);
					// Don't throw - recording failures shouldn't break the app
				});
			}
		}, batchInterval);

		console.log('Session recording started');
	} catch (error) {
		console.error('Failed to start session recording:', error);
		return () => {};
	}

	// Return stop function
	return () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		if (stopRecording) {
			stopRecording();
			stopRecording = null;
		}

		// Send final batch
		if (events.length > 0) {
			fetch(`${serviceUrl}/api/sessions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionId: currentSessionId,
					events
				})
			}).catch((err) => {
				console.error('Failed to send final recording events:', err);
			});

			events = [];
		}

		currentSessionId = null;

		console.log('Session recording stopped');
	};
}

/**
 * Check if recording is currently active
 * @returns {boolean}
 */
export function isRecording() {
	return stopRecording !== null;
}
