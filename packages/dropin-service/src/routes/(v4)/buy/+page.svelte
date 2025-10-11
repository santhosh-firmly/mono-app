<script>
	// @ts-nocheck
	import { SvelteURL } from 'svelte/reactivity';
	import { version } from '$app/environment';
	import {
		initialize,
		initializeAppVersion,
		initializeDomain
	} from '$lib-v4/browser/api-firmly.js';
	import { trackUXEvent } from '$lib-v4/browser/telemetry.js';
	import { postCheckoutClosed, postOrderPlaced } from '$lib-v4/browser/cross.js';
	import { onMount, onDestroy } from 'svelte';
	import FlowSinglePage from '$lib-v4/components/v4/flow-single-page.svelte';
	import { writable } from 'svelte/store';
	import ThankYouPage from '$lib-v4/components/v4/thank-you-page.svelte';
	import { page } from '$app/stores';
	import { isActionDark, isPrimaryDark } from '$lib-v4/components/v4/theme-context';
	import { colord } from 'colord';
	import { bindEvent } from '$lib-v4/browser/dash';
	import Header from '$lib-v4/components/v4/header.svelte';
	import { updateUrlWithFirmlyDomain } from '$lib-v4/utils/domain-utils.js';
	import SidebarLayout, {
		TRANSITION_DURATION as SIDEBAR_TRANSITION_DURATION
	} from './sidebar-layout.svelte';
	import FullscreenLayout from './fullscreen-layout.svelte';
	import PopupLayout from './popup-layout.svelte';
	import BottomsheetLayout from './bottom-sheet-layout.svelte';
	import PdpSkeleton from './pdp-skeleton.svelte';
	import { startMasterCardUnifiedSolution } from '$lib-v4/clients/mastercard';
	import Visa from '$lib-v4/clients/visa.svelte';
	import { initializationState } from '$lib-v4/utils/initialization-state.js';
	import SimpleError from '$lib-v4/components/v4/simple-error.svelte';

	const PDP_MAX_WAIT_TIMEOUT = 2000;

	let { data } = $props();

	let error = $state();
	let skipPdp = $state(false);
	let showCheckout = $state(true);
	let multipleVariants = $state(false);
	let iframeHeight = $state(0);
	let iframeVisibility = $state('hidden');
	let ecsUrl = $state('');
	let uiMode = $state('fullscreen');
	let pageState = $state('pdp');
	let isProduction = $derived(data.PUBLIC_firmly_deployment === 'prod');
	let finalpdpUrl = $state('');
	let sessionTransferError = $state(false);
	let sessionTransferErrorMessage = $state('');

	const bypassCatalogApiMerchants = ['test.victoriassecret.com', 'dermstore.com'];

	let partnerPresentation = $derived(data.partnerPresentation);
	let partnerDisclaimer = $derived(data.partnerPresentation?.disclaimer);
	let partnerButtonText = $derived(data.partnerPresentation?.buttonText);

	// Used for Layout configuration.
	let layout = $state(FullscreenLayout);
	let layoutTransitionTime = $state();
	let isLayoutActive = $state(true);

	let eventListeners = [];

	function initializeTheme(theme) {
		if (theme) {
			// Example of theme structure:
			//
			// theme = {
			// 	colors: {
			// 		primary: '#000000',
			// 		action: '#000000',
			// 		onPrimary: '#000000',
			// 		onPrimarySubtle: '#000000',
			// 		onPrimaryMoreSubtle: '#000000',
			// 		onAction: '#000000',
			// 		error: '#000000',
			// 		onError: '#000000',
			// 	},
			// 	largeLogo: '...',
			// 	smallLogo: '...',
			// }

			const primaryColor = theme.colors?.primary;
			if (primaryColor) {
				isPrimaryDark.set(colord(primaryColor).isDark());
				document.documentElement.style.setProperty('--color-fy-primary', primaryColor);
				document.documentElement.style.setProperty(
					'--color-fy-on-primary',
					theme.colors?.onPrimary || ($isPrimaryDark ? 'white' : 'black')
				);
				document.documentElement.style.setProperty(
					'--color-fy-on-primary-subtle',
					theme.colors?.onPrimarySubtle || ($isPrimaryDark ? '#a2a2a2' : '#a2a2a2')
				);
			}

			const actionColor = theme.colors?.action || primaryColor;
			if (actionColor) {
				isActionDark.set(colord(actionColor).isDark());
				document.documentElement.style.setProperty('--color-fy-action', actionColor);
				document.documentElement.style.setProperty(
					'--color-fy-on-action',
					theme.colors?.onAction || ($isActionDark ? 'white' : 'black')
				);
			}

			largeLogo = theme.largeLogo;
			smallLogo = theme.smallLogo;
		}
	}

	let cart = writable();
	let largeLogo = $state();
	let smallLogo = $state();
	let privacyPolicy = $state();
	let termsOfUse = $state();
	let isParentIframed = $state(false);
	let order = $state(null);

	async function addToCart(variantId, quantity, domain, flushCart = false) {
		// Remove any existing cart so the skeleton and the collapsed states take action.
		showCheckout = true;
		pageState = 'checkout';
		cart.set(null);
		const res = await window.firmly.cartAddLineItem(variantId, quantity, [], domain, flushCart);
		if (res.status == 200) {
			console.log('firmly - addToCart - res.data', res.data);
			cart.set(res.data);

			// Set custom properties if available (for direct-to-checkout)
			const customProperties = window.firmly.customProperties;
			if (customProperties && res.data?.shop_id) {
				try {
					await window.firmly.setCustomProperties(res.data.shop_id, customProperties);
				} catch (error) {
					console.error('Failed to set custom properties:', error);
				}
			}
		} else {
			console.log('firmly - addToCart - error', res.data);
			// Show some error dialog to the customer
		}
	}

	async function getCart(domain) {
		// Remove any existing cart so the skeleton and the collapsed states take action.
		showCheckout = true;
		cart.set(null);
		const res = await window.firmly.cartGetCart(domain);
		if (res.status == 200) {
			console.log('firmly - getCart - res.data', res.data);
			cart.set(res.data);
		} else {
			console.log('firmly - getCart - error', res.data);
			// Show some error dialog to the customer
		}
	}

	async function initiateCheckoutByDomain(domain) {
		initializeDomainInfo(domain);
		return getCart(domain);
	}

	async function initiateCheckoutByVariantId(domain, variantId, quantity, flushCart = false) {
		initializeDomainInfo(domain);
		return addToCart(variantId, quantity, domain, flushCart);
	}

	function getEcsUrl(url) {
		const urlObj = new SvelteURL(url);
		return updateUrlWithFirmlyDomain(urlObj, data.PUBLIC_aperture_domain);
	}

	async function setAttribution() {
		const url = new URL(finalpdpUrl);
		const setAttributionRes = await window.firmly.setAttribution({
			utm: url.search,
			referrer_url: document.referrer,
			landing_page: url.toString()
		});
		if (setAttributionRes.status < 200 || setAttributionRes.status >= 300) {
			console.error('setAttribution failed with status:', setAttributionRes.status);
		}
	}

	async function onAddToCart(transferPayload) {
		try {
			showCheckout = true;
			pageState = 'checkout';

			// Check if window.firmly and required functions exist
			if (!window.firmly || typeof window.firmly.cartSessionTransfer !== 'function') {
				console.error('window.firmly or cartSessionTransfer not available');
				return;
			}

			const res = await window.firmly.cartSessionTransfer(transferPayload);
			console.log('cartSessionTransfer response:', res);

			if (res.status == 200) {
				cart.set(res.data);

				await setAttribution();

				// Handle custom properties if available
				const customProperties = window.firmly.customProperties;
				if (customProperties && res.data?.shop_id) {
					try {
						console.log('Attempting to set custom properties after session transfer');
						if (typeof window.firmly.setCustomProperties === 'function') {
							await window.firmly.setCustomProperties(
								res.data.shop_id,
								customProperties
							);
						} else {
							console.warn('setCustomProperties function not available');
						}
					} catch (error) {
						console.error('Failed to set custom properties:', error);
					}
				}
			} else {
				console.error('Cart session transfer failed with status:', res.status);
				sessionTransferError = true;
				showCheckout = false;
				// Extract error message from response
				sessionTransferErrorMessage =
					res.data?.message ||
					res.data?.error ||
					'We encountered an issue loading your cart. Please try again.';
			}
		} catch (error) {
			console.error('Error in onAddToCart:', error);
			sessionTransferError = true;
			showCheckout = false;
			// Extract error message from caught error
			sessionTransferErrorMessage =
				error?.message || 'An unexpected error occurred. Please try again.';
		}
	}

	async function initiateCheckoutByUrl(url, flushCart = false) {
		finalpdpUrl = url;
		const forcePdp = $page.url.searchParams.get('force_pdp') === 'true';
		const skipCatalogApi =
			forcePdp || bypassCatalogApiMerchants.some((merchant) => url.includes(merchant));

		let productDetails = [];
		if (!skipCatalogApi) {
			try {
				// Using the PDP URL, get variant ID.
				const decodedUrl = encodeURIComponent(url);
				const resp = await fetch(
					`${data.PUBLIC_cf_server}/api/v1/domains-pdp?url=${decodedUrl}`,
					{
						headers: {
							'x-firmly-app-id': window.firmly.appId
						}
					}
				);

				if (!resp.ok) {
					error = `Unable to find this product`;
					return;
				}
				productDetails = await resp.json();
			} catch (err) {
				console.error('Product details fetch failed:', err);
				error = `Unable to find this product`;
				return;
			}
		}

		if (productDetails?.variants?.length > 1 || skipCatalogApi) {
			// Multiple variants, show PDP.
			console.log('firmly - Multiple variants, show PDP.');
			multipleVariants = true;
			showCheckout = false;
			pageState = 'pdp';

			// Timeout to force show the PDP if it's not already shown.
			setTimeout(() => {
				if (iframeVisibility !== 'visible') {
					console.log('firmly - show PDP forced by timeout');
					iframeVisibility = 'visible';
				}
			}, PDP_MAX_WAIT_TIMEOUT);

			// Listen for the message from the ECS Service
			const messageHandler = (e) => {
				try {
					// Prevent any default handling that might cause navigation
					if (e && e.preventDefault) {
						e.preventDefault();
					}

					// Check if this is a valid message we should handle
					if (!e.data || typeof e.data === 'undefined') {
						return;
					}

					let data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

					if (data?.action) {
						console.log('firmly - message data.action', data.action);

						if (data.action == 'firmly::addToCart') {
							// This will redirect the user to Firmly's thank you page
							isParentIframed = data.isIframed;
							initializeDomainInfo(data.store_id);

							// Store custom properties if present in the message
							if (data.custom_properties) {
								window.firmly.customProperties = data.custom_properties;
								console.log(
									'Stored custom properties from message:',
									window.firmly.customProperties
								);
							}

							// Call onAddToCart without propagating the event
							onAddToCart(data.transfer);
						} else if (data.action == 'firmly::adjustSize') {
							if (iframeHeight === 0) {
								iframeHeight = data.data.height;
							}
						} else if (data.action == 'firmly::onDOMContentLoaded') {
							iframeVisibility = 'visible';
							console.log('firmly - iframeVisibility', iframeVisibility);
						} else if (data.action == 'firmly::telemetry') {
							trackUXEvent('aperture_event', data.data);
						}
					}
				} catch (ex) {
					console.error('Firmly message handler error:', ex);
					// Don't let errors bubble up and cause page issues
				}
			};

			// Check if we already have a message listener to avoid duplicates
			if (!window.firmlyBuyPageMessageListener) {
				window.firmlyBuyPageMessageListener = messageHandler;
				bindEvent(window, 'message', messageHandler);

				eventListeners.push(() => {
					window.removeEventListener('message', messageHandler);
					window.firmlyBuyPageMessageListener = null;
				});
			}

			// Add ECS Service in iFrame
			ecsUrl = getEcsUrl(url);
			console.log('firmly - ecsUrl.', ecsUrl);
		} else {
			const variant = productDetails.variants.find((v) => v.available);

			// Using PDP URL get the merchant domain.
			const merchantDomain = new URL(url).hostname.replace(/^www\./, '');

			console.log(
				'firmly - initiateCheckoutByUrl - merchantDomain',
				merchantDomain,
				variant.sku,
				1
			);

			return initiateCheckoutByVariantId(merchantDomain, variant.sku, 1, flushCart);
		}
	}

	async function initiateCheckoutByAffiliateUrl(affiliateUrl, flushCart = false) {
		const response = await window.firmly.affiliateStartJourney(affiliateUrl);
		if (response.status !== 200 || !response.data?.final_url) {
			console.error('firmly - affiliateStartJourney failed', response.data);
			error = 'There was an issue processing the affiliate link. Please try again.';
			return;
		}
		finalpdpUrl = response.data.final_url;

		return initiateCheckoutByUrl(finalpdpUrl, flushCart);
	}

	function initializeDomainInfo(domain) {
		if (domain) {
			initializeDomain(domain);

			if (data.merchantPresentation) {
				termsOfUse = data.merchantPresentation.termsOfUse;
				privacyPolicy = data.merchantPresentation.privacyPolicy;

				largeLogo = data.merchantPresentation.largeLogo;
				smallLogo = data.merchantPresentation.smallLogo;

				// Initialize theme if available
				if (data.merchantPresentation.theme) {
					initializeTheme(data.merchantPresentation.theme);
				}
				return;
			}
		}
	}

	async function initiateFlow() {
		// Using the PDP URL, get variant ID.
		let productUrl = $page.url.searchParams.get('url');
		let affiliateUrl = $page.url.searchParams.get('affiliate_url');
		const flushCart = $page.url.searchParams.get('flush_cart') !== 'false';

		if (affiliateUrl) {
			return initiateCheckoutByAffiliateUrl(affiliateUrl, flushCart);
		}

		if (productUrl) {
			return initiateCheckoutByUrl(productUrl, flushCart);
		}

		const variantId = $page.url.searchParams.get('variant_id');
		const domain = $page.url.searchParams.get('domain')?.replace(/^www\./, '');
		initializeDomainInfo(domain);
		const quantity = $page.url.searchParams.get('quantity') || 1;

		// Check for multiple variants
		const variants = $page.url.searchParams.get('variants');
		if (domain && variants) {
			// Parse variant:quantity format (comma-separated)
			const items = variants.split(',').map((item) => {
				const [variantId, quantity] = item.trim().split(':');
				return {
					variantId: variantId,
					quantity: parseInt(quantity) || 1
				};
			});

			// Show loading skeleton first
			showCheckout = true;
			cart.set(null);

			// Add each product sequentially
			let currentCart = null;
			let error = false;

			for (let i = 0; i < items.length; i++) {
				const isFirstItem = i === 0;
				try {
					const response = await window.firmly.cartAddLineItem(
						items[i].variantId,
						items[i].quantity,
						[],
						domain,
						isFirstItem && flushCart
					);

					if (response.status == 200) {
						currentCart = response.data;
						// Don't update the UI yet, just keep the skeleton visible
					} else {
						console.error('Failed to add item to cart:', response);
						error = true;
						break;
					}
				} catch (e) {
					console.error('Error adding item to cart:', e);
					error = true;
					break;
				}
			}

			// After all items are processed, update the cart to show the final state
			if (!error && currentCart) {
				cart.set(currentCart);
			}

			return;
		}

		if (domain) {
			if (variantId) {
				return initiateCheckoutByVariantId(domain, variantId, quantity, flushCart);
			}

			return initiateCheckoutByDomain(domain);
		}

		error = `No URL or variant ID and domain provided`;
		return;
	}

	function setupLayout() {
		if (uiMode === 'sidebar') {
			layout = SidebarLayout;
			layoutTransitionTime = SIDEBAR_TRANSITION_DURATION;
			return;
		}

		if (uiMode === 'popup') {
			layout = PopupLayout;
			return;
		}

		if (uiMode === 'bottomsheet') {
			layout = BottomsheetLayout;
			return;
		}

		// FullScreen
		layout = FullscreenLayout;
		return;
	}

	onMount(async () => {
		// Start initialization tracking
		initializationState.start();

		// Initialize the dropin session immediately - don't wait for SDK
		initialize(data.PUBLIC_api_id, data.PUBLIC_cf_server);
		initializeAppVersion(version);

		if (isProduction) {
			// Initialize Visa SDK for production
			// The Visa component will handle its own initialization via the use:loadVisaScript action
		} else {
			// Initialize MasterCard Unified Solution for other environments
			startMasterCardUnifiedSolution({
				srcDpaId: data.PUBLIC_unified_c2p_dpa_id,
				presentationName: data.PUBLIC_unified_c2p_dpa_presentation_name,
				sandbox: data.PUBLIC_unified_c2p_sandbox
			});
		}

		// Clean _appId from URL to keep it clean for users
		if (typeof window !== 'undefined' && window.location.search.includes('_appId=')) {
			const url = new URL(window.location);
			url.searchParams.delete('_appId');
			window.history.replaceState({}, '', url.toString());
		}

		uiMode = $page.url.searchParams.get('ui_mode') || 'fullscreen';
		skipPdp = $page.url.searchParams.get('skip_pdp') === 'true';

		// Get custom_properties from URL if present
		const customPropsParam = $page.url.searchParams.get('custom_properties');
		if (customPropsParam) {
			try {
				window.firmly.customProperties = JSON.parse(customPropsParam);
				console.log(
					'Stored custom properties from URL params:',
					window.firmly.customProperties
				);
			} catch (e) {
				console.error('Failed to parse custom_properties URL parameter:', e);
			}
		}

		setupLayout();
		initiateFlow();

		// Log initialization in development
		if (!isProduction && window.location?.hostname?.includes('lvh.me')) {
			setTimeout(() => {
				console.log('🔧 Development mode: Dropin initialized');
				console.log('Initialization state:', initializationState.getCurrentState());
			}, 3000);
		}
	});

	function handlePostCheckoutClose() {
		isLayoutActive = false;
		trackUXEvent('session_end');

		if (!layoutTransitionTime) {
			postCheckoutClosed();
		} else {
			setTimeout(() => {
				postCheckoutClosed();
			}, layoutTransitionTime);
		}
	}

	// Cleanup event listeners on component destroy
	onDestroy(() => {
		if (eventListeners?.length > 0) {
			eventListeners.forEach((cleanup) => {
				try {
					if (typeof cleanup === 'function') {
						cleanup();
					}
				} catch {
					// Silently handle cleanup errors
				}
			});
			eventListeners = [];
		}
	});

	function reloadIframe() {
		// Reset iframe visibility to show skeleton
		iframeVisibility = 'hidden';

		// Force iframe reload by updating the src with a cache-busting parameter
		const currentUrl = new URL(ecsUrl);
		currentUrl.searchParams.set('_reload', Date.now().toString());
		ecsUrl = currentUrl.toString();
	}

	function onBackClick() {
		trackUXEvent('back_button_clicked');

		if (pageState === 'pdp') {
			console.log('firmly - onBackClick - postCheckoutClosed');
			handlePostCheckoutClose();
			return;
		}

		if (multipleVariants) {
			pageState = 'pdp';
			showCheckout = false;
			reloadIframe();
			return;
		}

		handlePostCheckoutClose();
	}

	function onOrderPlacedEvent(event) {
		postOrderPlaced(null, null, event.detail.order);
		order = event.detail.order;
		trackUXEvent('order_placed');
	}
</script>

<svelte:head>
	<title>Firmly - Buy Now</title>
	<meta
		name="description"
		content="Complete your purchase securely with Firmly's trusted checkout platform. Fast, safe, and easy payments for your online shopping."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="robots" content="index, follow" />
	<meta property="og:title" content="Secure Checkout - Firmly" />
	<meta
		property="og:description"
		content="Complete your purchase securely with Firmly's trusted checkout platform. Fast, safe, and easy payments for your online shopping."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Secure Checkout - Firmly" />
	<meta
		name="twitter:description"
		content="Complete your purchase securely with Firmly's trusted checkout platform. Fast, safe, and easy payments for your online shopping."
	/>

	<!-- Preconnect to external domains for better performance -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="preconnect" href="https://js.hcaptcha.com" />
</svelte:head>

{#if data.PUBLIC_firmly_deployment === 'prod'}
	<Visa
		PUBLIC_c2p_sdk_url={data.PUBLIC_c2p_sdk_url}
		PUBLIC_c2p_dpa_id={data.PUBLIC_c2p_dpa_id}
		PUBLIC_c2p_initiator_id={data.PUBLIC_c2p_initiator_id}
	/>
{/if}

<!-- The following div helps detecting if the iframe is visible or not and correctly showing the contents. -->
<div class="bottom-0 left-0 h-[1px] w-[1px]"></div>
{#if error}
	{error}
{:else}
	{@const Layout = layout}
	<div class="theme-provider">
		<Layout onClose={handlePostCheckoutClose} visible={isLayoutActive}>
			<div class="h-full w-full transition-all duration-300">
				<!-- {#if !multipleVariants && !order}
					<div
						class="w-full h-full flex flex-col items-center mt-10 gap-4"
						class:hidden={showCheckout}
					>
						<div class="w-64 aspect-square rounded-lg animate-pulse bg-fy-on-primary-subtle"></div>
						<div class="w-52 my-12 h-8 rounded-lg animate-pulse bg-fy-on-primary-subtle"></div>
						<div class="w-96 h-6 rounded-lg animate-pulse bg-fy-on-primary-subtle"></div>
						<div class="w-96 h-6 rounded-lg animate-pulse bg-fy-on-primary-subtle"></div>
						<div class="w-96 h-6 rounded-lg animate-pulse bg-fy-on-primary-subtle"></div>
						<div class="w-96 h-6 rounded-lg animate-pulse bg-fy-on-primary-subtle"></div>
					</div>
				{/if} -->

				{#if multipleVariants && !skipPdp}
					<div class="flex h-full w-full flex-col">
						<div class="z-10 shadow-(--fy-surface-box-shadow)">
							<Header
								merchantInfo={partnerPresentation}
								doNotExpand={true}
								on:back-click={onBackClick}
							/>
						</div>
						{#if iframeVisibility === 'hidden'}
							<PdpSkeleton />
						{/if}
						<iframe
							title="Product Details"
							id="firmly-pdp-frame"
							class="grow"
							style={`height: ${iframeHeight}px; visibility: ${showCheckout ? 'hidden' : iframeVisibility}`}
							src={ecsUrl}
						></iframe>
					</div>
				{/if}

				{#if sessionTransferError}
					<div class="absolute top-0 left-0 h-full w-full">
						<SimpleError
							errorMessage="We encountered an issue loading your cart. Please try again."
							errorDetails={sessionTransferErrorMessage}
							onBack={onBackClick}
						/>
					</div>
				{:else if order}
					<div class="absolute top-0 left-0 h-full w-full">
						<ThankYouPage
							merchantInfo={{
								largeLogo,
								smallLogo
							}}
							{privacyPolicy}
							{termsOfUse}
							{order}
							on:back-click={onBackClick}
						></ThankYouPage>
					</div>
				{:else if showCheckout}
					<div class="absolute top-0 left-0 z-[999] h-full w-full">
						<FlowSinglePage
							redirectOnPlaceOrder={false}
							{cart}
							{largeLogo}
							{smallLogo}
							{privacyPolicy}
							{termsOfUse}
							{isParentIframed}
							{isProduction}
							{partnerDisclaimer}
							buttonText={partnerButtonText || 'Place Order'}
							on:back-click={onBackClick}
							on:orderPlacedEvent={onOrderPlacedEvent}
							PUBLIC_DISABLE_HCAPTCHA={data.PUBLIC_DISABLE_HCAPTCHA}
						/>
					</div>
				{/if}
			</div>
		</Layout>
	</div>
{/if}
