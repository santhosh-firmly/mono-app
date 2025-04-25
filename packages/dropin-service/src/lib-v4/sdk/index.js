// @ts-nocheck
// import { version } from '../../../package.json';
import { initialize } from '../browser/api-firmly.js';
import { bindEvent } from '../browser/dash.js';
import { CartHive } from './cart-hive.js';
import { Cart } from './cart.js';
import { getAllOrders } from './orders.js';

const uuidRegex =
	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/m;
const appId = '#F_APP_ID#';
const apiServer = '#F_API_SERVER#';
const isDropIn = '#F_DROP_IN#' || null;
const dropInUrl = '#F_DROPIN_URL#';

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
	window.firmly = window.firmly || { sdk: null, dropin: { iframe: null } };
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
		iframe.src = dropinUrl;
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

export function bootstrap() {
	if (typeof window === 'undefined') {
		console.error('Window is undefined');
		return;
	}

	initWindowFirmly();

	if (!window.firmly.sdk) {
		window.firmly.sdk = {
			Orders: {
				getAllOrders
			},
			Cart,
			CartHive,
			init: async (config) => {
				if (!config) {
					throw new Error('Please specify the init configuration');
				}

				if (!config.env?.apiServer) {
					throw new Error('Please specify the environment and API server');
				}

				if (!config.appId || !uuidRegex.test(appId)) {
					throw new Error('Please specify a valid appId');
				}

				await initialize(config.appId, config.env.apiServer);

				if (config.isDropIn) {
					setupDropinCheckout(config.dropInUrl);
				}
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

		window.firmly.buyNow = function (checkoutConfig) {
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

			if (checkoutConfig.mode === 'minimal-pdp') {
				console.log('firmly - minimal pdp mode');
				dropinBuyNowUrl.searchParams.set('url', checkoutConfig.pdp_url);
				dropinBuyNowUrl.searchParams.set('ui_mode', checkoutConfig.ui_mode);
				dropinBuyNowUrl.searchParams.set('skip_pdp', checkoutConfig.skip_pdp);
				dropinBuyNowUrl.searchParams.set(
					'custom_properties',
					checkoutConfig.custom_properties
				);
				window.firmly.dropinIframe = createIframe(
					dropinBuyNowUrl.toString(),
					checkoutConfig
				);
				window.firmly.dropinIframe.style.display = 'block';
			} else if (checkoutConfig.mode === 'full-pdp') {
				console.log('firmly - full pdp mode');
				const pdpUrl = new URL(checkoutConfig.pdp_url);
				pdpUrl.hostname = 'firmlydev.firmly.dev';
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

					try {
						window.parent.postMessage({ action: 'firmly:sessionTransfer:start' }, '*');
						await cartHive.sessionTransfer(storeId, event.data.transferPayload);
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
						// @ts-ignore - creative exists inside of Celtra ecosystem
						window.firmly?.callbacks?.onClose?.();

						if (window.firmly.dropinIframe) {
							window.firmly.dropinIframe.style.display = 'none';
						}

						// Now it will be called by the onClose callback
						// window.creative.adapter.collapse();
					} else if (data.action === 'firmly::addToCart') {
						console.log('firmly - add to cart clicked', event);
						window.firmly.dropinIframe.style.display = 'block';
						window.firmly.dropinIframe.contentWindow.postMessage(event.data, '*');
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
			// If the condition does not match, the client must call init explicitely
			return window.firmly.sdk.init({ env: { apiServer }, appId, isDropIn, dropInUrl });
		}
	}
}

bootstrap();
