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
import {
	getApiAccessToken as getApiAccessTokenUtil,
	getAuthHeaders as getAuthHeadersUtil,
	SESSION_CONTEXT
} from '../utils/session-utils.js';

let sdkInitialized = false;

export async function getApiAccessToken() {
	return await getApiAccessTokenUtil(SESSION_CONTEXT.SDK, {
		onDeviceCreated: (sessionData) => {
			if (window.firmly) {
				window.firmly.deviceId = sessionData.device_id;
			}
		}
	});
}

export async function getHeaders() {
	return await getAuthHeadersUtil(SESSION_CONTEXT.SDK);
}

async function initializeSDKSession(appId, apiServer) {
	if (sdkInitialized) return;

	if (typeof window !== 'undefined') {
		initWindowFirmly();
		window.firmly.appId = appId;
		window.firmly.apiServer = apiServer;

		// Initialize session ID
		const { sessionId, isNew } = sdkSessionManager.initializeSessionId();
		if (window.firmly) {
			window.firmly.isNewSessionId = isNew;
		}

		// Initialize JWT in background without blocking
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
				console.warn('JWT initialization delayed:', error);
			});

		sdkInitialized = true;
	}
}

const uuidRegex =
	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/m;
const appId = '#F_APP_ID#';
const apiServer = '#F_API_SERVER#';
const isDropIn = '#F_DROP_IN#' || null;
const dropInUrl = '#F_DROPIN_URL#';
const apertureDomain = '#F_APERTURE_DOMAIN#';

//#region iFrame AutoCreation for Drop-in Checkout.

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
	document.body.style.position = 'fixed';
	document.body.style.top = `-${scrollY}px`;
	document.body.style.overflow = 'hidden';
	document.body.style.width = '100%';
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
	window.scrollTo({
		top: scrollY,
		left: 0,
		behavior: 'instant'
	});
	scrollDisabled = false;
}

function updateIFrame() {
	if (isDropIn) {
		if (!history.state?.firmlyCheckout) {
			enableScroll();
			if (window.firmly.dropin.iframe) {
				window.firmly.dropin.iframe.style.display = 'none';
			}
			if (window.firmly.dropin.onClose) {
				window.firmly.dropin.onClose();
			}
		} else {
			disableScroll();
			if (window.firmly.dropin.iframe) {
				// Iframe present, so send to iframe.
				window.firmly.dropin.iframe.style.display = 'block';
			}
		}
	}
}

window.onpopstate = () => {
	// We are keeping the iframe state as part
	// of the navigation state to allow the
	// back button to work seamessly for any website
	// including those who use shallow navigation.
	updateIFrame();
};

function openCheckoutWindow() {
	if (!history.state?.firmlyCheckout) {
		// Add history action to close the checkout with a back click
		history.pushState(
			{
				firmlyCheckout: true
			},
			''
		);
		updateIFrame();
	}
}

function monitorElements(inputSelectors, action) {
	const selector = inputSelectors.join(',');
	const elementWatcher = new MutationObserver((mutationList) => {
		mutationList.forEach((mutation) => {
			mutation.addedNodes?.forEach((element) => {
				if (element.matches?.(selector)) {
					action(element);
				}

				const targetElements = element.querySelectorAll?.(selector);
				targetElements?.forEach(action);
			});
			if (mutation.target.matches?.(selector)) {
				action(mutation.target);
			}
		});
	});

	elementWatcher.observe(document.body, { childList: true, subtree: true, attributes: true });

	const targetElements = document.querySelectorAll(selector);
	targetElements.forEach(action);
}

function initWindowFirmly() {
	window.firmly = window.firmly || {
		sdk: null,
		dropin: { iframe: null },
		customProperties: null
	};
}

function getWindowDropin() {
	initWindowFirmly();
	if (window.firmly.dropin) {
		return window.firmly.dropin;
	}
	window.firmly.dropin = { iframe: null };
	return window.firmly.dropin;
}

function setupDropinCheckout(dropinUrl) {
	const dropin = getWindowDropin();

	if (dropinUrl && dropin.iframe == null) {
		const iframe = document.createElement('iframe');
		iframe.frameborder = '0';
		iframe.id = 'firmlydropincheckout';
		iframe.style =
			'position:fixed; top:0; left:0; height:100%; width:100%; display:none; z-index:9999999; border: 0';

		const url = new URL(dropinUrl);
		url.searchParams.set('_appId', appId);
		iframe.src = url.href;

		iframe.allow = 'payment';
		dropin.iframe = iframe;
		document.body.appendChild(iframe);
	}
}
//#endregion

// Cart UI
let isOpen = false; /* default */

async function defaultCallback() {
	// function to be a placeholder for callbacks
}

export function subscribe(action, status, fn, context = window) {
	bindEvent(context, 'message', (event) => {
		// TODO: Enable it for security reasons in future
		// if (event.origin !== origin) {
		//     return;
		// }
		if (event.data.action === `firmly:${action}:${status}`) {
			fn(event);
		}
	});
}

export async function bootstrap() {
	if (typeof window === 'undefined') {
		console.error('Window is undefined');
		return;
	}

	// Start initialization state tracking
	initializationState.start({ source: 'bootstrap' });
	initializationState.setState(INITIALIZATION_STATES.SDK_LOADING);

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
						return await sdkSessionManager.refreshSession(
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

				initializationState.setState(INITIALIZATION_STATES.SDK_INITIALIZING, {
					appId: config.appId,
					apiServer: config.env.apiServer
				});

				// Initialize SDK session management first
				await initializeSDKSession(config.appId, config.env.apiServer);

				initializationState.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);

				// Then initialize the dropin system
				await initialize(config.appId, config.env.apiServer);

				if (config.isDropIn) {
					setupDropinCheckout(config.dropInUrl);
				}

				initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
			},
			CartUI: {
				openCart: async function () {
					if (!isOpen) {
						window.parent.postMessage({ action: 'firmly:openCart:trigger' }, '*');
						if (!window.firmly.sdk.CartUI.hasAnimation) {
							window.parent.postMessage({ action: 'firmly:openCart:start' }, '*');
							window.parent.postMessage({ action: 'firmly:openCart:end' }, '*');
						}
					}
				},

				closeCart: async function () {
					if (isOpen) {
						window.parent.postMessage({ action: 'firmly:closeCart:trigger' }, '*');
						if (!window.firmly.sdk.CartUI.hasAnimation) {
							window.parent.postMessage({ action: 'firmly:closeCart:start' }, '*');
							window.parent.postMessage({ action: 'firmly:closeCart:end' }, '*');
						}
					}
				},

				onOpenCart: function (status = 'end', cb = defaultCallback, context) {
					subscribe(
						'openCart',
						status,
						async () => {
							if (status === 'trigger') {
								window.parent.postMessage({ action: 'firmly:openCart:start' }, '*');
								await cb();
								window.parent.postMessage({ action: 'firmly:openCart:end' }, '*');
							} else {
								await cb();
							}
						},
						context
					);
				},

				onCloseCart: function (status = 'end', cb = defaultCallback, context) {
					subscribe(
						'closeCart',
						status,
						async () => {
							if (status === 'trigger') {
								window.parent.postMessage(
									{ action: 'firmly:closeCart:start' },
									'*'
								);
								await cb();
								window.parent.postMessage({ action: 'firmly:closeCart:end' }, '*');
							} else {
								await cb();
							}
						},
						context
					);
				},

				async toggleCart() {
					isOpen ? await this.closeCart() : await this.openCart();
					return isOpen;
				}
			},
			CheckoutUI: {
				hookUp(inputSelectors, getStoreInfo = null) {
					monitorElements(inputSelectors, (el) => {
						el.onclick = (e) => {
							e.stopImmediatePropagation();
							console.log('add to cart clicked:', el.href, e);
							openCheckoutWindow();
							let storeInfo = null;
							if (getStoreInfo) {
								storeInfo = getStoreInfo(el.href);
							}
							const jData = JSON.stringify({
								action: 'addToCart',
								storeInfo: storeInfo,
								transfer: { handle: 'url:' + el.href }
							});
							console.log('sending jData:', jData);
							window.firmly.dropin.iframe.contentWindow.postMessage(jData, '*');
							return false;
						};
					});
				},
				open() {
					openCheckoutWindow();
				}
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

			const dropinBuyNowUrl = new URL(dropInUrl);
			dropinBuyNowUrl.pathname = '/buy';
			dropinBuyNowUrl.searchParams.set('_appId', appId);

			if (checkoutConfig.pdp_url) {
				dropinBuyNowUrl.searchParams.set('url', checkoutConfig.pdp_url);
			}
			if (checkoutConfig.ui_mode) {
				dropinBuyNowUrl.searchParams.set('ui_mode', checkoutConfig.ui_mode);
			}
			if (checkoutConfig.skip_pdp) {
				dropinBuyNowUrl.searchParams.set('skip_pdp', checkoutConfig.skip_pdp);
			}
			if (checkoutConfig.custom_properties) {
				dropinBuyNowUrl.searchParams.set(
					'custom_properties',
					JSON.stringify(checkoutConfig.custom_properties)
				);
				window.firmly.customProperties = checkoutConfig.custom_properties;
			}

			window.firmly.removeOnClose = checkoutConfig.remove_on_close || false;

			if (checkoutConfig.mode === 'minimal-pdp') {
				console.log('firmly - minimal pdp mode');
				window.firmly.dropinIframe = createIframe(
					dropinBuyNowUrl.toString(),
					checkoutConfig
				);
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
					console.error('Failed to initialize SDK session for /buy route:', error);
				}
			}
		};

		bindEvent(window, 'message', async (event) => {
			if (event.data.action === 'firmly::executeSessionTransfer') {
				window.firmly.sdk.CartUI.openCart();

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
					} else if (data.action === 'firmlyOrderPlaced') {
						console.log('firmly - order placed successfully');
						window.firmly?.callbacks?.onOrderPlaced?.(data.order);
					} else if (data.action === 'firmly::addToCart') {
						console.log('firmly - add to cart clicked', event);
						window.firmly.dropinIframe.style.display = 'block';
						window.firmly.dropinIframe.contentWindow.postMessage(event.data, '*');
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
							console.error('Failed to provide JWT to dropin:', error);
						}
					}
				} catch (e) {
					//ignored
				}
			}
		});

		window.firmly.sdk.CartUI.onOpenCart('end', function () {
			isOpen = true;
		});
		window.firmly.sdk.CartUI.onCloseCart('end', function () {
			isOpen = false;
		});

		if (uuidRegex.test(appId)) {
			// Initialize SDK session management for auto-initialization (non-blocking)
			initializeSDKSession(appId, apiServer).catch((error) => {
				console.error('Failed to initialize SDK session:', error);
				initializationState.addError(error, { source: 'auto-init' });
			});

			// If the condition does not match, the client must call init explicitely
			const initPromise = window.firmly.sdk.init({
				env: { apiServer },
				appId,
				isDropIn,
				dropInUrl
			});

			initPromise
				.then(() => {
					initializationState.complete({ source: 'bootstrap' });
				})
				.catch((error) => {
					initializationState.addError(error, { source: 'bootstrap' });
				});

			return initPromise;
		} else {
			initializationState.complete({ source: 'bootstrap', skipped: true });
		}
	}
}

bootstrap().catch((error) => {
	console.error('Bootstrap initialization error:', error);
});
