// @ts-nocheck

import { platformsToMakeCartHealthCheck } from './api-config';
import { postUpdateCart, requestStorageData, syncStorageData } from './cross';
import { importJWK, CompactEncrypt } from 'foundation/auth/ext-jose.js';
import { trackUXEvent, trackAPIEvent, trackError, getSessionTraceId } from './telemetry.js';
import { sessionManager } from '../utils/session-manager.js';
import {
	initializationState,
	INITIALIZATION_STATES,
	isInitializing
} from '../utils/initialization-state.js';
import { loadFromStorage, saveToStorage } from '../utils/storage-manager.js';

// Storage key constants
const BROWSER_ID_KEY = 'FLDID';
const PAYMENT_KEY = 'FPKEY';
const PAYMENT_SESSION_KEY = 'FPS';
const PARENT_UTM_KEY = 'FPARUTM';
const SESSION_CART_KEY = 'FSSCAR';
const C2P_ACCESS_TOKEN_KEY = 'FWC2P';
const PAYMENT_KEY_FETCH_TIMEOUT_MS = 3000;

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

function getBrowserId() {
	const value = localStorage.getItem(BROWSER_ID_KEY);
	if (value) {
		return value;
	}
	return getRandomId();
}

function setBrowserId(value) {
	localStorage.setItem(BROWSER_ID_KEY, value);
}

function initBrowserId() {
	let id = getBrowserId();
	if (!id) {
		id = 'B' + getRandomId();
		setBrowserId(id);
	}

	return id;
}

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
					const messageData = {
						timestamp: performance.timeOrigin + entry.startTime,
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
						messageData.error = 'apiError';
					}
					exceededList.push(messageData);
				}
			}
			if (exceededList.length > 0) {
				exceededList.forEach((data) => {
					trackAPIEvent(`api-${data.entry_type}`, data);
				});
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
			let msgData = {
				timestamp: Date.now(),
				event_name: eventName,
				element_id: iterator.id
			};
			if (eventName == EVENT_VIEW_SHOWN) {
				iterator.attributes[FOBS].value = Date.now();
			} else if (eventName == EVENT_VIEW_REMOVED) {
				const ts = parseInt(iterator.attributes[FOBS].value);
				if (ts) {
					msgData.event_start_timestamp = msgData.timestamp;
					msgData.duration_ms = Date.now() - ts;
				}
			}
			messages.push(msgData);
		}
	}
	if (messages.length > 0) {
		messages.forEach((data) => {
			trackUXEvent(data.element_id, data);
		});
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
	// Skip semaphore during initialization phase for better performance
	if (isInitializing()) {
		return await func();
	}

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

async function browserFetch(url, options = defaultOptions, parentContext = null) {
	const startTime = Date.now();

	let traceContext = null;
	if (parentContext) {
		traceContext = {
			'trace.trace_id': parentContext.traceId,
			'trace.span_id': generateRandomId(8),
			'trace.parent_id': parentContext.spanId,
			'trace.sampled': true
		};
	}

	const mergedOptions = Object.assign(options, {
		credentials: 'include'
	});

	const res = await semaphore(() => fetch(url, mergedOptions).catch(handleFetchError));
	const duration = Date.now() - startTime;

	let ret = { status: res.status };
	try {
		ret.data = await res.json();
	} catch (e) {
		/* empty */
	}

	const apiEventData = {
		url: url,
		method: options.method || 'GET',
		status: res.status,
		duration_ms: duration,
		success: res.status >= 200 && res.status < 300
	};

	if (res.status != 200) {
		try {
			const tempData = ret.data;
			apiEventData.error_code = tempData?.code;
			apiEventData.error_description = tempData?.description;
			apiEventData.error = tempData?.error;
			apiEventData.error_string = tempData?.errorString;
		} catch (ex) {
			/* empty */
		}
	}

	trackAPIEvent('api_request', apiEventData, traceContext);

	return ret;
}

//#endregion

//#region Crypto Encryption
function generateRandomId(byteLength) {
	const crypto = window.crypto || window.msCrypto;
	const bytes = crypto?.getRandomValues
		? crypto.getRandomValues(new Uint8Array(byteLength))
		: Uint8Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256));

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

let CRYPTO;

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

function getCCServer() {
	const value = sessionStorage.getItem(PAYMENT_SESSION_KEY);
	if (value) {
		return value;
	}
	return null;
}

function setCCServer(value) {
	sessionStorage.setItem(PAYMENT_SESSION_KEY, value);
}

function clearPaymentSession() {
	sessionStorage.removeItem(PAYMENT_SESSION_KEY);
	sessionStorage.removeItem(PAYMENT_KEY);
}

function getCCUrl(suffix) {
	return `${window.firmly.ccServer}/api/v1/payment/domains/${window.firmly.domain}/${suffix}`;
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
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(
					() => controller.abort(),
					PAYMENT_KEY_FETCH_TIMEOUT_MS
				);

				let pay = await browserFetch(`${ccServer}/api/v1/payment/key`, {
					...defaultOptions,
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				if (pay.status == 200) {
					setPaymentKey(pay.data);
					paymentKey = pay.data;
				}
			} catch (error) {
				// Payment key fetch failed - continue without payment key
				console.warn('Payment key fetch failed:', error);
				return;
			}
		}

		if (paymentKey) {
			try {
				firmly.paymentRSAKey = await getRSAKey(paymentKey);
				firmly.paymentJWKKey = paymentKey;
			} catch (error) {
				// Payment key processing failed
				console.warn('Payment key processing failed:', error);
			}
		}
	}
}

//#endregion

//#region Browser Session API functions

function initSessionId() {
	const result = sessionManager.initializeSessionId();
	if (window.firmly) {
		window.firmly.isNewSessionId = result.isNew;
	}
	return result.sessionId;
}

async function fetchBrowserSession() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) return null;

	try {
		const session = await sessionManager.fetchBrowserSession(
			window.firmly.appId,
			window.firmly.apiServer,
			{
				onDeviceCreated: (sessionData) => {
					window.firmly.deviceId = sessionData.device_id;
					trackUXEvent('deviceCreated');
				}
			}
		);
		return session;
	} catch (error) {
		return null;
	}
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
	if (!window.firmly?.appId || !window.firmly?.apiServer) return null;

	try {
		return await sessionManager.getAccessToken(window.firmly.appId, window.firmly.apiServer, {
			allowStaleToken: true
		});
	} catch (error) {
		return null;
	}
}

/**
 * Gets API access token with SDK synchronization.
 * Flow: Request SDK data → Validate → Use or fetch new → Sync back
 */
async function getOrSyncApiAccessToken() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) return null;

	const TIMEOUT_MS = 2000;
	const EXPIRATION_BUFFER_SEC = 300; // 5 minutes

	const isSessionValid = (session) => {
		if (!session?.expires) return false;
		return session.expires > Math.floor(Date.now() / 1000) + EXPIRATION_BUFFER_SEC;
	};

	try {
		const sdkData = await new Promise((resolve) => {
			const handler = (event) => {
				// Security: Only accept messages from the parent window.
				if (event.source !== window.parent) {
					return;
				}

				try {
					const data =
						typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
					if (data.action === 'firmlyStorageResponse' && data.key === 'FBS_SDK') {
						clearTimeout(timeoutId);
						window.removeEventListener('message', handler);
						resolve(data.data);
					}
				} catch (e) {
					// Ignore parsing errors from other postMessage sources.
				}
			};

			const timeoutId = setTimeout(() => {
				window.removeEventListener('message', handler);
				resolve(null);
			}, TIMEOUT_MS);

			window.addEventListener('message', handler);
			requestStorageData('FBS_SDK');
		});

		// Use SDK data if valid
		if (sdkData && isSessionValid(sdkData)) {
			sessionManager.setStoredSession(sdkData);
			return sdkData.access_token;
		}

		// Track critical events for telemetry
		if (sdkData) {
			console.info('SDK Data Expired: SDK Data found but it is expired');
		} else {
			console.info('SDK Data Timeout: No SDK data found');
		}

		const session = await sessionManager.fetchBrowserSession(
			window.firmly.appId,
			window.firmly.apiServer,
			{
				onDeviceCreated: (sessionData) => {
					window.firmly.deviceId = sessionData.device_id;
					trackUXEvent('deviceCreated');
				}
			}
		);

		// Sync new session back to SDK
		if (session?.access_token) {
			syncStorageData('FBS_SDK', session);
			console.info('Session Synced to SDK');
		}

		return session?.access_token || null;
	} catch (error) {
		trackError('getOrSyncApiAccessToken_error', error);
		return null;
	}
}

function getDeviceId() {
	return sessionManager.getDeviceId();
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
	// performanceInit(); // Removed to stop api-PerformanceResourceTiming events
	mutationInit();

	initializationState.setState(INITIALIZATION_STATES.DROPIN_READY);

	// initialize payment keys in background
	paymentInitialize(firmly.ccServer).catch((error) => {
		console.warn('Payment initialization delayed:', error);
	});

	// Initialize session in background with SDK synchronization
	getOrSyncApiAccessToken()
		.then(() => {
			if (firmly.isNewSessionId) {
				trackUXEvent('sessionStart');
			}
			initializationState.complete();
		})
		.catch((error) => {
			console.warn('Session initialization delayed:', error);
			initializationState.addError(error);
		});
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
function getSessionParentUTM() {
	const value = sessionStorage.getItem(PARENT_UTM_KEY);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

function setSessionParentUTM(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(PARENT_UTM_KEY, js);
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

//#endregion

//#region Cart API functions
function getSessionCart() {
	const value = sessionStorage.getItem(SESSION_CART_KEY);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

function setSessionCart(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(SESSION_CART_KEY, js);
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
	if (!window.firmly?.appId || !window.firmly?.apiServer) {
		return { headers: { 'Content-Type': 'application/json' } };
	}

	try {
		return await sessionManager.getAuthHeaders(window.firmly.appId, window.firmly.apiServer, {
			allowStaleToken: true
		});
	} catch (error) {
		return { headers: { 'Content-Type': 'application/json' } };
	}
}

async function cartSessionTransfer(body, domain, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('session/transfer', domain),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartGetCart(domain, healthCheckCall = false, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('cart', domain),
		{
			...headers,
			method: 'GET'
		},
		parentContext
	);

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
	flushCart = false,
	parentContext = null
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
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	postUpdateCart();
	return res;
}

async function cartUpdateSku(
	sku,
	quantity,
	variantHandles = [],
	domain = undefined,
	parentContext = null
) {
	const headers = await getHeaders();
	const body = {
		quantity: quantity,
		variant_handles: variantHandles
	};
	const res = await browserFetch(
		getDomainUrl(`cart/line-items/${sku}`, domain),
		{
			...headers,
			method: 'PUT',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartClear(domain = undefined, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl(`cart/line-items`, domain),
		{
			...headers,
			method: 'DELETE'
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	postUpdateCart();
	return res;
}

async function cartUpdateShippingInfo(body, domain, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('cart/shipping-info', domain),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartUpdateDelivery(sku, domain, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		shipping_method: sku
	};
	const res = await browserFetch(
		getDomainUrl('cart/shipping-method', domain),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartCompleteOrder(paymentToken, domain, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		payment_token: { id: paymentToken },
		vault_token: true
	};
	const res = await browserFetch(
		getDomainUrl('cart/complete-order', domain),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function getConsents(parentContext = null) {
	const headers = await getHeaders();

	const res = await browserFetch(
		getDomainUrl('cart/consents'),
		{
			...headers,
			method: 'GET'
		},
		parentContext
	);

	return res;
}

async function setConsents(consents, parentContext = null) {
	const headers = await getHeaders();

	const res = await browserFetch(
		getDomainUrl('cart/consents'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(consents)
		},
		parentContext
	);

	return res;
}

async function sessionJoin(password, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		password
	};
	const res = await browserFetch(
		getDomainUrl('session/join'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function sessionCreateOtp(email, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		email
	};
	const res = await browserFetch(
		getDomainUrl('session/create-otp'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	return res;
}

async function sessionValidateOtp(email, otp, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		email,
		otp
	};
	const res = await browserFetch(
		getDomainUrl('session/validate-otp'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function cartSavedPaymentCompleteOrder(paymentId, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		payment_id: paymentId
	};
	const res = await browserFetch(
		getDomainUrl('cart/complete-order-with-saved-payment'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

async function affiliateStartJourney(url, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		url: url
	};
	const res = await browserFetch(
		`${window.firmly.apiServer}/api/v1/carts/affiliate/start-journey`,
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);

	return res;
}

async function setAttribution(attribution, domain, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		`${getDomainUrl('cart/attribution', domain)}`,
		{
			...headers,
			method: 'PUT',
			body: JSON.stringify({ attribution })
		},
		parentContext
	);

	return res;
}

//#region  Promo code functions

async function addPromoCode(promoCode, parentContext = null) {
	const headers = await getHeaders();
	const body = {
		promo_codes: [promoCode]
	};
	const res = await browserFetch(
		getDomainUrl('cart/promo-codes'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}
	return res;
}

async function clearPromoCodes(parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('cart/promo-codes'),
		{
			...headers,
			method: 'DELETE'
		},
		parentContext
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}
	return res;
}

//#endregion

//#region  Cart Payment functions

// Main function for completing credit card orders with JWE encryption
async function completeCreditCardOrder(domain, ccInfo) {
	// The complete-order endpoint gets payment_handle from cart automatically
	// No need to pass it in the body
	const body = await encryptCCInfoAsJWE(ccInfo);

	const headers = await getHeaders();
	const res = await browserFetch(getCCUrl(`complete-order`), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

// New function for wallet complete orders
async function completeWalletOrder(domain, walletData) {
	const headers = await getHeaders();
	const res = await browserFetch(getCCUrl(`wallet-complete-order`), {
		...headers,
		method: 'POST',
		body: JSON.stringify(walletData)
	});
	return res;
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

//#endregion

//#region Wallet functions

async function walletUnlockStart(walletType, emailAddress, captcha = null, parentContext = null) {
	const body = { email: emailAddress };
	if (captcha) {
		body.hcaptcha_token = captcha;
	}

	const headers = await getHeaders();
	const res = await browserFetch(
		getWalletUrl(walletType, 'unlock-start'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		},
		parentContext
	);
	return res;
}

async function walletUnlockComplete(walletType, walletAccessToken, otp, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getWalletUrl(walletType, 'unlock-complete'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify({ access_token: walletAccessToken, otp: otp })
		},
		parentContext
	);
	return res;
}

//#endregion

//#region Click to Pay Wallet

function getC2PAccessToken() {
	const value = sessionStorage.getItem(C2P_ACCESS_TOKEN_KEY);
	if (value) {
		return value;
	}
	return null;
}

function setC2PAccessToken(value) {
	sessionStorage.setItem(C2P_ACCESS_TOKEN_KEY, value);
}

let CLICK_2_PAY = 'visa';

function changeC2PProvider(provider = 'mastercard-unified') {
	CLICK_2_PAY = provider;
}

async function c2pWalletUnlockStart(emailAddress, parentContext = null) {
	const ret = await walletUnlockStart(CLICK_2_PAY, emailAddress, null, parentContext);
	if (ret.status == 200) {
		setC2PAccessToken(ret.data.access_token);
	}
	return ret;
}

async function c2pWalletUnlockComplete(otp, accessToken = null, parentContext = null) {
	if (!accessToken) {
		accessToken = getC2PAccessToken();
	}

	const ret = await walletUnlockComplete(CLICK_2_PAY, accessToken, otp, parentContext);

	if (ret.status == 200) {
		setC2PAccessToken(ret.data.access_token);
	}
	return ret;
}

// ShopPay support has been removed

//#endregion

//#region Paypal
async function paypalStart(parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('express/paypal/start'),
		{
			...headers,
			method: 'POST'
		},
		parentContext
	);
	return res;
}

async function paypalAuthorize(attributes, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('express/paypal/authorize'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify({ attributes })
		},
		parentContext
	);
	return res;
}

async function paypalCompleteOrder(attributes, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl('express/paypal/complete-order'),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify({ attributes })
		},
		parentContext
	);
	return res;
}
//#endregion

//#region Address search

async function searchAddress(prefix, domain, parentContext = null) {
	const headers = await getHeaders();
	const encoded = encodeURIComponent(prefix);
	const res = await browserFetch(
		getDomainUrl(`addresses?q=${encoded}`, domain),
		{
			...headers
		},
		parentContext
	);
	return res;
}

async function getAddress(id, domain, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDomainUrl(`addresses/${id}`, domain),
		{
			...headers
		},
		parentContext
	);
	return res;
}

async function searchProducts(query, parentContext = null) {
	const headers = await getHeaders();
	const res = await browserFetch(
		getDynamoUrl(`search?q=${query}`),
		{
			...headers
		},
		parentContext
	);
	return res;
}

/**
 * Sets custom properties for a specific domain
 * @param {string} domain - The domain to set properties for
 * @param {Object} customProperties - The custom properties object to send
 * @returns {Promise<Object>} Response object
 */
async function setCustomProperties(domain, customProperties, parentContext = null) {
	if (!customProperties || typeof customProperties !== 'object') {
		throw new Error('Custom properties must be a valid object');
	}

	try {
		const headers = await getHeaders();
		const url = `${window.firmly.apiServer}/api/v1/domains/${domain}/properties`;

		const res = await browserFetch(
			url,
			{
				...headers,
				method: 'PUT',
				body: JSON.stringify(customProperties)
			},
			parentContext
		);

		if (res.status !== 200) {
			console.error('Failed to set properties:', res.data);
		}

		return res;
	} catch (error) {
		console.error('Error in setCustomProperties:', error);
		throw error;
	}
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

	firmly.browserId = initBrowserId();
	firmly.deviceId = getDeviceId() || getRandomId();
	firmly.sessionId = initSessionId();

	// Payment functions
	firmly.paymentInitialize = paymentInitialize;
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

	// Affiliate functions
	firmly.affiliateStartJourney = affiliateStartJourney;
	firmly.setAttribution = setAttribution;

	// Promo code functions
	firmly.addPromoCode = addPromoCode;
	firmly.clearPromoCodes = clearPromoCodes;

	// Cart Payment functions
	firmly.completeCreditCardOrder = completeCreditCardOrder;
	firmly.completeWalletOrder = completeWalletOrder;

	// Wallet Click to Pay functions
	firmly.c2pWalletUnlockStart = c2pWalletUnlockStart;
	firmly.c2pWalletUnlockComplete = c2pWalletUnlockComplete;
	firmly.changeC2PProvider = changeC2PProvider;

	// ShopPay functions removed - no longer supported

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
}

//#endregion
