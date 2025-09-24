/**
 * Telemetry system with distributed tracing support
 * - All events share the same trace_id per session
 * - Events without explicit parent become children of session root span
 * - Session trace_id available via getSessionTraceId() for external systems
 */

const EVENT_TYPES = {
	API: 'api',
	UX: 'ux',
	ERROR: 'error'
};

const CONFIG = {
	THROTTLE_TIME: 200,
	TRACE_ID_BYTES: 16,
	SPAN_ID_BYTES: 8
};

let sessionTracing = {
	traceId: null,
	rootSpanId: null,
	initialized: false
};

function generateRandomId(byteLength) {
	const crypto = window.crypto || window.msCrypto;
	const bytes = crypto?.getRandomValues
		? crypto.getRandomValues(new Uint8Array(byteLength))
		: Uint8Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256));

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function initializeSessionTracing() {
	if (!sessionTracing.initialized) {
		sessionTracing.traceId = generateRandomId(CONFIG.TRACE_ID_BYTES);
		sessionTracing.rootSpanId = generateRandomId(CONFIG.SPAN_ID_BYTES);
		sessionTracing.initialized = true;

		// Send session_start event as the root span
		const rootTraceContext = {
			'trace.trace_id': sessionTracing.traceId,
			'trace.span_id': sessionTracing.rootSpanId,
			'trace.parent_id': null,
			'trace.sampled': true
		};

		createEvent(
			'session_start',
			EVENT_TYPES.UX,
			{
				url: window.location.href
			},
			rootTraceContext
		);
	}
}

function createTraceContext(traceId = null, parentId = undefined) {
	initializeSessionTracing();

	const spanId = generateRandomId(CONFIG.SPAN_ID_BYTES);
	const currentTraceId = traceId || sessionTracing.traceId;

	let currentParentId;
	if (parentId === undefined) {
		currentParentId = sessionTracing.rootSpanId;
	} else {
		currentParentId = parentId;
	}

	return {
		'trace.trace_id': currentTraceId,
		'trace.span_id': spanId,
		'trace.parent_id': currentParentId,
		'trace.sampled': true
	};
}

function getBaseProperties() {
	const firmly = window.firmly || {};
	const properties = {
		browser_id: firmly.browserId,
		device_id: firmly.deviceId,
		session_id: firmly.sessionId,
		app_name: firmly.appName,
		app_version: firmly.appVersion,
		timestamp: Date.now(),
		order: ++telemetryState.order
	};

	if (firmly.parentInfo) {
		properties.edge_version = firmly.parentInfo.version;
		properties.edge_hostname = firmly.parentInfo.hostname;
		properties.edge_pathname = firmly.parentInfo.pathname;
		properties.edge_href = firmly.parentInfo.href;
		properties.edge_referrer = firmly.parentInfo.referrer;
	}

	return properties;
}

const telemetryState = {
	order: 0,
	queue: [],
	timeout: null,
	ongoingRequest: null
};

async function executeWithSemaphore(operation) {
	while (telemetryState.ongoingRequest) {
		await telemetryState.ongoingRequest;
	}

	let resolveRequest;
	telemetryState.ongoingRequest = new Promise((resolve) => {
		resolveRequest = resolve;
	});

	try {
		return await operation();
	} finally {
		resolveRequest();
		telemetryState.ongoingRequest = null;
	}
}

async function sendEvents(events) {
	const firmly = window.firmly || {};

	if (!events?.length || !firmly.telemetryServer) {
		return;
	}

	try {
		const body = JSON.stringify(events);

		await executeWithSemaphore(async () => {
			if (navigator?.sendBeacon) {
				const success = navigator.sendBeacon(firmly.telemetryServer, body);
				if (!success) {
					throw new Error('Beacon failed');
				}
			} else {
				const response = await fetch(firmly.telemetryServer, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body,
					credentials: 'include'
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
			}
		});
	} catch (error) {
		console.warn('Telemetry send failed:', error);
	}
}

function flushQueue() {
	if (telemetryState.queue.length === 0) return;

	const eventsToSend = [...telemetryState.queue];
	telemetryState.queue = [];
	sendEvents(eventsToSend);
}

function enqueueEvent(event) {
	telemetryState.queue.push(event);

	clearTimeout(telemetryState.timeout);
	telemetryState.timeout = setTimeout(flushQueue, CONFIG.THROTTLE_TIME);
}

function createEvent(name, eventType, data = {}, traceContext = null) {
	try {
		const baseProperties = getBaseProperties();
		const trace = traceContext || createTraceContext();

		const event = {
			name,
			kind: 'client',
			route: data.url,
			'service.name': baseProperties.app_name,
			duration_ms: data.duration_ms,
			'response.status': data.status,
			device_id: baseProperties.device_id,
			error: data.error_description || (data.success === false ? 'Request failed' : null),
			...baseProperties,
			...trace,
			...data
		};

		// Remove undefined fields
		Object.keys(event).forEach((key) => {
			if (event[key] === undefined) {
				delete event[key];
			}
		});

		enqueueEvent(event);

		return {
			traceId: trace['trace.trace_id'],
			spanId: trace['trace.span_id'],
			parentId: trace['trace.parent_id']
		};
	} catch (error) {
		console.warn('Telemetry event creation failed:', error);
		return null;
	}
}

/**
 * Get the current session trace ID for use in external systems
 * @returns {string} The session trace ID
 */
export function getSessionTraceId() {
	initializeSessionTracing();
	return sessionTracing.traceId;
}

/**
 * Track a user experience event (clicks, page views, form submissions)
 * @param {string} name - Event name
 * @param {object} data - Additional event data
 * @param {object} traceContext - Optional trace context for child spans
 * @returns {object} Trace context with traceId, spanId, parentId
 */
export function trackUXEvent(name, data = {}, traceContext = null) {
	return createEvent(name, EVENT_TYPES.UX, data, traceContext);
}

/**
 * Track an API/performance event
 * @param {string} name - Event name
 * @param {object} data - Additional event data (duration_ms, status, etc.)
 * @param {object|null} traceContext - Optional trace context for child spans
 * @returns {object|null} Trace context with traceId, spanId, parentId
 */
export function trackAPIEvent(name, data = {}, traceContext = null) {
	return createEvent(name, EVENT_TYPES.API, data, traceContext);
}

/**
 * Track an error event
 * @param {Error} error - Error object
 * @param {object} context - Additional error context
 * @param {object|null} traceContext - Optional trace context for child spans
 * @returns {object|null} Trace context with traceId, spanId, parentId
 */
export function trackError(error, context = {}, traceContext = null) {
	const errorData = {
		error: {
			message: error?.message || 'Unknown error',
			stack: error?.stack,
			name: error?.name
		},
		...context
	};

	return createEvent('error', EVENT_TYPES.ERROR, errorData, traceContext);
}

/**
 * Measures the duration of an async operation and tracks the result as a telemetry API event.
 * @param {Function} func - The async function to execute and measure.
 * @param {string} apiName - Name of the operation for telemetry.
 * @param {Object} [additionalData] - Extra data to include in telemetry.
 * @param {Function} trackEvent - Telemetry tracking function (signature: (name, data) => void).
 * @returns {Promise<*>} The result of the async function.
 */
export async function trackPerformance(func, apiName, additionalData, trackEvent) {
	const startTime = Date.now();
	let response;
	let error = null;
	try {
		response = await func();
		return response;
	} catch (e) {
		error = e;
		throw e;
	} finally {
		const endTime = Date.now();
		const durationMs = endTime - startTime;
		if (typeof trackEvent === 'function') {
			trackEvent(apiName, {
				duration_ms: durationMs,
				'response.status': response?.status || (error ? 'error' : 'success'),
				success: !error,
				error: error?.message,
				...(additionalData ? additionalData : {})
			});
		}
	}
}

function flush() {
	clearTimeout(telemetryState.timeout);
	flushQueue();
}

if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', flush);
	window.addEventListener('pagehide', flush);
}
