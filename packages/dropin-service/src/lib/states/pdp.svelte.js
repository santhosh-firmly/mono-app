import { getBuyNow } from './buy-now.svelte.js';
import { getCheckout } from './checkout/index.svelte.js';
import { getClickToPay } from './click-to-pay.svelte.js';
import { initialize, setAppVersion, setDomain } from '$lib/services/browser-api.js';
import { config } from '$lib/utils/config.js';
import { track, EVENT_TYPE_UX } from '$lib/services/telemetry.js';
import { onMessageAction } from '$lib/utils/message-transport.js';
import { fetchProductDetails } from '$lib/services/domain.js';
import * as pdpUtils from '$lib/utils/pdp-utils.js';
import * as cartService from '$lib/services/cart.js';
import { setAttribution, setCustomProperties } from '$lib/services/attribution.js';

const PDP_MAX_WAIT_TIMEOUT = 10000;
const BYPASS_CATALOG_API_MERCHANTS = ['test.victoriassecret.com', 'dermstore.com'];

/**
 * PDP state managing product display page iframe and checkout flow initiation.
 * Handles iframe rendering, product URL parsing, cart session transfers,
 * and navigation between PDP and checkout views.
 *
 * @property {boolean} showIframe - Whether to display the PDP iframe
 * @property {number} iframeHeight - Height of the PDP iframe in pixels
 * @property {string} iframeVisibility - CSS visibility state ('hidden' | 'visible')
 * @property {string} iframeUrl - URL to load in the PDP iframe
 * @property {string} productUrl - Original product URL
 * @property {Object|null} customProperties - Custom properties from the merchant
 * @property {string} apertureDomain - Aperture service domain for iframe URLs
 *
 * @method setIframeHeight - Sets the iframe height (only if not already set)
 * @method setIframeVisible - Makes iframe visible and tracks load event
 * @method initialize - Initializes PDP with app data and URL params
 * @method initiateFlow - Starts checkout flow based on URL parameters
 * @method initiateCheckoutByUrl - Initiates checkout from a product URL
 * @method showPdpIframe - Displays the PDP iframe with timeout fallback
 * @method setupIframeMessageHandler - Sets up iframe message listeners
 * @method handleCartSessionTransfer - Handles cart transfer from iframe
 * @method addToCartAndCheckout - Adds item to cart and proceeds to checkout
 * @method setAttributionFromUrl - Sets attribution data from product URL
 * @method goBack - Navigates back to PDP iframe or closes
 * @method close - Closes the checkout flow
 */
class Pdp {
	showIframe = $state(false);
	iframeHeight = $state(0);
	iframeVisibility = $state('hidden');
	iframeUrl = $state('');
	productUrl = $state('');
	customProperties = $state(null);
	apertureDomain = $state('');

	setIframeHeight(height) {
		if (this.iframeHeight === 0) this.iframeHeight = height;
	}

	setIframeVisible() {
		this.iframeVisibility = 'visible';
		track('pdp_loaded', EVENT_TYPE_UX);
	}

	async initialize(data, version, urlParams) {
		const checkout = getCheckout();
		const buyNow = getBuyNow();

		await initialize(data.PUBLIC_api_id, data.PUBLIC_cf_server, data.merchantDomain);
		setAppVersion(version);

		this.apertureDomain = data.PUBLIC_aperture_domain;
		checkout.domain = data.merchantDomain;

		buyNow.setupLayout(urlParams.get('ui_mode') || 'fullscreen');
		this.setupIframeMessageHandler();

		const c2p = getClickToPay();
		await c2p.initialize(data);
		await this.initiateFlow(data, urlParams);
	}

	async initiateFlow(data, urlParams) {
		const buyNow = getBuyNow();
		const checkout = getCheckout();
		const productUrl = urlParams.get('url');
		const flushCart = urlParams.get('flush_cart') !== 'false';

		try {
			if (productUrl) {
				await this.initiateCheckoutByUrl(productUrl, flushCart, urlParams);
			} else {
				const variantId = urlParams.get('variant_id');
				const domain = urlParams.get('domain')?.replace(/^www\./, '');
				const quantity = parseInt(urlParams.get('quantity') || '1', 10);

				checkout.setPending('cart', true);
				buyNow.goToCheckout();

				if (domain && variantId) {
					setDomain(domain);
					checkout.domain = domain;
					await this.addToCartAndCheckout(variantId, quantity, [], flushCart);
				} else if (domain) {
					setDomain(domain);
					checkout.domain = domain;
					await checkout.loadCart(domain);
				} else {
					await checkout.loadCart(data.merchantDomain);
				}
			}
		} catch (error) {
			buyNow.setError(error, 'Failed to start checkout flow');
		}
	}

	async initiateCheckoutByUrl(productUrl, flushCart, urlParams) {
		const buyNow = getBuyNow();
		const checkout = getCheckout();
		const forcePdp = urlParams.get('force_pdp') === 'true';
		const skipCatalogApi =
			forcePdp || pdpUtils.shouldBypassCatalogApi(productUrl, BYPASS_CATALOG_API_MERCHANTS);

		if (skipCatalogApi) {
			this.showPdpIframe(productUrl);
			return;
		}

		try {
			const productDetails = await fetchProductDetails(productUrl, config);

			if (pdpUtils.hasMultipleVariants(productDetails)) {
				this.showPdpIframe(productUrl);
			} else {
				const variant = pdpUtils.getFirstAvailableVariant(productDetails);
				if (variant) {
					const domain = pdpUtils.extractMerchantDomain(productUrl);
					if (domain) {
						setDomain(domain);
						checkout.domain = domain;
						await this.addToCartAndCheckout(variant.sku, 1, [], flushCart);
					}
				} else {
					throw new Error('No available variants found');
				}
			}
		} catch (error) {
			buyNow.setError(error, 'Unable to find this product');
		}
	}

	showPdpIframe(url) {
		const buyNow = getBuyNow();
		this.productUrl = url;
		this.iframeUrl = pdpUtils.buildPdpIframeUrl(url, this.apertureDomain);
		this.showIframe = true;
		this.iframeVisibility = 'hidden';
		buyNow.goToPdp();

		setTimeout(() => {
			if (this.iframeVisibility !== 'visible') {
				this.iframeVisibility = 'visible';
				track('pdp_showed_by_timeout', EVENT_TYPE_UX);
			}
		}, PDP_MAX_WAIT_TIMEOUT);
	}

	setupIframeMessageHandler() {
		onMessageAction('firmly::adjustSize', (data) => {
			this.setIframeHeight(data.data?.height || 0);
		});

		onMessageAction('firmly::onDOMContentLoaded', () => {
			this.setIframeVisible();
		});

		onMessageAction('firmly::addToCart', async (data) => {
			const checkout = getCheckout();
			if (data.store_id) {
				setDomain(data.store_id);
				checkout.domain = data.store_id;
			}
			if (data.custom_properties) this.customProperties = data.custom_properties;
			await this.handleCartSessionTransfer(data.transfer);
		});

		onMessageAction('firmly::telemetry', (data) => {
			track('aperture_event', EVENT_TYPE_UX, data.data);
		});
	}

	async handleCartSessionTransfer(transferPayload) {
		const checkout = getCheckout();
		const data = await this.#executeCartOperation(
			() => cartService.cartSessionTransfer(transferPayload, checkout.domain),
			'Failed to transfer cart. Please try again.',
			() => {
				this.showIframe = false;
				this.iframeVisibility = 'hidden';
			}
		);

		if (data) {
			if (this.productUrl) await this.setAttributionFromUrl(this.productUrl);
			if (this.customProperties && data.shop_id) {
				await setCustomProperties(data.shop_id, this.customProperties);
			}
		}
	}

	async addToCartAndCheckout(sku, quantity, options, flushCart) {
		const checkout = getCheckout();
		await this.#executeCartOperation(
			() => cartService.cartAddLineItem(sku, quantity, options, checkout.domain, flushCart),
			'Failed to add item to cart'
		);
	}

	async setAttributionFromUrl(url) {
		try {
			const urlObj = new URL(url);
			await setAttribution({
				utm: urlObj.search,
				referrer_url: document.referrer,
				landing_page: urlObj.toString()
			});
		} catch {
			// Silent fail for attribution
		}
	}

	goBack() {
		const buyNow = getBuyNow();
		if (this.productUrl) {
			this.iframeVisibility = 'hidden';
			this.showIframe = true;
			buyNow.goToPdp();
		} else {
			this.close();
		}
		track('checkout_back_clicked', EVENT_TYPE_UX);
	}

	close() {
		const checkout = getCheckout();
		checkout.close();
	}

	async #executeCartOperation(operation, errorMessage, beforeOperation) {
		const buyNow = getBuyNow();
		const checkout = getCheckout();
		checkout.setPending('cart', true);
		buyNow.goToCheckout();
		if (beforeOperation) beforeOperation();

		try {
			const result = await operation();
			if (result?.status === 200) {
				checkout.setCart(result.data);
				return result.data;
			}
			throw new Error(errorMessage);
		} catch (error) {
			buyNow.setError(error, errorMessage);
		} finally {
			checkout.setPending('cart', false);
		}
	}
}

let instance = null;

export function initializePdp() {
	instance = new Pdp();
	return instance;
}

export function getPdp() {
	if (!instance) throw new Error('Pdp not initialized');
	return instance;
}

export function resetPdp() {
	instance = null;
}
