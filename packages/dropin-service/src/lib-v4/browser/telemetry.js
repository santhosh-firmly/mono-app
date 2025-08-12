/**
 * Simplified telemetry module following OTLP/Honeycomb best practices
 * Refactored with separation of concerns and factory pattern
 */

// Event Types
const EVENT_TYPE_API = 'api';
const EVENT_TYPE_UX = 'ux';
const EVENT_TYPE_ERROR = 'error';

// Configuration
const TELEMETRY_THROTTLE_TIME = 200;
const TRACE_ID_LENGTH = 16; // 32 hex chars = 16 bytes
const SPAN_ID_LENGTH = 8; // 16 hex chars = 8 bytes

/**
 * Creates an ID generator utility
 */
function createIdGenerator() {
	function generateId(byteLength = 16) {
		const crypto = window.crypto || window.msCrypto;
		const bytes = crypto?.getRandomValues
			? crypto.getRandomValues(new Uint8Array(byteLength))
			: Uint8Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256));

		return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
	}

	function generateTraceId() {
		return generateId(TRACE_ID_LENGTH);
	}

	function generateSpanId() {
		return generateId(SPAN_ID_LENGTH);
	}

	return {
		generateId,
		generateTraceId,
		generateSpanId
	};
}

/**
 * Creates a semaphore to prevent parallel requests
 */
function createSemaphore() {
	let ongoingRequest = null;

	async function execute(func) {
		while (ongoingRequest) {
			await ongoingRequest;
		}

		let resolvePromise;
		ongoingRequest = new Promise((resolve) => {
			resolvePromise = resolve;
		});

		try {
			return await func();
		} finally {
			resolvePromise();
			ongoingRequest = null;
		}
	}

	return {
		execute
	};
}

/**
 * Creates a trace context manager
 */
function createTraceManager(idGenerator) {
	function createTraceContext(traceId = null, parentId = null) {
		const spanId = idGenerator.generateSpanId();

		return {
			'trace.trace_id': traceId || idGenerator.generateTraceId(),
			'trace.span_id': spanId,
			'trace.parent_id': parentId || spanId,
			'trace.sampled': true
		};
	}

	function createChildSpan(parentTrace) {
		if (!parentTrace) {
			return createTraceContext();
		}

		return createTraceContext(parentTrace['trace.trace_id'], parentTrace['trace.span_id']);
	}

	return {
		createTraceContext,
		createChildSpan
	};
}

/**
 * Creates base properties manager
 */
function createPropertiesManager() {
	let telemetryOrder = 0;

	function getBaseProperties() {
		const firmly = window.firmly || {};
		const properties = {
			browser_id: firmly.browserId,
			device_id: firmly.deviceId,
			session_id: firmly.sessionId,
			app_name: firmly.appName,
			app_version: firmly.appVersion,
			timestamp: Date.now(),
			order: ++telemetryOrder
		};

		// Add parent info if available
		if (firmly.parentInfo) {
			properties.edge_version = firmly.parentInfo.version;
			properties.edge_hostname = firmly.parentInfo.hostname;
			properties.edge_pathname = firmly.parentInfo.pathname;
			properties.edge_href = firmly.parentInfo.href;
			properties.edge_referrer = firmly.parentInfo.referrer;
		}

		return properties;
	}

	return {
		getBaseProperties
	};
}

/**
 * Creates a queue manager for throttled event sending
 */
function createQueueManager(semaphore) {
	let telemetryTimeout = null;
	let telemetryQueue = [];

	async function sendEvents(events) {
		const firmly = window.firmly || {};

		if (!events?.length || !firmly.telemetryServer) {
			return;
		}

		try {
			const body = JSON.stringify(events);

			await semaphore.execute(async () => {
				if (navigator?.sendBeacon) {
					const success = navigator.sendBeacon(firmly.telemetryServer, body);
					if (!success) {
						throw new Error('Beacon failed');
					}
				} else {
					const response = await fetch(firmly.telemetryServer, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
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
		if (telemetryQueue.length > 0) {
			const eventsToSend = [...telemetryQueue];
			telemetryQueue = [];
			sendEvents(eventsToSend);
		}
	}

	function enqueueEvent(event) {
		telemetryQueue.push(event);

		clearTimeout(telemetryTimeout);
		telemetryTimeout = setTimeout(flushQueue, TELEMETRY_THROTTLE_TIME);
	}

	function flush() {
		clearTimeout(telemetryTimeout);
		flushQueue();
	}

	return {
		enqueueEvent,
		flush
	};
}

/**
 * Creates event tracker
 */
function createEventTracker(propertiesManager, traceManager, queueManager) {
	function createEvent(name, eventType, data = {}, traceContext = null) {
		try {
			const baseProperties = propertiesManager.getBaseProperties();
			const trace = traceContext || traceManager.createTraceContext();

			const event = {
				name,
				event_type: eventType,
				event_id: `${trace['trace.trace_id']}_${baseProperties.order}_${baseProperties.timestamp}`,
				...baseProperties,
				...trace,
				...data
			};

			queueManager.enqueueEvent(event);

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

	function trackUXEvent(name, data = {}, traceContext = null) {
		return createEvent(name, EVENT_TYPE_UX, data, traceContext);
	}

	function trackAPIEvent(name, data = {}, traceContext = null) {
		return createEvent(name, EVENT_TYPE_API, data, traceContext);
	}

	function trackError(error, context = {}, traceContext = null) {
		const errorData = {
			error: {
				message: error?.message || 'Unknown error',
				stack: error?.stack,
				name: error?.name
			},
			...context
		};

		return createEvent('error', EVENT_TYPE_ERROR, errorData, traceContext);
	}

	return {
		trackUXEvent,
		trackAPIEvent,
		trackError
	};
}

/**
 * Initialize telemetry system
 */
function initTelemetry() {
	const idGenerator = createIdGenerator();
	const semaphore = createSemaphore();
	const traceManager = createTraceManager(idGenerator);
	const propertiesManager = createPropertiesManager();
	const queueManager = createQueueManager(semaphore);
	const eventTracker = createEventTracker(propertiesManager, traceManager, queueManager);

	return {
		...eventTracker,
		createChildSpan: traceManager.createChildSpan,
		flush: queueManager.flush
	};
}

// Initialize and export telemetry system
const telemetry = initTelemetry();

export const { trackUXEvent, trackAPIEvent, trackError, trackUXAsync, createChildSpan, flush } =
	telemetry;

// Ensure cleanup on page unload
if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', flush);
	window.addEventListener('pagehide', flush);
}
