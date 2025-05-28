<script>
	// @ts-nocheck
	import { version } from '$app/environment';
	import {
		initialize,
		initializeAppVersion,
		initializeDomain
	} from '$lib-v4/browser/api-firmly.js';
	import Visa from '$lib-v4/clients/visa.svelte';
	import { postCheckoutClosed, postOrderPlaced } from '$lib-v4/browser/cross.js';
	import { onMount } from 'svelte';
	import FlowSinglePage from '$lib-v4/components/v4/flow-single-page.svelte';
	import { writable } from 'svelte/store';
	import ThankYouPage from '$lib-v4/components/v4/thank-you-page.svelte';
	import { page } from '$app/stores';
	import { isActionDark, isPrimaryDark } from '$lib-v4/components/v4/theme-context';
	import { colord } from 'colord';
	import { bindEvent } from '$lib-v4/browser/dash';
	import Header from '$lib-v4/components/v4/header.svelte';
	import SidebarLayout from './sidebar-layout.svelte';
	import FullscreenLayout from './fullscreen-layout.svelte';
	import PopupLayout from './popup-layout.svelte';
	import BottomsheetLayout from './bottom-sheet-layout.svelte';
	import PdpSkeleton from './pdp-skeleton.svelte';

	let error = $state();
	let skipPdp = $state(false);
	let showCheckout = $state(false);
	let multipleVariants = $state(false);
	let iframeHeight = $state(0);
	let iframeDisplay = $state('none');
	let ecsUrl = $state('');
	let uiMode = $state('fullscreen');

	let { data } = $props();

	// Special cases that don't follow the standard domain conversion pattern
	const specialEcsUrlMap = {
		'test.victoriassecret.com': 'test-victoriassecret.firmly.in'
	};

	const bypassCatalogApiMerchants = ['test.victoriassecret.com', 'dermstore.com'];

	let partnerInfo = {
		largeLogo:
			"data:image/svg+xml,%3Csvg class='forbes-logo_svg__fs-icon forbes-logo_svg__fs-icon--forbes-logo' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 54'%3E%3Cpath d='M113.3 18.2c0-5.8.1-11.2.4-16.2L98.4 4.9v1.4l1.5.2c1.1.1 1.8.5 2.2 1.1.4.7.7 1.7.9 3.2.2 2.9.4 9.5.3 19.9 0 10.3-.1 16.8-.3 19.3 5.5 1.2 9.8 1.7 13 1.7 6 0 10.7-1.7 14.1-5.2 3.4-3.4 5.2-8.2 5.2-14.1 0-4.7-1.3-8.6-3.9-11.7-2.6-3.1-5.9-4.6-9.8-4.6-2.6 0-5.3.7-8.3 2.1zm.3 30.8c-.2-3.2-.4-12.8-.4-28.5.9-.3 2.1-.5 3.6-.5 2.4 0 4.3 1.2 5.7 3.7 1.4 2.5 2.1 5.5 2.1 9.3 0 4.7-.8 8.5-2.4 11.7-1.6 3.1-3.6 4.7-6.1 4.7-.8-.2-1.6-.3-2.5-.4zM41 3H1v2l2.1.2c1.6.3 2.7.9 3.4 1.8.7 1 1.1 2.6 1.2 4.8.8 10.8.8 20.9 0 30.2-.2 2.2-.6 3.8-1.2 4.8-.7 1-1.8 1.6-3.4 1.8l-2.1.3v2h25.8v-2l-2.7-.2c-1.6-.2-2.7-.9-3.4-1.8-.7-1-1.1-2.6-1.2-4.8-.3-4-.5-8.6-.5-13.7l5.4.1c2.9.1 4.9 2.3 5.9 6.7h2V18.9h-2c-1 4.3-2.9 6.5-5.9 6.6l-5.4.1c0-9 .2-15.4.5-19.3h7.9c5.6 0 9.4 3.6 11.6 10.8l2.4-.7L41 3zm-4.7 30.8c0 5.2 1.5 9.5 4.4 12.9 2.9 3.4 7.2 5 12.6 5s9.8-1.7 13-5.2c3.2-3.4 4.7-7.7 4.7-12.9s-1.5-9.5-4.4-12.9c-2.9-3.4-7.2-5-12.6-5s-9.8 1.7-13 5.2c-3.2 3.4-4.7 7.7-4.7 12.9zm22.3-11.4c1.2 2.9 1.7 6.7 1.7 11.3 0 10.6-2.2 15.8-6.5 15.8-2.2 0-3.9-1.5-5.1-4.5-1.2-3-1.7-6.8-1.7-11.3C47 23.2 49.2 18 53.5 18c2.2-.1 3.9 1.4 5.1 4.4zm84.5 24.3c3.3 3.3 7.5 5 12.5 5 3.1 0 5.8-.6 8.2-1.9 2.4-1.2 4.3-2.7 5.6-4.5l-1-1.2c-2.2 1.7-4.7 2.5-7.6 2.5-4 0-7.1-1.3-9.2-4-2.2-2.7-3.2-6.1-3-10.5H170c0-4.8-1.2-8.7-3.7-11.8-2.5-3-6-4.5-10.5-4.5-5.6 0-9.9 1.8-13 5.3-3.1 3.5-4.6 7.8-4.6 12.9 0 5.2 1.6 9.4 4.9 12.7zm7.4-25.1c1.1-2.4 2.5-3.6 4.4-3.6 3 0 4.5 3.8 4.5 11.5l-10.6.2c.1-3 .6-5.7 1.7-8.1zm46.4-4c-2.7-1.2-6.1-1.9-10.2-1.9-4.2 0-7.5 1.1-10 3.2s-3.8 4.7-3.8 7.8c0 2.7.8 4.8 2.3 6.3 1.5 1.5 3.9 2.8 7 3.9 2.8 1 4.8 2 5.8 2.9 1 1 1.6 2.1 1.6 3.6 0 1.4-.5 2.7-1.6 3.7-1 1.1-2.4 1.6-4.2 1.6-4.4 0-7.7-3.2-10-9.6l-1.7.5.4 10c3.6 1.4 7.6 2.1 12 2.1 4.6 0 8.1-1 10.7-3.1 2.6-2 3.9-4.9 3.9-8.5 0-2.4-.6-4.4-1.9-5.9-1.3-1.5-3.4-2.8-6.4-4-3.3-1.2-5.6-2.3-6.8-3.3-1.2-1-1.8-2.2-1.8-3.7s.4-2.7 1.3-3.7 2-1.4 3.4-1.4c4 0 6.9 2.9 8.7 8.6l1.7-.5-.4-8.6zm-96.2-.9c-1.4-.7-2.9-1-4.6-1-1.7 0-3.4.7-5.3 2.1-1.9 1.4-3.3 3.3-4.4 5.9l.1-8-15.2 3v1.4l1.5.1c1.9.2 3 1.7 3.2 4.4.6 6.2.6 12.8 0 19.8-.2 2.7-1.3 4.1-3.2 4.4l-1.5.2v1.9h21.2V49l-2.7-.2c-1.9-.2-3-1.7-3.2-4.4-.6-5.8-.7-12-.2-18.4.6-1 1.9-1.6 3.9-1.8 2-.2 4.3.4 6.7 1.8l3.7-9.3z'%3E%3C/path%3E%3C/svg%3E"
	};

	let layout = $state(FullscreenLayout);

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
		cart.set(null);
		const res = await window.firmly.cartAddLineItem(variantId, quantity, [], domain, flushCart);
		if (res.status == 200) {
			console.log('firmly - addToCart - res.data', res.data);
			cart.set(res.data);
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

	function convertToFirmlyDomain(hostname) {
		// Remove 'www.' prefix if present
		let domain = hostname.replace(/^www\./, '');

		// Check special cases first
		if (specialEcsUrlMap[hostname]) {
			return specialEcsUrlMap[hostname];
		}

		// Handle myshopify.com domains
		if (domain.endsWith('myshopify.com')) {
			return domain.replace('myshopify.com', 'firmly.in');
		}

		// For regular domains, extract the main domain name without TLD
		// and append .firmly.in
		const domainParts = domain.split('.');
		if (domainParts.length >= 2) {
			// Take the domain name without TLD (e.g., 'example' from 'example.com')
			return `${domainParts[0]}.firmly.in`;
		}

		// Fallback if the domain doesn't match expected patterns
		return `${domain}.firmly.in`;
	}

	function getEcsUrl(url) {
		const urlObj = new URL(url);
		console.log('firmly - original hostname', urlObj.hostname);

		urlObj.hostname = convertToFirmlyDomain(urlObj.hostname);

		console.log('firmly - getEcsUrl - urlObj', urlObj.href);

		return urlObj;
	}

	async function onAddToCart(transferPayload) {
		showCheckout = true;
		const res = await window.firmly.cartSessionTransfer(transferPayload);
		if (res.status == 200) {
			cart.set(res.data);

			// Handle custom properties if available
			const customProperties = window.firmly.customProperties;
			if (customProperties && res.data?.shop_id) {
				try {
					console.log('Attempting to set custom properties after session transfer');
					await window.firmly.setCustomProperties(res.data.shop_id, customProperties);
				} catch (error) {
					console.error('Failed to set custom properties:', error);
				}
			}
		} else {
			// Show some error dialog to the customer
		}
	}

	async function initiateCheckoutByUrl(url, flushCart = false) {
		const skipCatalogApi = bypassCatalogApiMerchants.some((merchant) => url.includes(merchant));

		let productDetails = [];
		if (!skipCatalogApi) {
			// Using the PDP URL, get variant ID.
			const resp = await fetch(`${data.PUBLIC_cf_server}/api/v1/domains-pdp?url=${url}`, {
				headers: {
					'x-firmly-app-id': window.firmly.appId
				}
			});

			if (!resp.ok) {
				error = `Unable to find this product`;
				return;
			}
			productDetails = await resp.json();
		}

		if (productDetails?.variants?.length > 1 || skipCatalogApi) {
			// Multiple variants, show PDP.
			console.log('firmly - Multiple variants, show PDP.');
			multipleVariants = true;

			// Listen for the message from the ECS Service
			bindEvent(window, 'message', (e) => {
				try {
					let data = JSON.parse(e.data);
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

						onAddToCart(data.transfer);
					} else if (data.action == 'firmly::adjustSize') {
						if (iframeHeight === 0) {
							iframeHeight = data.data.height;
						}
					} else if (data.action == 'firmly::onDOMContentLoaded') {
						iframeDisplay = 'block';
						console.log('firmly - iframeDisplay', iframeDisplay);
					}
				} catch (ex) {
					// Ignored
					console.log('error', ex);
				}
			});

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
		const url = $page.url.searchParams.get('url');
		const flushCart = $page.url.searchParams.get('flush_cart') !== 'false';
		console.log('firmly - initiateFlow - url', url);
		if (url) {
			return initiateCheckoutByUrl(url, flushCart);
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
		uiMode = $page.url.searchParams.get('ui_mode') || 'fullscreen';
		skipPdp = $page.url.searchParams.get('skip_pdp') === 'true';

		// Initialize the session in the background.
		initialize(data.PUBLIC_api_id, data.PUBLIC_cf_server);
		initializeAppVersion(version);

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

		bindEvent(window, 'message', (e) => {
			try {
				let data = JSON.parse(e.data);
				if (data.action == 'firmly::setTheme') {
					initializeTheme(data.data);
				}
			} catch (ex) {
				// Ignored
				console.log('error', ex);
			}
		});
	});

	function onBackClick() {
		if (showCheckout) {
			console.log('firmly - onBackClick - showCheckout = false');
			showCheckout = false;
		} else {
			console.log('firmly - onBackClick - postCheckoutClosed');
			postCheckoutClosed();
		}
	}

	function onOrderPlacedEvent(event) {
		postOrderPlaced(null, null, event.detail.order);
		order = event.detail.order;
	}
</script>

<Visa
	PUBLIC_c2p_dpa_id={data.PUBLIC_c2p_dpa_id}
	PUBLIC_c2p_initiator_id={data.PUBLIC_c2p_initiator_id}
	PUBLIC_c2p_sdk_url={data.PUBLIC_c2p_sdk_url}
/>

<!-- The following div helps detecting if the iframe is visible or not and correctly showing the contents. -->
<div class="bottom-0 left-0 h-[1px] w-[1px]"></div>
{#if error}
	{error}
{:else}
	{@const Layout = layout}
	<div class="theme-provider">
		<Layout>
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
								merchantInfo={partnerInfo}
								doNotExpand={true}
								on:back-click={onBackClick}
							/>
						</div>
						{#if iframeDisplay === 'none'}
							<PdpSkeleton />
						{/if}
						<iframe
							title="Product Details"
							id="firmly-pdp-frame"
							class="grow"
							style={`height: ${iframeHeight}px; display: ${iframeDisplay}`}
							src={ecsUrl}
						></iframe>
					</div>
				{/if}

				{#if order}
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
