// Constants
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

// Utility functions
function generateRandomId(byteLength) {
	const crypto = window.crypto || window.msCrypto;
	const bytes = crypto?.getRandomValues
		? crypto.getRandomValues(new Uint8Array(byteLength))
		: Uint8Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256));

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createTraceContext(traceId = null, parentId = null) {
	const spanId = generateRandomId(CONFIG.SPAN_ID_BYTES);

	return {
		'trace.trace_id': traceId || generateRandomId(CONFIG.TRACE_ID_BYTES),
		'trace.span_id': spanId,
		'trace.parent_id': parentId || spanId,
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

// State management
const telemetryState = {
	order: 0,
	queue: [],
	timeout: null,
	ongoingRequest: null
};

// Request semaphore
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

// Event sending
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

// Core event creation
function createEvent(name, eventType, data = {}, traceContext = null) {
	try {
		const baseProperties = getBaseProperties();
		const trace = traceContext || createTraceContext();

		const event = {
			name,
			event_type: eventType,
			event_id: `${trace['trace.trace_id']}_${baseProperties.order}_${baseProperties.timestamp}`,
			...baseProperties,
			...trace,
			...data
		};

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

// Public API
export function trackUXEvent(name, data = {}, traceContext = null) {
	return createEvent(name, EVENT_TYPES.UX, data, traceContext);
}

export function trackAPIEvent(name, data = {}, traceContext = null) {
	return createEvent(name, EVENT_TYPES.API, data, traceContext);
}

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

export function flush() {
	clearTimeout(telemetryState.timeout);
	flushQueue();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', flush);
	window.addEventListener('pagehide', flush);
}
