/**
 * Telemetry Service
 *
 * Simplified telemetry tracking with batched event queue.
 */

import { EventQueue } from '$lib/utils/event-queue.js';
import { config } from '$lib/utils/config.js';
import { setFetchErrorHandler } from '$lib/utils/browser-fetch.js';

export const EVENT_TYPE_UX = 'ux';
export const EVENT_TYPE_API = 'api';
export const EVENT_TYPE_ERROR = 'error';
export const EVENT_TYPE_SESSION = 'session';
export const EVENT_TYPE_DEVICE = 'device';

let eventOrder = 0;

const telemetryQueue = new EventQueue({
	flushDelay: 200,
	onFlush: sendEvents
});

export function track(name, eventType, data = {}) {
	if (!config?.telemetryServer) return;

	const order = ++eventOrder;
	const eventId = `${config.traceId}_${order}_${Date.now()}`;

	telemetryQueue.enqueue({
		timestamp: Date.now(),
		name,
		event_type: eventType,
		span_id: eventId,
		event_id: eventId,
		browser_id: config.browserId,
		device_id: config.deviceId,
		session_id: config.sessionId,
		trace_id: config.traceId,
		app_name: config.appName,
		app_version: config.appVersion,
		...data
	});
}

export function trackError(error, context = {}) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorStack = error instanceof Error ? error.stack : undefined;

	track(context.name || 'error', EVENT_TYPE_ERROR, {
		error: errorMessage,
		stack: errorStack,
		...context
	});
}

export function flush() {
	return telemetryQueue.flush();
}

async function sendEvents(events) {
	const body = JSON.stringify(events);

	if (typeof navigator !== 'undefined' && navigator?.sendBeacon) {
		const sent = navigator.sendBeacon(config.telemetryServer, body);
		if (sent) return;
	}

	await fetch(config.telemetryServer, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body
	});
}

setFetchErrorHandler((errorData) => {
	track('error-fetch', EVENT_TYPE_ERROR, errorData);
});
