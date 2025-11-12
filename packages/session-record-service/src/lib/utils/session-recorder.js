import { record } from 'rrweb';

let events = [];
let stopRecording = null;
let intervalId = null;
let currentSessionId = null;

function generateSessionId() {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function startRecording(serviceUrl) {
	if (stopRecording) {
		console.warn('Recording already in progress');
		return stopRecording;
	}

	events = [];
	currentSessionId = generateSessionId();

	console.log('Starting recording with sessionId:', currentSessionId);

	stopRecording = record({
		emit(event) {
			events.push(event);
		},
		checkoutEveryNth: 100,
		maskAllInputs: false,
		blockClass: 'rrweb-block',
		ignoreClass: 'rrweb-ignore'
	});

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
			});
		}
	}, 10000);

	return () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		if (stopRecording) {
			stopRecording();
			stopRecording = null;
		}

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
	};
}

export function isRecording() {
	return stopRecording !== null;
}
