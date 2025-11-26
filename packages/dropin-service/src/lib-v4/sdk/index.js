// @ts-nocheck
// import { version } from '../../../package.json';
import { initialize } from '../browser/api-firmly.js';
import { bindEvent } from '../browser/dash.js';
import { CartHive } from './cart-hive.js';
import { Cart } from './cart.js';
import { getAllOrders } from './orders.js';
import { convertToFirmlyDomain } from '../utils/domain-utils.js';
import { sdkSessionManager } from '../utils/session-manager.js';
import { initializationState, INITIALIZATION_STATES } from '../utils/initialization-state.js';

import { saveToStorage, loadFromStorage, removeFromStorage } from '../utils/storage-manager.js';
import { trackAffiliateClick } from '../browser/telemetry.js';


let sdkInitialized = false;
let globalMessageListener = null;

export async function getApiAccessToken() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) return null;

	try {
		return await sdkSessionManager.getAccessToken(
			window.firmly.appId,
			window.firmly.apiServer,
			{
				allowStaleToken: true,
				onDeviceCreated: (sessionData) => {
					if (window.firmly) {
						window.firmly.deviceId = sessionData.device_id;
					}
				}
			}
		);
	} catch (error) {
		return null;
	}
}

export async function getHeaders() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) {
		return { headers: { 'Content-Type': 'application/json' } };
	}

	try {
		return await sdkSessionManager.getAuthHeaders(
			window.firmly.appId,
			window.firmly.apiServer,
			{
				allowStaleToken: true
			}
		);
	} catch (error) {
		return { headers: { 'Content-Type': 'application/json' } };
	}
}

async function initializeSDKSession(appId, apiServer) {
	if (sdkInitialized) return;

	if (typeof window !== 'undefined') {
		initWindowFirmly();
		window.firmly.appId = appId;
		window.firmly.apiServer = apiServer;

		const { sessionId, isNew } = sdkSessionManager.initializeSessionId();
		if (window.firmly) {
			window.firmly.isNewSessionId = isNew;
		}

		// Initialize JWT in background
		sdkSessionManager
			.getAccessToken(appId, apiServer, {
				allowStaleToken: true,
				onDeviceCreated: (sessionData) => {
					if (window.firmly) {
						window.firmly.deviceId = sessionData.device_id;
					}
				}
			})
			.catch((error) => {
				// JWT initialization failed - will retry on demand
				console.warn('SDK session initialization failed', error);
			});

		sdkInitialized = true;
	}
}

const uuidRegex =
	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/m;
const appId = '#F_APP_ID#';
const apiServer = '#F_API_SERVER#';
const dropinOrigin = '#F_DROPIN_ORIGIN#';
const apertureDomain = '#F_APERTURE_DOMAIN#';

/**
 * Validates if message origin matches the dropin domain
 * @param {string} origin - Message origin
 * @returns {boolean}
 */
function isValidDropinOrigin(origin) {
	if (!dropinOrigin) return false;
	return origin === dropinOrigin;
}

//#region Scroll Management for Buy Flow

let scrollY;
let prevBodyPosition;
let prevBodyOverflow;
let prevBodyWidth;
let scrollDisabled;

function disableScroll() {
	if (scrollDisabled) {
		return;
	}

	scrollY = window.scrollY;
	prevBodyPosition = document.body.style.position;
	prevBodyOverflow = document.body.style.overflow;
	prevBodyWidth = document.body.style.width;

	// Calculate scrollbar width to prevent layout shift
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

	document.body.style.position = 'fixed';
	document.body.style.top = `-${scrollY}px`;
	document.body.style.overflow = 'hidden';
	document.body.style.width = '100%';
	document.body.style.paddingRight = `${scrollbarWidth}px`;
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: 'instant'
	});
	scrollDisabled = true;
}

function enableScroll() {
	if (!scrollDisabled) {
		return;
	}

	document.body.style.position = prevBodyPosition || '';
	document.body.style.top = '';
	document.body.style.overflow = prevBodyOverflow || '';
	document.body.style.width = prevBodyWidth || '';
	document.body.style.paddingRight = '';
	window.scrollTo({
		top: scrollY,
		left: 0,
		behavior: 'instant'
	});
	scrollDisabled = false;
}

//#endregion

function initWindowFirmly() {
	if (window.firmly) {
		return;
	}

	window.firmly = {
		sdk: null,
		customProperties: null
	};
}

export async function bootstrap() {
	if (typeof window === 'undefined') {
		console.error('Window is undefined');
		return;
	}

	initializationState.start();
	initializationState.setState(INITIALIZATION_STATES.SDK_READY);

	initWindowFirmly();

	if (!window.firmly.sdk) {
		window.firmly.sdk = {
			Orders: {
				getAllOrders
			},
			Cart,
			CartHive,
			getApiAccessToken,
			getHeaders,
			JWT: {
				getToken: getApiAccessToken,
				getHeaders: getHeaders,

				refreshSession: async () => {
					if (window.firmly?.appId && window.firmly?.apiServer) {
						return await sdkSessionManager.fetchBrowserSession(
							window.firmly.appId,
							window.firmly.apiServer
						);
					}
					return null;
				},
				clearSession: () => {
					sdkSessionManager.clearSession();
				},
				isSessionValid: () => {
					return sdkSessionManager.isSessionValid();
				},
				getDeviceId: () => {
					return sdkSessionManager.getDeviceId();
				}
			},
			init: async (config) => {
				if (!config) {
					throw new Error('Please specify the init configuration');
				}

				if (!config.env?.apiServer) {
					throw new Error('Please specify the environment and API server');
				}

				if (!config.appId || !uuidRegex.test(config.appId)) {
					throw new Error('Please specify a valid appId');
				}

				initializationState.setState(INITIALIZATION_STATES.SDK_READY);

				await initializeSDKSession(config.appId, config.env.apiServer);

				initializationState.setState(INITIALIZATION_STATES.DROPIN_READY);

				await initialize(config.appId, config.env.apiServer, config.domain);
			}
		};

		window.firmly.buyNow = async function (checkoutConfig) {
			function createIframe(url, config, id = 'firmly-dropin-frame') {
				let iframe = document.querySelector(`[id="${id}"]`);
				let targetContainer = document.body;

				if (config.container) {
					console.log('firmly - container found', config.container);
					if (typeof config.container === 'string') {
						const selectedContainer = document.querySelector(config.container);
						if (!selectedContainer) {
							throw new Error(
								`Container not found with selector: ${config.container}`
							);
						}
						targetContainer = selectedContainer;
					} else if (config.container instanceof HTMLElement) {
						targetContainer = config.container;
					} else {
						throw new Error('Container must be a CSS selector or an HTMLElement');
					}
				}
				targetContainer.style.position = 'relative';

				if (!iframe) {
					iframe = document.createElement('iframe');
					iframe.id = id;
					iframe.allow = 'payment';

					const style = document.createElement('style');
					style.innerHTML = `
						#${id}::backdrop {
							background-color: rgba(0, 0, 0, 0.5);
						}
					`;

					document.body.appendChild(style);
					targetContainer.appendChild(iframe);
				}
				iframe.src = url;

				Object.assign(iframe.style, {
					position: config.container ? 'absolute' : 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					height: '100%',
					width: '100%',
					border: 'none',
					overflow: 'hidden',
					'z-index': config.container ? 1 : 9999999
				});

				return iframe;
			}

			// Use dropin origin for buyNow URL
			const dropinBuyNowUrl = new URL('/buy', dropinOrigin);
			dropinBuyNowUrl.searchParams.set('_appId', appId);

			if (checkoutConfig.pdp_url) {
				dropinBuyNowUrl.searchParams.set('url', checkoutConfig.pdp_url);
			}
			if (checkoutConfig.affiliate_url) {
				dropinBuyNowUrl.searchParams.set('affiliate_url', checkoutConfig.affiliate_url);
			}
			if (checkoutConfig.ui_mode) {
				dropinBuyNowUrl.searchParams.set('ui_mode', checkoutConfig.ui_mode);
			}
			if (checkoutConfig.force_pdp && checkoutConfig.skip_pdp) {
				console.warn(
					'`force_pdp` and `skip_pdp` are mutually exclusive and should not be used together. `skip_pdp` will be ignored.'
				);
			}
			if (checkoutConfig.force_pdp) {
				dropinBuyNowUrl.searchParams.set('force_pdp', checkoutConfig.force_pdp);
			} else if (checkoutConfig.skip_pdp) {
				dropinBuyNowUrl.searchParams.set('skip_pdp', checkoutConfig.skip_pdp);
			}
			if (checkoutConfig.custom_properties) {
				dropinBuyNowUrl.searchParams.set(
					'custom_properties',
					JSON.stringify(checkoutConfig.custom_properties)
				);
				window.firmly.customProperties = checkoutConfig.custom_properties;
			}

			// Pass traceId to dropin for distributed tracing
			// Priority: 1) checkoutConfig.trace_id (from mono-cte), 2) window.firmly.traceId (from postMessage handler)
			const traceIdToUse = checkoutConfig.trace_id || window.firmly.traceId;
			if (traceIdToUse) {
				dropinBuyNowUrl.searchParams.set('_traceId', traceIdToUse);
				// Also save to window.firmly for consistency
				window.firmly.traceId = traceIdToUse;
			}

			// Pass parentSpanId so dropin's session_start can be a child of affiliate_buy_button_click
			// Priority: 1) checkoutConfig.parent_span_id (from mono-cte), 2) window.firmly.parentSpanId (from postMessage handler)
			const parentSpanIdToUse = checkoutConfig.parent_span_id || window.firmly.parentSpanId;
			if (parentSpanIdToUse) {
				dropinBuyNowUrl.searchParams.set('_parentSpanId', parentSpanIdToUse);
			}

			// Pass browserId and deviceId so dropin uses the same IDs as SDK for telemetry
			if (window.firmly.browserId) {
				dropinBuyNowUrl.searchParams.set('_browserId', window.firmly.browserId);
			}
			if (window.firmly.deviceId) {
				dropinBuyNowUrl.searchParams.set('_deviceId', window.firmly.deviceId);
			}

			window.firmly.removeOnClose = checkoutConfig.remove_on_close || false;

			if (checkoutConfig.mode === 'minimal-pdp') {
				console.log('firmly - minimal pdp mode');
				window.firmly.dropinIframe = createIframe(
					dropinBuyNowUrl.toString(),
					checkoutConfig
				);
				disableScroll();
				window.firmly.dropinIframe.style.display = 'block';
			} else if (checkoutConfig.mode === 'full-pdp') {
				console.log('firmly - full pdp mode');
				const pdpUrl = new URL(checkoutConfig.pdp_url);
				pdpUrl.hostname = convertToFirmlyDomain(pdpUrl.hostname, apertureDomain);
				pdpUrl.searchParams.set('_appId', appId);

				window.firmly.pdpIframe = createIframe(
					pdpUrl.toString(),
					checkoutConfig,
					'firmly-pdp-frame'
				);
			} else {
				console.log('firmly - dropin mode');
				dropinBuyNowUrl.searchParams.set('url', checkoutConfig.pdp_url);
				createIframe(dropinBuyNowUrl.toString(), checkoutConfig, 'firmly-drawer-frame');
			}

			window.firmly.callbacks = {};

			if (checkoutConfig.onClose) {
				window.firmly.callbacks.onClose = checkoutConfig.onClose;
			}
			if (checkoutConfig.onOrderPlaced) {
				window.firmly.callbacks.onOrderPlaced = checkoutConfig.onOrderPlaced;
			}

			// For /buy route, ensure SDK session is initialized
			if (
				window.location?.pathname === '/buy' &&
				window.firmly?.appId &&
				window.firmly?.apiServer
			) {
				try {
					await initializeSDKSession(window.firmly.appId, window.firmly.apiServer);
				} catch (error) {
					// SDK session initialization failed - will retry on demand
				}
			}
		};

		// Remove existing global message listener if it exists
		if (globalMessageListener) {
			window.removeEventListener('message', globalMessageListener);
		}

		// Create new global message listener
		globalMessageListener = async (event) => {
			if (event.data.action === 'firmly::executeSessionTransfer') {
				if (event.data.transferPayload) {
					const storeId = event.data.merchant.store_id;
					// We exclude the merchant from `CartHive.get` call, as we will transfer the session below
					// And add it to the cartHive
					const cartHive = await CartHive.get([storeId]);
					const currentShippingInfo = cartHive.shipping_info;
					const customProperties = window.firmly.customProperties || null;

					try {
						window.parent.postMessage({ action: 'firmly:sessionTransfer:start' }, '*');
						await cartHive.sessionTransfer(storeId, event.data.transferPayload);

						if (customProperties) {
							await window.firmly.setCustomProperties(storeId, customProperties);
						}
					} catch (e) {
						console.error('Session transfer error', e);
					} finally {
						window.parent.postMessage({ action: 'firmly:sessionTransfer:end' }, '*');
					}

					if (currentShippingInfo) {
						try {
							window.parent.postMessage(
								{ action: 'firmly:setShippingInfo:start' },
								'*'
							);

							await cartHive.merchants[event.data.merchant.store_id].setShippingInfo(
								currentShippingInfo
							);
						} catch (e) {
							console.error('Set shipping info error', e);
						} finally {
							window.parent.postMessage(
								{ action: 'firmly:setShippingInfo:end' },
								'*'
							);
						}
					}
				}
			} else {
				try {
					const data = JSON.parse(event.data);
					if (data.action === 'firmlyCheckoutClosed') {
						console.log('firmly - closing the checkout');
						window.firmly?.callbacks?.onClose?.();

						if (window.firmly.dropinIframe && window.firmly.removeOnClose) {
							window.firmly.dropinIframe?.remove();
						}
						enableScroll();
					} else if (data.action === 'firmlyOrderPlaced') {
						console.log('firmly - order placed successfully');
						window.firmly?.callbacks?.onOrderPlaced?.(data.order);
					} else if (data.action === 'firmlyRequestStorage') {
						// Validate origin before responding with storage data
						if (!isValidDropinOrigin(event.origin)) {
							console.warn(
								'firmly - rejected storage request from invalid origin:',
								event.origin
							);
							return;
						}

						console.log('firmly - storage data requested for key:', data.key);
						const storageData = loadFromStorage(data.key);

						const response = JSON.stringify({
							action: 'firmlyStorageResponse',
							key: data.key,
							data: storageData
						});
						event.source.postMessage(response, event.origin);
					} else if (data.action === 'firmlySyncStorage') {
						// Validate origin before accepting storage data
						if (!isValidDropinOrigin(event.origin)) {
							console.warn(
								'firmly - rejected storage sync from invalid origin:',
								event.origin
							);
							return;
						}

						saveToStorage(data.key, data.data);
					} else if (data.action === 'firmly::requestJWT') {
						// Provide JWT to dropin when requested
						try {
							const token = await getApiAccessToken();
							if (token) {
								event.source.postMessage(
									{
										action: 'firmly::jwtResponse',
										token: token
									},
									'*'
								);
							}
						} catch (error) {
							console.warn('JWT provision failed:', error);
						}
					} else if (data.action === 'firmly::affiliateBuyButtonClick') {
						// Handle affiliate buy button click from mono-cte
						// Ensure telemetry is configured before tracking
						if (!window.firmly.telemetryServer && apiServer) {
							window.firmly.telemetryServer = `${apiServer}/api/v1/telemetry`;
						}
						if (!window.firmly.appId && appId) {
							window.firmly.appId = appId;
						}
						if (!window.firmly.sessionId) {
							const { sessionId } = sdkSessionManager.initializeSessionId();
							window.firmly.sessionId = sessionId;
						}

						// Track affiliate click and get IDs for dropin
						const { traceId, parentSpanId } = trackAffiliateClick(
							{
								store_info: data.storeInfo,
								affiliate_url: data.affiliate_url
							},
							{
								trace_id: data.trace_id,
								parent_span_id: data.parent_span_id
							}
						);

						// Save IDs for passing to dropin iframe
						window.firmly.traceId = traceId;
						window.firmly.parentSpanId = parentSpanId;
						return;
					}
				} catch (e) {
					//ignored
				}
			}
		};

		// Bind the global message listener
		bindEvent(window, 'message', globalMessageListener);

		if (uuidRegex.test(appId)) {
			// Initialize SDK session management for auto-initialization (non-blocking)
			initializeSDKSession(appId, apiServer).catch((error) => {
				console.warn('SDK auto-initialization failed:', error);
				initializationState.addError(error);
			});

			// If the condition does not match, the client must call init explicitely
			const initPromise = window.firmly.sdk.init({
				env: { apiServer },
				appId
			});

			initPromise
				.then(() => {
					initializationState.complete();
				})
				.catch((error) => {
					initializationState.addError(error);
				});

			return initPromise;
		} else {
			initializationState.complete();
		}
	}
}

bootstrap().catch((error) => {
	initializationState.addError(error);
});
