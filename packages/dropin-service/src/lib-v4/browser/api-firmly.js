// @ts-nocheck

import { platformsToMakeCartHealthCheck } from './api-config';
import { postUpdateCart } from './cross';
import { importJWK, CompactEncrypt } from 'foundation/auth/ext-jose.js';

//#region Session Storage

// Session Storage checks
function isStorageAvailable(type) {
	let storage;
	try {
		storage = window[type];
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch (e) {
		return (
			e instanceof DOMException &&
			// everything except Firefox
			(e.code === 22 ||
				// Firefox
				e.code === 1014 ||
				// test name field too, because code might not be present
				// everything except Firefox
				e.name === 'QuotaExceededError' ||
				// Firefox
				e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage &&
			storage.length !== 0
		);
	}
}

class InMemory {
	constructor() {
		this.local = {};
	}

	getItem(key) {
		return this.local[key];
	}
	setItem(key, value) {
		this.local[key] = value;
	}
	removeItem(key) {
		delete this.local[key];
	}
	clear() {
		this.local = {};
	}
}

let sessionStorage = new InMemory();
let localStorage = new InMemory();

let currentBrowserSession;

//#endregion

//#region Telemetry

let cartHealthCheckTimers = {};

/**
 * Ping the cart, if necessary, to prevent it from being deleted by the merchant due to inactivity
 * TODO: Send event to backend to inform that we are making a health-check
 * @param {*} platform
 * @param {*} domain
 * @param {*} minutes
 */
function createOrResetCartHealtCheckTimer(platform, domain, minutes = 15) {
	if (platformsToMakeCartHealthCheck.includes(platform)) {
		clearTimeout(cartHealthCheckTimers[domain]);

		cartHealthCheckTimers[domain] = setTimeout(async () => {
			const cartResponse = await cartGetCart(domain, true);
			if (cartResponse.status == 200) {
				createOrResetCartHealtCheckTimer(platform, domain, minutes);
			}
		}, minutes * 60000);
	}
}

const BROWSER_ID = 'FLDID';
function getBrowserId() {
	const value = localStorage.getItem(BROWSER_ID);
	if (value) {
		return value;
	}
	return null;
}

function setBrowserId(value) {
	localStorage.setItem(BROWSER_ID, value);
}

function initBrowserId() {
	let id = getBrowserId();
	if (!id) {
		id = 'B' + getRandomId();
		setBrowserId(id);
	}

	return id;
}

async function telemetry(message) {
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

const TELEMETRY_THROTTLE_TIME = 200;
let _telemetryTimeout = null;
let _telemetryQueue = [];
let _telemetryOrder = 0;

function telemetryPush() {
	if (_telemetryQueue.length > 0) {
		telemetry(_telemetryQueue);
	}
	_telemetryQueue = [];
}

function getHeaderProp() {
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

	const sessionParentUtm = getSessionParentUTM();
	if (sessionParentUtm) {
		headerProp.sess = sessionParentUtm;
	}
	return headerProp;
}

function getNextEventId() {
	return `${window.firmly.traceId}_${_telemetryOrder.toString()}_${Date.now()}`;
}
function telemetryEnqueue(message) {
	const headerProp = getHeaderProp();

	if (Array.isArray(message)) {
		for (const iterator of message) {
			const order = ++_telemetryOrder;
			const event_id = getNextEventId();
			_telemetryQueue.push(
				Object.assign(
					iterator,
					{ order: order, span_id: event_id, event_id: event_id },
					headerProp
				)
			);
		}
	} else {
		const order = ++_telemetryOrder;
		const event_id = getNextEventId();
		_telemetryQueue.push(
			Object.assign(
				message,
				{ order: order, span_id: event_id, event_id: event_id },
				headerProp
			)
		);
	}
	clearTimeout(_telemetryTimeout);
	_telemetryTimeout = setTimeout(telemetryPush, TELEMETRY_THROTTLE_TIME);
}

function telemetrySessionStart() {
	telemetryEnqueue({
		timestamp: Date.now(),
		name: 'sessionStart',
		event_type: EVENT_TYPE_SESSION
	});
}

function telemetryDeviceCreated() {
	telemetryEnqueue({
		timestamp: Date.now(),
		name: 'deviceCreated',
		event_type: EVENT_TYPE_DEVICE
	});
}

const EVENT_VIEW_PAGE = 'viewPage';

function telemetryPageVisit() {
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
	_telemetryTimeout = setTimeout(telemetryPush, TELEMETRY_THROTTLE_TIME);
}

function telemetryButtonClick(name) {
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
	_telemetryTimeout = setTimeout(telemetryPush, TELEMETRY_THROTTLE_TIME);
}

function telemetryVisaEvent(name) {
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
	_telemetryTimeout = setTimeout(telemetryPush, TELEMETRY_THROTTLE_TIME);
}

function telemetryVisaApiPerformance(
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

function telemetryVisaErrors(response) {
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

const EVENT_TYPE_API = 'api';
const EVENT_TYPE_UX = 'ux';
const EVENT_TYPE_DEVICE = 'device';
const EVENT_TYPE_SESSION = 'session';
const EVENT_TYPE_ERROR = 'error';
//#endregion

//#region PerformanceObserver.
async function performanceInit() {
	try {
		const po = new PerformanceObserver((list) => {
			const firmly = window.firmly;
			const exceededList = [];
			for (const entry of list.getEntries()) {
				// Log the entry and all associated details.
				if (
					entry.initiatorType == 'fetch' &&
					!entry.name.includes(firmly.telemetryServer) &&
					(entry.name.includes(firmly.apiServer) || entry.name.includes(firmly.ccServer))
				) {
					// console.log(entry);
					const message = {
						event_type: EVENT_TYPE_API,
						timestamp: performance.timeOrigin + entry.startTime,
						name: `api-${entry.initiatorType}`,
						url: entry.name,
						duration_ms: entry.duration,
						redirect: entry.redirectEnd - entry.redirectStart,
						dns: entry.domainLookupEnd - entry.domainLookupStart,
						inital_connection: entry.connectEnd - entry.connectStart,
						ssl:
							entry.secureConnectionStart > 0
								? entry.connectEnd - entry.secureConnectionStart
								: 0,
						content_download: entry.responseEnd - entry.responseStart,
						stalled: entry.domainLookupStart - entry.fetchStart,
						request_sent: entry.requestStart - entry.connectEnd,
						waiting: entry.responseStart - entry.requestStart,
						decoded_body_size: entry.decodedBodySize,
						encoded_body_size: entry.encodedBodySize,
						transfer_size: entry.transferSize,
						status: entry.responseStatus,
						server_timing: entry.serverTiming,
						entry_type: entry.constructor.name,
						entry_keys: Object.keys(entry.toJSON())
					};
					if (entry.responseStatus > 399) {
						message.error = 'apiError';
					}
					exceededList.push(message);
				}
			}
			if (exceededList.length > 0) {
				telemetryEnqueue(exceededList);
			}
		});

		po.observe({ type: 'resource', buffered: true });
	} catch (e) {
		// Do nothing if the browser doesn't support this API.
		console.log('po exception:', e);
	}
}
//#endregion

//#region MutationObserver
const FOBS = 'fobs';

function enqueueFobNodes(nodes, eventName) {
	const messages = [];
	for (const iterator of nodes) {
		if (iterator.attributes && iterator.attributes[FOBS] && iterator.id) {
			let msg = {
				event_type: EVENT_TYPE_UX,
				timestamp: Date.now(),
				event_name: eventName,
				name: iterator.id
			};
			if (eventName == EVENT_VIEW_SHOWN) {
				iterator.attributes[FOBS].value = Date.now();
			} else if (eventName == EVENT_VIEW_REMOVED) {
				const ts = parseInt(iterator.attributes[FOBS].value);
				if (ts) {
					msg.event_start_timestamp = msg.ts;
					msg.duration_ms = Date.now() - ts;
				}
			}
			messages.push(msg);
		}
	}
	if (messages.length > 0) {
		telemetryEnqueue(messages);
	}
	return messages;
}

const EVENT_VIEW_SHOWN = 'viewShown';
const EVENT_VIEW_REMOVED = 'viewRemoved';

function moListener(mutationList) {
	for (const mutation of mutationList) {
		//const target = mutation.target;
		if (mutation.type === 'childList') {
			//console.log("node inspect:", mutation);
			if (mutation.removedNodes && mutation.removedNodes.length > 0) {
				enqueueFobNodes(mutation.removedNodes, EVENT_VIEW_REMOVED);
			} else if (mutation.addedNodes && mutation.addedNodes.length > 0) {
				enqueueFobNodes(mutation.addedNodes, EVENT_VIEW_SHOWN);
			}
		} else if (mutation.type === 'attributes') {
			/*
			console.log(`The ${mutation.attributeName} attribute was modified.`, mutation);
			if (target && target.attributes && target.attributes[FOBS]) {
				console.log(`The ${mutation.attributeName} attribute was modified.`, target.id, mutation);
			}*/
		}
	}
}

function mutationInit() {
	try {
		const node = document.getElementById('sveltebody');

		if (node) {
			const config = { attributes: true, childList: true, subtree: true };
			const observer = new MutationObserver(moListener);

			observer.observe(node, config);
		}
	} catch (e) {
		// Do nothing if the browser doesn't support this API.
		console.log('mo exception:', e);
	}
}

//#endregion

//#region Browser fetch

function handleFetchError(err) {
	return new Response(
		JSON.stringify({
			code: 460,
			error: 'NetworkError',
			description: 'Network error occurred.',
			errorString: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
		}),
		{ status: 460 }
	);
}

const defaultOptions = {
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	},
	method: 'GET'
};

let ongoingRequest;

// Do not allow the UI to call firmly services in parallel.
// Firmly services are not transactional and do not control parallel access by itself.
async function semaphore(func) {
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

async function browserFetch(url, options = defaultOptions) {
	const mergedOptions = Object.assign(options, {
		credentials: 'include'
	});
	const res = await semaphore(() => fetch(url, mergedOptions).catch(handleFetchError));
	let ret = { status: res.status };
	try {
		ret.data = await res.json();
	} catch (e) {
		/* empty */
	}

	if (res.status != 200) {
		try {
			const tempData = ret.data;
			telemetryEnqueue({
				event_type: EVENT_TYPE_ERROR,
				timestamp: Date.now(),
				name: 'error-fetch',
				url: url,
				method: options.method,
				status: ret.status,
				code: tempData?.code,
				description: tempData?.description,
				error: tempData?.error,
				error_string: tempData.errorString,
				res_headers: Object.fromEntries(res.headers)
			});
		} catch (ex) {
			/* empty */
		}
	}

	return ret;
}

//#endregion

//#region Crypto Encryption
let CRYPTO;

function cryptoConcat(arrays) {
	// Get the total length of all arrays.
	const length = arrays.reduce((sum, item) => sum + item.byteLength, 0);
	const typedArrays = arrays.map((e) => new Uint8Array(e));

	// Create a new array with total length and merge all source arrays.
	const result = new Uint8Array(length);
	let offset = 0;
	typedArrays.forEach((item) => {
		result.set(item, offset);
		offset += item.byteLength;
	});

	return result;
}

async function gcmDataEncrypt(plain, key, iv) {
	const data = await CRYPTO.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);

	const authTagOffset = data.byteLength - 16;

	return {
		data: data.slice(0, authTagOffset),
		authTag: data.slice(authTagOffset)
	};
}

async function getRSAKey(jwkKey) {
	const version = jwkKey['kid'];
	const publicKey = await CRYPTO.subtle.importKey(
		'jwk',
		jwkKey,
		{ name: 'RSA-OAEP', hash: 'SHA-1' },
		true,
		['encrypt']
	);
	return { publicKey, version };
}

async function importJWKKey(jwkKey) {
	try {
		return await importJWK(jwkKey, 'RSA-OAEP-256');
	} catch (error) {
		console.error('Error importing JWK:', error);
		throw new Error(`Failed to import JWK: ${error.message}`);
	}
}

async function encryptJWEPayloadWithKey(payload, publicKey, options = {}) {
	try {
		// Default encryption options
		const { alg = 'RSA-OAEP-256', enc = 'A256GCM', kid } = options;

		// Create the JWE encryption configuration
		const jweConfig = {
			alg,
			enc
		};

		// Add key ID to header if provided
		if (kid) {
			jweConfig.kid = kid;
		}

		// Encrypt the payload
		const jwe = new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
			.setProtectedHeader(jweConfig)
			.encrypt(publicKey);

		return jwe;
	} catch (error) {
		console.error('Error encrypting JWE payload:', error);
		throw new Error(`Failed to encrypt JWE payload: ${error.message}`);
	}
}

async function gcmEncrypt(inputData) {
	try {
		const firmly = window.firmly;
		const encoder = new TextEncoder();
		const encodedData = encoder.encode(
			typeof inputData === 'string' ? inputData : JSON.stringify(inputData)
		);
		const { publicKey, version } = firmly.paymentRSAKey;

		// Generate a new AESGCM Key for encrypting the payload.
		const aesgcmKey = await CRYPTO.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
			'encrypt',
			'decrypt'
		]);
		const rawAesgcmKey = await CRYPTO.subtle.exportKey('raw', aesgcmKey);

		const iv = CRYPTO.getRandomValues(new Uint8Array(16));

		// Encrypt the data.
		const { data, authTag } = await gcmDataEncrypt(encodedData, aesgcmKey, iv);

		// Encrypt the meta data using the incoming public key.
		const b64Encoded = await CRYPTO.subtle.encrypt(
			{ name: 'RSA-OAEP', hash: 'SHA-1' },
			publicKey,
			cryptoConcat([rawAesgcmKey, iv, authTag])
		);

		const b64Encrypted = btoa(String.fromCharCode.apply(null, new Uint8Array(b64Encoded)));

		return {
			data: btoa(String.fromCharCode.apply(null, new Uint8Array(data))),
			metadata: `${version}|${b64Encrypted}`
		};
	} catch (e) {
		console.error('');
		return null;
	}
}

async function rsaEncrypt(inputData) {
	try {
		const firmly = window.firmly;
		const { publicKey, version } = firmly.paymentRSAKey;
		// Encrypt the meta data using the public key.
		const plain = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);
		const enc = await crypto.subtle.encrypt(
			{ name: 'RSA-OAEP', hash: 'SHA-1' },
			publicKey,
			Uint8Array.from(new TextEncoder().encode(plain))
		);
		const b64Enc = btoa(String.fromCharCode.apply(null, new Uint8Array(enc)));
		return `${version}|${b64Enc}`;
	} catch (e) {
		console.error(e);
		return null;
	}
}

//#endregion

//#region Payment API functions

const PAYMENT_KEY = 'FPKEY';
function getPaymentKey() {
	const value = sessionStorage.getItem(PAYMENT_KEY);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

function setPaymentKey(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(PAYMENT_KEY, js);
}

const CC_SERVER = 'FPS';
function getCCServer() {
	const value = sessionStorage.getItem(CC_SERVER);
	if (value) {
		return value;
	}
	return null;
}

function setCCServer(value) {
	sessionStorage.setItem(CC_SERVER, value);
}

function clearPaymentSession() {
	sessionStorage.removeItem(CC_SERVER);
	sessionStorage.removeItem(PAYMENT_KEY);
}

function getCCUrl(suffix) {
	return `${window.firmly.ccServer}/api/v1/payment/${suffix}`;
}

function getCCUrlV2(suffix) {
	return `${window.firmly.ccServer}/api/v2/payment/${suffix}`;
}

function getCCUrlV3(suffix) {
	return `${window.firmly.ccServer}/api/v3/payment/${suffix}`;
}

function getPaymentHeaders() {
	const ret = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return ret;
}

async function paymentInitialize(ccServer) {
	const firmly = window.firmly;

	if (!firmly.paymentRSAKey) {
		firmly.ccServer = ccServer;
		if (ccServer != getCCServer()) {
			//Different environment. Reset.
			clearPaymentSession();
			setCCServer(ccServer);
		}

		let paymentKey = getPaymentKey();
		if (!paymentKey) {
			let pay = await browserFetch(`${ccServer}/api/v1/payment/key`);
			if (pay.status == 200) {
				setPaymentKey(pay.data);
				paymentKey = pay.data;
			}
		}

		if (paymentKey) {
			firmly.paymentRSAKey = await getRSAKey(paymentKey);
			firmly.paymentJWKKey = paymentKey;
		}
	}
}

async function paymentCreditCardTokenize(paymentInfo, paymentHandle) {
	const body = await gcmEncrypt(paymentInfo);
	body.handle = paymentHandle;

	const headers = getPaymentHeaders();
	const res = await browserFetch(getCCUrl('tokenize'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

// eslint-disable-next-line no-unused-vars
async function paymentCreditCardTokenizeV2(paymentInfo, paymentHandle) {
	const body = await gcmEncrypt(paymentInfo);
	body.handle = paymentHandle;

	const headers = getPaymentHeaders();
	const res = await browserFetch(getCCUrlV2('tokenize'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}
//#endregion

//#region Browser Session API functions

const BROWSER_SESSION = 'FBS';
function getBrowserSession() {
	const lbs = localStorage.getItem(BROWSER_SESSION);
	let lbj = null;
	if (lbs) {
		lbj = JSON.parse(lbs);
	}
	return currentBrowserSession || lbj || null;
}

/**
 * Set browser session both on local storage and locally (in case local storage or cookies are blocked)
 * @param {*} browserSession
 */
function setBrowserSession(browserSession) {
	currentBrowserSession = browserSession;
	const stringifiedBrowserSession = JSON.stringify(browserSession);
	localStorage.setItem(BROWSER_SESSION, stringifiedBrowserSession);
}

const SESSION_ID = 'FRSID';
function getSessionId() {
	const value = sessionStorage.getItem(SESSION_ID);
	if (value) {
		return value;
	}
	return null;
}

function setSessionId(value) {
	sessionStorage.setItem(SESSION_ID, value);
}

function initSessionId() {
	let id = getSessionId();
	if (!id) {
		id = 's' + getRandomId();
		setSessionId(id);
		window.firmly.isNewSessionId = true;
	} else {
		window.firmly.isNewSessionId = false;
	}

	return id;
}

// The static Date.now() method returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
function getSecondsSinceEpoch() {
	return ~~(Date.now() / 1000);
}

async function fetchBrowserSession() {
	const firmly = window.firmly;

	const requestOptions = {
		method: 'POST',
		headers: {
			'x-firmly-app-id': firmly.appId,
			'Content-type': 'application/json'
		}
	};

	const accessToken = currentBrowserSession?.access_token;

	if (accessToken) {
		requestOptions.headers['Content-Type'] = 'application/json';
		requestOptions.body = JSON.stringify({
			access_token: accessToken
		});
	}

	const ret = await browserFetch(`${firmly.apiServer}/api/v1/browser-session`, requestOptions);

	if (ret.status == 200) {
		setBrowserSession(ret.data);
		firmly.deviceId = ret.data.device_id;
		if (ret.data.device_created) {
			telemetryDeviceCreated();
		}
		return ret.data;
	}

	return null;
}

async function sessionGetAllActiveCarts(excludes = []) {
	const headers = await getHeaders();
	return browserFetch(
		`${window.firmly.apiServer}/api/v1/carts/active?excludes=${excludes.join(',')}`,
		{
			...headers,
			method: 'GET'
		}
	);
}

async function getApiAccessToken() {
	let session = getBrowserSession();
	if (!session || session.expires - 300 <= getSecondsSinceEpoch()) {
		session = await fetchBrowserSession();
	}

	if (session) {
		return session.access_token;
	}
	return null;
}

function getDeviceId() {
	let session = getBrowserSession();
	if (session) {
		return session.device_id;
	}
	return null;
}

export async function initialize(appId, apiServer, domain = null) {
	const firmly = window.firmly;
	if (firmly.appId) {
		// Already initialized
		return;
	}

	firmly.appId = appId;
	firmly.apiServer = apiServer;
	firmly.telemetryServer = `${apiServer}/api/v1/telemetry`;
	//firmly.telemetryServer = "https://u1.ai:3000";
	firmly.ccServer = apiServer.replace('api', 'cc');
	firmly.domain = domain;

	// Observers
	performanceInit();
	mutationInit();

	// initialize payment keys
	paymentInitialize(firmly.ccServer);

	// initialize browser session
	await getApiAccessToken();
	if (firmly.isNewSessionId) {
		telemetrySessionStart();
	}
}

export async function initializeDomain(domain) {
	if (typeof window !== 'undefined') {
		const firmly = window.firmly;
		firmly.domain = domain;
	}
}

export async function initializeAppVersion(version, appname = 'dropin-service') {
	if (typeof window !== 'undefined') {
		const firmly = window.firmly;
		firmly.appVersion = version;
		firmly.appName = appname;
	}
}

/* Sample Parent Info
{
	"hostname": "havaianas.firmly.dev",
	"pathname": "/us/en/product/you-rio-sandals/NA4146078-2404.html",
	"href": "https://havaianas.firmly.dev/us/en/product/you-rio-sandals/NA4146078-2404.html?utm_source=salesforce_blast&utm_medium=email&utm_campaign=HVUS_20230703_ONESHOT_REPIC-CONVERSION-4TH-OF-JULY-SALE-0_B_EMKT&utm_term=66637877",
	"referrer": "",
	"name": "edge-pdp-proxy",
	"version": "0.0.79"
}
*/
const PARENT_UTM = 'FPARUTM';
function getSessionParentUTM() {
	const value = sessionStorage.getItem(PARENT_UTM);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

function setSessionParentUTM(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(PARENT_UTM, js);
}

const TAG_LIST = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'gclid',
	'fbclid',
	'shpxid'
];
function initParentUTM(parentInfo) {
	if (parentInfo && parentInfo.href) {
		const phrefUrl = new URL(parentInfo.href);
		// If searchParams exist and one of the Tag List is present, then it will be set to the Session info.
		if (phrefUrl.searchParams.size > 0 && TAG_LIST.find((e) => phrefUrl.searchParams.has(e))) {
			setSessionParentUTM(Object.fromEntries(phrefUrl.searchParams.entries()));
		}
	}
}

export async function initializeParentInfo(parentInfo) {
	const firmly = window.firmly;
	firmly.parentInfo = parentInfo;
	initParentUTM(parentInfo);
	telemetryPageVisit();
}

//#endregion

//#region Cart API functions
const SESSION_CART = 'FSSCAR';
function getSessionCart() {
	const value = sessionStorage.getItem(SESSION_CART);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

function setSessionCart(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(SESSION_CART, js);
}

function getDomainUrl(suffix, domain) {
	return `${window.firmly.apiServer}/api/v1/domains/${domain || window.firmly.domain}/${suffix}`;
}

function getWalletUrl(wallet, suffix) {
	return `${window.firmly.apiServer}/api/v1/wallets/${wallet}/${suffix}`;
}

function getDynamoUrl(suffix) {
	return `${window.firmly.apiServer}/api/v1/dynamo/${suffix}`;
}

async function getHeaders() {
	const auth = await getApiAccessToken();
	const ret = {
		headers: {
			'Content-Type': 'application/json',
			'x-firmly-authorization': auth
		}
	};

	return ret;
}

async function cartSessionTransfer(body, domain) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('session/transfer', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartGetCart(domain, healthCheckCall = false) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('cart', domain), {
		...headers,
		method: 'GET'
	});

	// If this is already a health check call, we do not need to create a new one
	if (!healthCheckCall) {
		createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	}
	return res;
}

async function cartAddLineItem(
	sku,
	quantity,
	variantHandles = [],
	domain = undefined,
	flushCart = false
) {
	const headers = await getHeaders();
	const body = {
		variant_handles: variantHandles
	};
	const res = await browserFetch(
		getDomainUrl(`cart/line-items/${sku}/quantity/${quantity}?flush_cart=${flushCart}`, domain),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		}
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	postUpdateCart();
	return res;
}

async function cartUpdateSku(sku, quantity, variantHandles = [], domain = undefined) {
	const headers = await getHeaders();
	const body = {
		quantity: quantity,
		variant_handles: variantHandles
	};
	const res = await browserFetch(getDomainUrl(`cart/line-items/${sku}`, domain), {
		...headers,
		method: 'PUT',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartClear(domain = undefined) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl(`cart/line-items`, domain), {
		...headers,
		method: 'DELETE'
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	postUpdateCart();
	return res;
}

async function cartUpdateShippingInfo(body, domain) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('cart/shipping-info', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartUpdateDelivery(sku, domain) {
	const headers = await getHeaders();
	const body = {
		shipping_method: sku
	};
	const res = await browserFetch(getDomainUrl('cart/shipping-method', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartCompleteOrder(paymentToken, domain) {
	const headers = await getHeaders();
	const body = {
		payment_token: { id: paymentToken },
		vault_token: true
	};
	const res = await browserFetch(getDomainUrl('cart/complete-order', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function getConsents() {
	const headers = await getHeaders();

	const res = await browserFetch(getDomainUrl('cart/consents'), {
		...headers,
		method: 'GET'
	});

	return res;
}

async function setConsents(consents) {
	const headers = await getHeaders();

	const res = await browserFetch(getDomainUrl('cart/consents'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(consents)
	});

	return res;
}

async function sessionJoin(password) {
	const headers = await getHeaders();
	const body = {
		password
	};
	const res = await browserFetch(getDomainUrl('session/join'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function sessionCreateOtp(email) {
	const headers = await getHeaders();
	const body = {
		email
	};
	const res = await browserFetch(getDomainUrl('session/create-otp'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

async function sessionValidateOtp(email, otp) {
	const headers = await getHeaders();
	const body = {
		email,
		otp
	};
	const res = await browserFetch(getDomainUrl('session/validate-otp'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartSavedPaymentCompleteOrder(paymentId) {
	const headers = await getHeaders();
	const body = {
		payment_id: paymentId
	};
	const res = await browserFetch(getDomainUrl('cart/complete-order-with-saved-payment'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

//#region  Promo code functions

async function addPromoCode(promoCode) {
	const headers = await getHeaders();
	const body = {
		promo_codes: [promoCode]
	};
	const res = await browserFetch(getDomainUrl('cart/promo-codes'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}
	return res;
}

async function clearPromoCodes() {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('cart/promo-codes'), {
		...headers,
		method: 'DELETE'
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}
	return res;
}

//#endregion

//#region  Cart Payment functions

async function paymentCompleteOrder(ccInfo, paymentHandle) {
	const body = await gcmEncrypt(ccInfo);
	body.handle = paymentHandle;

	const headers = await getHeaders();
	const res = await browserFetch(getCCUrl('complete-order'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

async function encryptCCInfo(ccInfo) {
	ccInfo.credit_card.month = await rsaEncrypt(ccInfo.credit_card.month);
	ccInfo.credit_card.name = await rsaEncrypt(ccInfo.credit_card.name);
	ccInfo.credit_card.number = await rsaEncrypt(ccInfo.credit_card.number);
	ccInfo.credit_card.verification_value = await rsaEncrypt(ccInfo.credit_card.verification_value);
	ccInfo.credit_card.year = await rsaEncrypt(ccInfo.credit_card.year);

	return ccInfo;
}

async function encryptCCInfoAsJWE(ccInfo) {
	const firmly = window.firmly;
	const jwkKey = firmly.paymentJWKKey;

	const publicKey = await importJWKKey(jwkKey);

	const jwe = await encryptJWEPayloadWithKey(ccInfo.credit_card, publicKey, {
		kid: jwkKey.kid
	});

	const placeOrderV3Payload = {
		billing_info: ccInfo.billing_info,
		encrypted_card: jwe
	};

	return placeOrderV3Payload;
}

async function paymentCompleteOrderV2(ccInfo, paymentHandle) {
	const body = await encryptCCInfo(ccInfo);
	body.handle = paymentHandle;

	const headers = await getHeaders();
	const res = await browserFetch(getCCUrlV2('complete-order'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

async function paymentCompleteOrderV3(ccInfo, paymentHandle) {
	const body = await encryptCCInfoAsJWE(ccInfo);
	body.handle = paymentHandle;

	const headers = await getHeaders();
	const res = await browserFetch(getCCUrlV3('complete-order'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

//#endregion

//#region Wallet functions

async function paymentTokenizeWallet(wallet, walletAccessToken, cardId, cvv = null, jws = null) {
	const body = { credit_card_id: cardId + '' };
	const cart = getSessionCart();
	if (cart) {
		body.handle = cart.payment_handle;
	}
	if (walletAccessToken) {
		body.access_token = walletAccessToken;
	}
	if (cvv) {
		body.verification_value = await rsaEncrypt(cvv);
	}
	if (jws) {
		body.jws = jws;
	}

	const headers = await getHeaders();
	const res = await browserFetch(getCCUrl(`tokenize/${wallet}`), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

async function walletUnlockStart(walletType, emailAddress, captcha = null) {
	const body = { email: emailAddress };
	if (captcha) {
		body.hcaptcha_token = captcha;
	}

	const headers = await getHeaders();
	const res = await browserFetch(getWalletUrl(walletType, 'unlock-start'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

async function walletUnlockComplete(walletType, walletAccessToken, otp) {
	const headers = await getHeaders();
	const res = await browserFetch(getWalletUrl(walletType, 'unlock-complete'), {
		...headers,
		method: 'POST',
		body: JSON.stringify({ access_token: walletAccessToken, otp: otp })
	});
	return res;
}

//#endregion

//#region Click to Pay Wallet

const WALLET_C2P_ACCESS_TOKEN = 'FWC2P';
function getC2PAccessToken() {
	const value = sessionStorage.getItem(WALLET_C2P_ACCESS_TOKEN);
	if (value) {
		return value;
	}
	return null;
}

function setC2PAccessToken(value) {
	sessionStorage.setItem(WALLET_C2P_ACCESS_TOKEN, value);
}

const CLICK_2_PAY = 'visa';

async function c2pWalletUnlockStart(emailAddress) {
	const ret = await walletUnlockStart(CLICK_2_PAY, emailAddress);
	if (ret.status == 200) {
		setC2PAccessToken(ret.data.access_token);
	}
	return ret;
}

async function c2pWalletUnlockComplete(otp, accessToken = null) {
	if (!accessToken) {
		accessToken = getC2PAccessToken();
	}

	const ret = await walletUnlockComplete(CLICK_2_PAY, accessToken, otp);
	if (ret.status == 200) {
		setC2PAccessToken(ret.data.access_token);
	}

	return ret;
}

async function paymentC2PTokenize(cardId, cvv = null, accessToken = null, jws = null) {
	if (!accessToken) {
		accessToken = getC2PAccessToken();
	}

	return paymentTokenizeWallet(CLICK_2_PAY, accessToken, cardId, cvv, jws);
}

//#endregion

//#region ShopPay Wallet

const WALLET_SHOPPAY_ACCESS_TOKEN = 'FWSP';
function getShopPayAccessToken() {
	const value = sessionStorage.getItem(WALLET_SHOPPAY_ACCESS_TOKEN);
	if (value) {
		return value;
	}
	return null;
}

function setShopPayAccessToken(value) {
	sessionStorage.setItem(WALLET_SHOPPAY_ACCESS_TOKEN, value);
}

const SHOP_PAY = 'shoppay';

async function shopPayWalletUnlockStart(emailAddress, captcha) {
	const ret = await walletUnlockStart(SHOP_PAY, emailAddress, captcha);
	if (ret.status == 200) {
		setShopPayAccessToken(ret.data.access_token);
	}
	return ret;
}

async function shopPayWalletUnlockComplete(otp, accessToken = null) {
	if (!accessToken) {
		accessToken = getShopPayAccessToken();
	}

	const ret = await walletUnlockComplete(SHOP_PAY, accessToken, otp);
	if (ret.status == 200) {
		setShopPayAccessToken(ret.data.access_token);
	}

	return ret;
}

async function paymentShopPayTokenize(cardId, accessToken = null) {
	if (!accessToken) {
		accessToken = getShopPayAccessToken();
	}

	return paymentTokenizeWallet(SHOP_PAY, accessToken, cardId);
}

//#endregion

//#region Paypal
async function paypalStart() {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('express/paypal/start'), {
		...headers,
		method: 'POST'
	});
	return res;
}

async function paypalAuthorize(attributes) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('express/paypal/authorize'), {
		...headers,
		method: 'POST',
		body: JSON.stringify({ attributes })
	});
	return res;
}

async function paypalCompleteOrder(attributes) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('express/paypal/complete-order'), {
		...headers,
		method: 'POST',
		body: JSON.stringify({ attributes })
	});
	return res;
}
//#endregion

//#region Address search

async function searchAddress(prefix, domain) {
	const headers = await getHeaders();
	const encoded = encodeURIComponent(prefix);
	const res = await browserFetch(getDomainUrl(`addresses?q=${encoded}`, domain), {
		...headers
	});
	return res;
}

async function getAddress(id, domain) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl(`addresses/${id}`, domain), {
		...headers
	});
	return res;
}

async function searchProducts(query) {
	const headers = await getHeaders();
	const res = await browserFetch(getDynamoUrl(`search?q=${query}`), {
		...headers
	});
	return res;
}

/**
 * Sets custom properties for a specific domain
 * @param {string} domain - The domain to set properties for
 * @param {Object} customProperties - The custom properties object to send
 * @returns {Promise<Object>} Response object
 */
async function setCustomProperties(domain, customProperties) {
	if (!customProperties || typeof customProperties !== 'object') {
		throw new Error('Custom properties must be a valid object');
	}
	
	const headers = await getHeaders();
	const res = await browserFetch(`${window.firmly.apiServer}/api/v1/domains/${domain}/properties`, {
		...headers,
		method: 'PUT',
		body: JSON.stringify(customProperties)
	});
	
	if (res.status !== 200) {
		console.error('Failed to set properties:', res.data);
	}
	
	return res;
}

//#endregion

//#region Initialize

function getRandomId() {
	let array = new Uint8Array(10);
	CRYPTO.getRandomValues(array);
	return array.join('');
}

if (typeof window !== 'undefined') {
	const firmly = (window.firmly = window.firmly || {});
	CRYPTO = window.crypto || window.msCrypto;
	if (isStorageAvailable('sessionStorage')) {
		sessionStorage = window.sessionStorage;
	}

	if (isStorageAvailable('localStorage')) {
		localStorage = window.localStorage;
	}

	firmly.traceId = 'T' + getRandomId();
	firmly.browserId = initBrowserId();
	firmly.deviceId = getDeviceId() || getRandomId();
	firmly.sessionId = initSessionId();

	// Payment functions
	firmly.paymentInitialize = paymentInitialize;
	firmly.paymentCreditCardTokenize = paymentCreditCardTokenize;
	firmly.paymentRsaEncrypt = rsaEncrypt;

	// Session functions
	firmly.initialize = initialize;
	firmly.sessionGetAllActiveCarts = sessionGetAllActiveCarts;

	// Cart functions
	firmly.cartGetCart = cartGetCart;
	firmly.cartSessionTransfer = cartSessionTransfer;
	firmly.cartAddLineItem = cartAddLineItem;
	firmly.cartUpdateSku = cartUpdateSku;
	firmly.cartClear = cartClear;
	firmly.cartUpdateShippingInfo = cartUpdateShippingInfo;
	firmly.cartUpdateDelivery = cartUpdateDelivery;
	firmly.cartCompleteOrder = cartCompleteOrder;
	firmly.sessionJoin = sessionJoin;
	firmly.getConsents = getConsents;
	firmly.setConsents = setConsents;
	firmly.sessionCreateOtp = sessionCreateOtp;
	firmly.sessionValidateOtp = sessionValidateOtp;
	firmly.cartSavedPaymentCompleteOrder = cartSavedPaymentCompleteOrder;

	// Promo code functions
	firmly.addPromoCode = addPromoCode;
	firmly.clearPromoCodes = clearPromoCodes;

	// Cart Payment functions
	firmly.paymentCompleteOrder = paymentCompleteOrder;
	firmly.paymentCompleteOrderV2 = paymentCompleteOrderV2;
	firmly.paymentCompleteOrderV3 = paymentCompleteOrderV3;

	// Wallet Click to Pay functions
	firmly.c2pWalletUnlockStart = c2pWalletUnlockStart;
	firmly.c2pWalletUnlockComplete = c2pWalletUnlockComplete;
	firmly.paymentC2PTokenize = paymentC2PTokenize;

	// Wallet ShopPay functions
	firmly.shopPayWalletUnlockStart = shopPayWalletUnlockStart;
	firmly.shopPayWalletUnlockComplete = shopPayWalletUnlockComplete;
	firmly.paymentShopPayTokenize = paymentShopPayTokenize;

	// Wallet paypal functions
	firmly.paypalStart = paypalStart;
	firmly.paypalAuthorize = paypalAuthorize;
	firmly.paypalCompleteOrder = paypalCompleteOrder;

	// Address functions
	firmly.searchAddress = searchAddress;
	firmly.getAddress = getAddress;

	// Search functions
	firmly.searchProducts = searchProducts;
	
	// Custom properties functions
	firmly.setCustomProperties = setCustomProperties;

	// Telemetry click events
	firmly.telemetryButtonClick = telemetryButtonClick;

	// Telemetry visa
	firmly.telemetryVisaEvent = telemetryVisaEvent;
	firmly.telemetryVisaErrors = telemetryVisaErrors;
	firmly.telemetryVisaApiPerformance = telemetryVisaApiPerformance;
}

//#endregion
