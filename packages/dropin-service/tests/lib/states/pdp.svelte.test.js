import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import {
	createMockTelemetry,
	createMockCart,
	createMockMessageTransport,
	createMockValidationMessages,
	createMockBrowserApi,
	createMockConfig,
	createMockDomain,
	createMockAttribution,
	createMockClickToPayState
} from '../__mock__/mock-factories.js';

vi.mock('$lib/services/telemetry.js', () => createMockTelemetry());
vi.mock('$lib/services/browser-api.js', () => createMockBrowserApi());
vi.mock('$lib/utils/config.js', () => ({
	config: createMockConfig({ apertureDomain: 'firmly.ai' }),
	buildDomainUrl: vi.fn(
		(suffix, domain) => `https://api.firmly.ai/api/v1/domains/${domain || 'test.com'}/${suffix}`
	)
}));
vi.mock('$lib/utils/message-transport.js', () => createMockMessageTransport());
vi.mock('$lib/services/domain.js', () => createMockDomain());
vi.mock('$lib/services/cart.js', () => createMockCart());
vi.mock('$lib/services/attribution.js', () => createMockAttribution());
vi.mock('$lib/states/click-to-pay.svelte.js', () => createMockClickToPayState());
vi.mock('$lib/paraglide/messages', () => createMockValidationMessages());

import { initializePdp, getPdp, resetPdp } from '$lib/states/pdp.svelte.js';
import { initializeBuyNow, resetBuyNow, getBuyNow } from '$lib/states/buy-now.svelte.js';
import { initializeCheckout, resetCheckout } from '$lib/states/checkout/index.svelte.js';
import { track } from '$lib/services/telemetry.js';
import { cartSessionTransfer, cartAddLineItem } from '$lib/services/cart.js';
import { fetchProductDetails } from '$lib/services/domain.js';
import { setAttribution, setCustomProperties } from '$lib/services/attribution.js';
import { onMessageAction } from '$lib/utils/message-transport.js';

describe('pdp state', () => {
	beforeEach(() => {
		resetBuyNow();
		resetCheckout();
		resetPdp();
		initializeBuyNow();
		initializeCheckout({ domain: 'test.com' });
	});

	afterEach(() => {
		resetPdp();
		resetCheckout();
		resetBuyNow();
	});

	describe('initializePdp', () => {
		it('creates pdp instance with default values', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				expect(pdp.showIframe).toBe(false);
				expect(pdp.iframeHeight).toBe(0);
				expect(pdp.iframeVisibility).toBe('hidden');
				expect(pdp.iframeUrl).toBe('');
				expect(pdp.productUrl).toBe('');
			});
			cleanup();
		});
	});

	describe('getPdp', () => {
		it('returns initialized pdp instance', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				expect(getPdp()).toBe(pdp);
			});
			cleanup();
		});

		it('throws when pdp not initialized', () => {
			expect(() => getPdp()).toThrow('Pdp not initialized');
		});
	});

	describe('setIframeHeight', () => {
		it('sets iframe height only on first call', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				pdp.setIframeHeight(500);
				flushSync();
				expect(pdp.iframeHeight).toBe(500);

				pdp.setIframeHeight(600);
				flushSync();
				expect(pdp.iframeHeight).toBe(500);
			});
			cleanup();
		});
	});

	describe('setIframeVisible', () => {
		it('sets iframe visibility to visible', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				pdp.setIframeVisible();
				flushSync();

				expect(pdp.iframeVisibility).toBe('visible');
			});
			cleanup();
		});
	});

	describe('showPdpIframe', () => {
		it('sets up iframe with product URL', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				pdp.apertureDomain = 'firmly.in';

				pdp.showPdpIframe('https://store.myshopify.com/products/item');
				flushSync();

				expect(pdp.productUrl).toBe('https://store.myshopify.com/products/item');
				expect(pdp.iframeUrl).toBe('https://store.firmly.in/products/item');
				expect(pdp.showIframe).toBe(true);
				expect(pdp.iframeVisibility).toBe('hidden');
			});
			cleanup();
		});
	});

	describe('goBack', () => {
		it('navigates to pdp when productUrl exists', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				const buyNow = getBuyNow();

				pdp.productUrl = 'https://example.com/product';
				pdp.goBack();
				flushSync();

				expect(buyNow.mode).toBe('pdp');
			});
			cleanup();
		});

		it('closes when no productUrl', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				const buyNow = getBuyNow();

				pdp.goBack();
				flushSync();

				expect(buyNow.isLayoutActive).toBe(false);
			});
			cleanup();
		});
	});

	describe('close', () => {
		it('sets buyNow isLayoutActive to false', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				const buyNow = getBuyNow();

				pdp.close();
				flushSync();

				expect(buyNow.isLayoutActive).toBe(false);
			});
			cleanup();
		});
	});

	describe('addToCartAndCheckout', () => {
		it('adds item to cart and navigates to checkout', async () => {
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});

			await pdp.addToCartAndCheckout('SKU123', 2, [], true);

			expect(cartAddLineItem).toHaveBeenCalledWith('SKU123', 2, [], 'test.com', true);
			expect(buyNow.mode).toBe('checkout');
			cleanup();
		});

		it('handles cart error gracefully', async () => {
			cartAddLineItem.mockRejectedValueOnce(new Error('Network error'));
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});

			await pdp.addToCartAndCheckout('SKU123', 1, [], true);

			expect(buyNow.mode).toBe('error');
			cleanup();
		});

		it('handles non-200 status', async () => {
			cartAddLineItem.mockResolvedValueOnce({ status: 400 });
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});

			await pdp.addToCartAndCheckout('SKU123', 1, [], true);

			expect(buyNow.mode).toBe('error');
			cleanup();
		});
	});

	describe('handleCartSessionTransfer', () => {
		it('transfers cart session and navigates to checkout', async () => {
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});

			await pdp.handleCartSessionTransfer({ session: 'data' });

			expect(cartSessionTransfer).toHaveBeenCalledWith({ session: 'data' }, 'test.com');
			expect(buyNow.mode).toBe('checkout');
			cleanup();
		});

		it('sets attribution when productUrl exists', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				pdp.productUrl = 'https://example.com/product?utm_source=google';
			});

			await pdp.handleCartSessionTransfer({ session: 'data' });

			expect(setAttribution).toHaveBeenCalled();
			cleanup();
		});

		it('sets custom properties when present', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				pdp.customProperties = { color: 'red' };
			});

			await pdp.handleCartSessionTransfer({ session: 'data' });

			expect(setCustomProperties).toHaveBeenCalledWith('shop123', { color: 'red' });
			cleanup();
		});

		it('handles transfer error', async () => {
			cartSessionTransfer.mockRejectedValueOnce(new Error('Transfer failed'));
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});

			await pdp.handleCartSessionTransfer({ session: 'data' });

			expect(buyNow.mode).toBe('error');
			cleanup();
		});

		it('handles non-200 status in transfer', async () => {
			cartSessionTransfer.mockResolvedValueOnce({ status: 400 });
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});

			await pdp.handleCartSessionTransfer({ session: 'data' });

			expect(buyNow.mode).toBe('error');
			cleanup();
		});

		it('does not set custom properties when shop_id is missing', async () => {
			cartSessionTransfer.mockResolvedValueOnce({ status: 200, data: { items: [] } });
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				pdp.customProperties = { color: 'red' };
				setCustomProperties.mockClear();
			});

			await pdp.handleCartSessionTransfer({ session: 'data' });

			expect(setCustomProperties).not.toHaveBeenCalled();
			cleanup();
		});
	});

	describe('setAttributionFromUrl', () => {
		it('sets attribution from valid URL', async () => {
			const originalReferrer = Object.getOwnPropertyDescriptor(
				Document.prototype,
				'referrer'
			);
			Object.defineProperty(document, 'referrer', {
				value: 'https://google.com',
				configurable: true
			});

			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});

			await pdp.setAttributionFromUrl('https://example.com/product?utm_source=test');

			expect(setAttribution).toHaveBeenCalledWith(
				expect.objectContaining({
					utm: '?utm_source=test',
					referrer_url: 'https://google.com'
				})
			);
			cleanup();

			if (originalReferrer) {
				Object.defineProperty(document, 'referrer', originalReferrer);
			}
		});

		it('handles invalid URL silently', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});

			await pdp.setAttributionFromUrl('not-a-valid-url');
			cleanup();
		});
	});

	describe('setupIframeMessageHandler', () => {
		it('registers message handlers', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				pdp.setupIframeMessageHandler();

				expect(onMessageAction).toHaveBeenCalledWith(
					'firmly::adjustSize',
					expect.any(Function)
				);
				expect(onMessageAction).toHaveBeenCalledWith(
					'firmly::onDOMContentLoaded',
					expect.any(Function)
				);
				expect(onMessageAction).toHaveBeenCalledWith(
					'firmly::addToCart',
					expect.any(Function)
				);
				expect(onMessageAction).toHaveBeenCalledWith(
					'firmly::telemetry',
					expect.any(Function)
				);
			});
			cleanup();
		});

		it('handles addToCart message with store_id', async () => {
			const { setDomain } = await import('$lib/services/browser-api.js');
			onMessageAction.mockClear();
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				pdp.setupIframeMessageHandler();
			});

			const addToCartHandler = onMessageAction.mock.calls.find(
				(call) => call[0] === 'firmly::addToCart'
			)?.[1];

			if (addToCartHandler) {
				await addToCartHandler({
					store_id: 'new-store.com',
					transfer: { session: 'data' }
				});

				expect(setDomain).toHaveBeenCalledWith('new-store.com');
			}
			cleanup();
		});

		it('handles addToCart message with custom_properties', async () => {
			onMessageAction.mockClear();
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				pdp.setupIframeMessageHandler();
			});

			const addToCartHandler = onMessageAction.mock.calls.find(
				(call) => call[0] === 'firmly::addToCart'
			)?.[1];

			if (addToCartHandler) {
				await addToCartHandler({
					custom_properties: { size: 'large' },
					transfer: { session: 'data' }
				});

				expect(pdp.customProperties).toEqual({ size: 'large' });
			}
			cleanup();
		});

		it('handles telemetry message', () => {
			onMessageAction.mockClear();
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				pdp.setupIframeMessageHandler();

				const telemetryHandler = onMessageAction.mock.calls.find(
					(call) => call[0] === 'firmly::telemetry'
				)?.[1];

				if (telemetryHandler) {
					telemetryHandler({ data: { event: 'click', element: 'button' } });

					expect(track).toHaveBeenCalledWith('aperture_event', 'ux', {
						event: 'click',
						element: 'button'
					});
				}
			});
			cleanup();
		});
	});

	describe('initiateCheckoutByUrl', () => {
		it('shows iframe for force_pdp param', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams('force_pdp=true');

			await pdp.initiateCheckoutByUrl('https://store.com/product', true, urlParams);

			expect(pdp.showIframe).toBe(true);
			cleanup();
		});

		it('shows iframe for bypass catalog merchants', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateCheckoutByUrl(
				'https://test.victoriassecret.com/product',
				true,
				urlParams
			);

			expect(pdp.showIframe).toBe(true);
			cleanup();
		});

		it('fetches product details for normal URLs', async () => {
			fetchProductDetails.mockResolvedValueOnce({
				variants: [{ sku: 'SKU1', available: true }]
			});
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateCheckoutByUrl(
				'https://store.myshopify.com/products/item',
				true,
				urlParams
			);

			expect(fetchProductDetails).toHaveBeenCalled();
			cleanup();
		});

		it('shows iframe for products with multiple variants', async () => {
			fetchProductDetails.mockResolvedValueOnce({
				variants: [
					{ sku: 'SKU1', available: true },
					{ sku: 'SKU2', available: true }
				]
			});
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateCheckoutByUrl(
				'https://store.myshopify.com/products/item',
				true,
				urlParams
			);

			expect(pdp.showIframe).toBe(true);
			cleanup();
		});

		it('adds single variant product to cart directly', async () => {
			fetchProductDetails.mockResolvedValueOnce({
				variants: [{ sku: 'SKU1', available: true }]
			});
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateCheckoutByUrl(
				'https://store.myshopify.com/products/item',
				true,
				urlParams
			);

			expect(cartAddLineItem).toHaveBeenCalled();
			cleanup();
		});

		it('throws error when no available variants', async () => {
			fetchProductDetails.mockResolvedValueOnce({
				variants: [{ sku: 'SKU1', available: false }]
			});
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateCheckoutByUrl(
				'https://store.myshopify.com/products/item',
				true,
				urlParams
			);

			expect(buyNow.mode).toBe('error');
			cleanup();
		});

		it('handles fetchProductDetails error', async () => {
			fetchProductDetails.mockRejectedValueOnce(new Error('Network error'));
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateCheckoutByUrl(
				'https://store.myshopify.com/products/item',
				true,
				urlParams
			);

			expect(buyNow.mode).toBe('error');
			cleanup();
		});
	});

	describe('initiateFlow', () => {
		it('initiates checkout by URL when productUrl provided', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams('url=https://store.com/product&force_pdp=true');

			await pdp.initiateFlow({}, urlParams);

			expect(pdp.showIframe).toBe(true);
			cleanup();
		});

		it('loads cart when domain provided without variant', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams('domain=store.com');

			await pdp.initiateFlow({ merchantDomain: 'default.com' }, urlParams);
			cleanup();
		});

		it('adds to cart when domain and variant provided', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams('domain=store.com&variant_id=VAR123&quantity=2');

			await pdp.initiateFlow({}, urlParams);

			expect(cartAddLineItem).toHaveBeenCalled();
			cleanup();
		});

		it('loads cart with merchantDomain when no domain or url provided', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams();

			await pdp.initiateFlow({ merchantDomain: 'default.com' }, urlParams);
			cleanup();
		});

		it('handles flush_cart=false parameter', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams(
				'domain=store.com&variant_id=VAR123&flush_cart=false'
			);

			await pdp.initiateFlow({}, urlParams);

			expect(cartAddLineItem).toHaveBeenCalledWith(
				'VAR123',
				1,
				[],
				expect.any(String),
				false
			);
			cleanup();
		});

		it('strips www from domain parameter', async () => {
			let pdp;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
			});
			const urlParams = new URLSearchParams('domain=www.store.com&variant_id=VAR123');

			await pdp.initiateFlow({}, urlParams);

			expect(cartAddLineItem).toHaveBeenCalled();
			cleanup();
		});

		it('handles error in checkout flow', async () => {
			cartAddLineItem.mockRejectedValueOnce(new Error('Flow error'));
			let pdp, buyNow;
			const cleanup = $effect.root(() => {
				pdp = initializePdp();
				buyNow = getBuyNow();
			});
			const urlParams = new URLSearchParams('domain=store.com&variant_id=VAR123');

			await pdp.initiateFlow({}, urlParams);

			expect(buyNow.mode).toBe('error');
			cleanup();
		});
	});

	describe('goBack tracking', () => {
		it('tracks checkout_back_clicked event', () => {
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				pdp.goBack();

				expect(track).toHaveBeenCalledWith('checkout_back_clicked', 'ux');
			});
			cleanup();
		});
	});

	describe('showPdpIframe timeout', () => {
		it('shows iframe by timeout if not already visible', () => {
			vi.useFakeTimers();
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				pdp.showPdpIframe('https://store.myshopify.com/products/item');
				flushSync();

				expect(pdp.iframeVisibility).toBe('hidden');

				vi.advanceTimersByTime(10000);
				flushSync();

				expect(pdp.iframeVisibility).toBe('visible');
				expect(track).toHaveBeenCalledWith('pdp_showed_by_timeout', 'ux');
			});
			cleanup();
			vi.useRealTimers();
		});

		it('does not override visibility if already visible', () => {
			vi.useFakeTimers();
			track.mockClear();
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();

				pdp.showPdpIframe('https://store.myshopify.com/products/item');
				flushSync();

				pdp.setIframeVisible();
				flushSync();

				track.mockClear();
				vi.advanceTimersByTime(10000);
				flushSync();

				expect(track).not.toHaveBeenCalledWith('pdp_showed_by_timeout', 'ux');
			});
			cleanup();
			vi.useRealTimers();
		});
	});

	describe('iframe message handlers', () => {
		it('handles adjustSize message correctly', () => {
			onMessageAction.mockClear();
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				pdp.setupIframeMessageHandler();

				const adjustSizeHandler = onMessageAction.mock.calls.find(
					(call) => call[0] === 'firmly::adjustSize'
				)?.[1];

				if (adjustSizeHandler) {
					adjustSizeHandler({ data: { height: 500 } });
					flushSync();

					expect(pdp.iframeHeight).toBe(500);
				}
			});
			cleanup();
		});

		it('handles onDOMContentLoaded message correctly', () => {
			onMessageAction.mockClear();
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				pdp.setupIframeMessageHandler();

				const domLoadedHandler = onMessageAction.mock.calls.find(
					(call) => call[0] === 'firmly::onDOMContentLoaded'
				)?.[1];

				if (domLoadedHandler) {
					domLoadedHandler();
					flushSync();

					expect(pdp.iframeVisibility).toBe('visible');
					expect(track).toHaveBeenCalledWith('pdp_loaded', 'ux');
				}
			});
			cleanup();
		});

		it('handles adjustSize with missing height', () => {
			onMessageAction.mockClear();
			const cleanup = $effect.root(() => {
				const pdp = initializePdp();
				pdp.setupIframeMessageHandler();

				const adjustSizeHandler = onMessageAction.mock.calls.find(
					(call) => call[0] === 'firmly::adjustSize'
				)?.[1];

				if (adjustSizeHandler) {
					adjustSizeHandler({ data: {} });
					flushSync();

					expect(pdp.iframeHeight).toBe(0);
				}
			});
			cleanup();
		});
	});
});
