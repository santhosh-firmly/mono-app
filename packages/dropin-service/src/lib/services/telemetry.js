/**
 * @fileoverview Telemetry export functions for tracking user behavior and application performance.
 */

export const EVENT_TYPE_API = 'api';
export const EVENT_TYPE_UX = 'ux';
export const EVENT_TYPE_DEVICE = 'device';
export const EVENT_TYPE_SESSION = 'session';
export const EVENT_TYPE_ERROR = 'error';

let _telemetryTimeout = null;
let _telemetryQueue = [];
let _telemetryOrder = 0;

/**
 * Pushes the telemetry queue to the server.
 */
export function telemetryPush() {
	if (_telemetryQueue.length > 0) {
		telemetry(_telemetryQueue);
	}
	_telemetryQueue = [];
}

/**
 * Retrieves header properties for telemetry events.
 * @returns {object} Header properties.
 */
export function getHeaderProp() {
	const firmly = window.firmly;
	let headerProp = {
		browser_id: firmly.browserId,
		device_id: firmly.deviceId,
		session_id: firmly.sessionId,
		trace_id: firmly.traceId,
		parent_id: firmly.traceId,
		app_name: firmly.appName,
		app_version: firmly.appVersion
	};
	if (firmly.parentInfo) {
		headerProp.edge_version = firmly.parentInfo.version;
		headerProp.edge_hostname = firmly.parentInfo.hostname;
		headerProp.edge_pathname = firmly.parentInfo.pathname;
		headerProp.edge_href = firmly.parentInfo.href;
		headerProp.edge_referrer = firmly.parentInfo.referrer;
	}

	return headerProp;
}

/**
 * Generates the next event ID for telemetry events.
 * @returns {string} The next event ID.
 */
export function getNextEventId() {
	return `${window.firmly.traceId}_${_telemetryOrder.toString()}_${Date.now()}`;
}

/**
 * Enqueues a telemetry message to be sent to the server.
 * @param {object|array} message The telemetry message or an array of messages.
 */
export function telemetryEnqueue(message) {
	const headerProp = getHeaderProp();

	if (Array.isArray(message)) {
		for (const iterator of message) {
			const order = ++_telemetryOrder;
			const event_id = getNextEventId();
			_telemetryQueue.push(
				Object.assign(iterator, { order: order, span_id: event_id, event_id: event_id }, headerProp)
			);
		}
	} else {
		const order = ++_telemetryOrder;
		const event_id = getNextEventId();
		_telemetryQueue.push(
			Object.assign(message, { order: order, span_id: event_id, event_id: event_id }, headerProp)
		);
	}
	clearTimeout(_telemetryTimeout);
	_telemetryTimeout = setTimeout(telemetryPush, 200);
}

/**
 * Sends a session start telemetry event.
 */
export function telemetrySessionStart() {
	telemetryEnqueue({ timestamp: Date.now(), name: 'sessionStart', event_type: EVENT_TYPE_SESSION });
}

/**
 * Sends a device created telemetry event.
 */
export function telemetryDeviceCreated() {
	telemetryEnqueue({ timestamp: Date.now(), name: 'deviceCreated', event_type: EVENT_TYPE_DEVICE });
}

const EVENT_VIEW_PAGE = 'viewPage';

/**
 * Sends a page visit telemetry event.
 */
export function telemetryPageVisit() {
	const firmly = window.firmly;
	const headerProp = getHeaderProp();
	delete headerProp['parent_id'];

	_telemetryQueue.push(
		Object.assign(
			{
				timestamp: Date.now(),
				name: EVENT_VIEW_PAGE,
				event_type: EVENT_TYPE_UX,
				order: ++_telemetryOrder,
				span_id: firmly.traceId,
				event_id: getNextEventId()
			},
			headerProp
		)
	);
	clearTimeout(_telemetryTimeout);
	_telemetryTimeout = setTimeout(telemetryPush, 200);
}

/**
 * Sends a button click telemetry event.
 * @param {string} name The name of the button clicked.
 */
export function telemetryButtonClick(name) {
	const firmly = window.firmly;
	const headerProp = getHeaderProp();

	_telemetryQueue.push(
		Object.assign(
			{
				timestamp: Date.now(),
				name: name || 'click',
				event_type: EVENT_TYPE_UX,
				order: ++_telemetryOrder,
				span_id: firmly.traceId,
				event_id: getNextEventId()
			},
			headerProp
		)
	);
	clearTimeout(_telemetryTimeout);
	_telemetryTimeout = setTimeout(telemetryPush, 200);
}

/**
 * Sends a Visa event telemetry event.
 * @param {string} name The name of the Visa event.
 */
export function telemetryVisaEvent(name) {
	const firmly = window.firmly;
	const headerProp = getHeaderProp();

	_telemetryQueue.push(
		Object.assign(
			{
				timestamp: Date.now(),
				name: name || 'c2p event',
				event_type: EVENT_TYPE_UX,
				order: ++_telemetryOrder,
				span_id: firmly.traceId,
				event_id: getNextEventId()
			},
			headerProp
		)
	);
	clearTimeout(_telemetryTimeout);
	_telemetryTimeout = setTimeout(telemetryPush, 200);
}

/**
 * Sends a Visa API performance telemetry event.
 * @param {number} durationMs The duration of the API call in milliseconds.
 * @param {string} apiName The name of the API.
 * @param {object} apiResponse The API response.
 * @param {string} transactionId The transaction ID.
 * @param {object} additionalData Additional data to include in the event.
 */
export function telemetryVisaApiPerformance(
	durationMs,
	apiName,
	apiResponse,
	transactionId,
	additionalData
) {
	const firmly = window.firmly;
	const headerProp = getHeaderProp();
	const messageObject = Object.assign(
		{
			event_type: EVENT_TYPE_API,
			timestamp: Date.now(),
			name: apiName || 'visa sdk',
			duration_ms: durationMs,
			status: apiResponse?.status,
			order: ++_telemetryOrder,
			span_id: firmly.traceId,
			event_id: getNextEventId(),
			transaction_id: transactionId,
			correlation_id: apiResponse?.srcCorrelationId,
			...(additionalData ? { additionalData } : {})
		},
		headerProp
	);

	telemetryEnqueue(messageObject);
}

/**
 * Sends Visa error telemetry events.
 * @param {object} response The error response.
 */
export function telemetryVisaErrors(response) {
	telemetryEnqueue({
		event_type: EVENT_TYPE_ERROR,
		timestamp: Date.now(),
		name: 'error-c2p',
		status: response?.status,
		code: response?.code,
		description: response?.description,
		error: response?.error
	});
}

/**
 * Sends a telemetry message to the server.
 * @param {object|array} message The telemetry message or an array of messages.
 */
export async function telemetry(message) {
	const firmly = window.firmly;
	if (!message) {
		return;
	}
	try {
		const body = JSON.stringify(message);
		if (navigator?.sendBeacon) {
			//TODO: check the return value of the nsb.
			navigator.sendBeacon(firmly.telemetryServer, body);
		} else {
			const options = {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				body: body
			};
			fetch(firmly.telemetryServer, options);
		}
	} catch (ex) {
		console.error('telemetry error:', ex);
		// Last resort is just to post via console.
	}
}
