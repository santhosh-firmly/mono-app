<script>
	// @ts-nocheck
	import { bindEvent } from '$lib/browser/dash.js';
	import { version } from '$app/environment';
	import { PUBLIC_api_id, PUBLIC_firmly_deployment } from '$lib/env.js';
	import {
		initialize,
		initializeAppVersion,
		initializeDomain,
		initializeParentInfo
	} from '$lib/browser/api-firmly.js';
	import { postCheckoutClosed, postGetParentInfo } from '$lib/browser/cross.js';
	import Visa from '$lib/clients/visa.svelte';
	import { PUBLIC_cf_server } from '$lib/env.js';
	import { onMount, tick } from 'svelte';
	import FlowSinglePage from '$lib/components/v4/flow-single-page.svelte';
	import '$lib/components/v4/theme.scss';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import '../../firmly-edge.postcss';
	import { isActionDark, isPrimaryDark } from '$lib/components/v4/theme-context';
	import { colord } from 'colord';
	import { sCartStoreInfo } from '$lib/browser/api-manager';
	import ThankYouPage from '$lib/components/v4/thank-you-page.svelte';

	// Used when the UI loads with no cart information.
	// In such scenario, the dropin performs a getCart call
	// to retrieve the current cart state
	let cartInitialized = false;

	let cart = writable();
	let visible = false;
	let largeLogo;
	let smallLogo;
	let privacyPolicy;
	let termsOfUse;
	let isParentIframed = false;
	let order = null;

	async function onAddToCart(transferPayload) {
		cartInitialized = true;
		// Remove any existing cart so the skeleton and the collapsed states take action.
		cart.set(null);
		setVisibleTrue();
		const res = await window.firmly.cartSessionTransfer(transferPayload);
		if (res.status == 200) {
			cart.set(res.data);
		} else {
			// Show some error dialog to the customer
		}
	}

	async function getCart() {
		cartInitialized = true;
		// Remove any existing cart so the skeleton and the collapsed states take action.
		cart.set(null);
		setVisibleTrue();
		const res = await window.firmly.cartGetCart();
		if (res.status == 200) {
			cart.set(res.data);
		} else {
			// Show some error dialog to the customer
		}
	}

	// Close the checkout if the cart is empty
	$: {
		if ($cart?.line_items.length === 0) {
			(async () => {
				cart.set(undefined);
				// Make sure the cart set to undefined gets processed before we continue to hide the checkout.
				await tick();
				visible = false;
				postCheckoutClosed();
			})();
		}
	}

	function initializeAttributes(attributes) {
		privacyPolicy = attributes.privacyPolicy;
		termsOfUse = attributes.termsOfUse;
	}

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
				document.documentElement.style.setProperty('--fy-primary', primaryColor);
				document.documentElement.style.setProperty(
					'--fy-on-primary',
					theme.colors?.onPrimary || ($isPrimaryDark ? 'white' : 'black')
				);
				document.documentElement.style.setProperty(
					'--fy-on-primary-subtle',
					theme.colors?.onPrimarySubtle || ($isPrimaryDark ? '#a2a2a2' : '#a2a2a2')
				);
			}

			const actionColor = theme.colors?.action || primaryColor;
			if (actionColor) {
				isActionDark.set(colord(actionColor).isDark());
				document.documentElement.style.setProperty('--fy-action', actionColor);
				document.documentElement.style.setProperty(
					'--fy-on-action',
					theme.colors?.onAction || ($isActionDark ? 'white' : 'black')
				);
			}

			largeLogo = theme.largeLogo;
			smallLogo = theme.smallLogo;
		}
	}

	function setVisibleTrue() {
		visible = true;
	}

	onMount(() => {
		if (document.body.clientHeight > 0) {
			cartInitialized = false;
			setVisibleTrue();
			// Only in local mode, load the cart if the checkout is visible and it has no
			// session transfer in progress
			if (PUBLIC_firmly_deployment === 'local') {
				setTimeout(() => {
					if (!cartInitialized) {
						getCart();
					}
				}, 3000);
			}
		}
		bindEvent(window, 'message', (e) => {
			try {
				let data = JSON.parse(e.data);
				if (data.action == 'parentInfo') {
					delete data.action;
					isParentIframed = data.isIframed;
					initializeDomain(data.store_id);
					initializeParentInfo(data);
					initializeTheme(data.theme);
					initializeAttributes({
						privacyPolicy: data.privacyPolicyUrl,
						termsOfUse: data.termsOfServiceUrl
					});
					if (PUBLIC_firmly_deployment === 'local' && !cartInitialized) {
						getCart();
					}
				} else if (data.action == 'addToCart') {
					if (data.storeInfo) {
						sCartStoreInfo.set(data.storeInfo);
					}
					onAddToCart(data.transfer);
				}
			} catch (ex) {
				// Ignored
			}
		});
		postGetParentInfo();

		// Initialize the session in the background.
		initialize(PUBLIC_api_id, PUBLIC_cf_server);
		initializeAppVersion(version);
	});

	function onBackClick() {
		history.back();
	}

	function onOrderPlacedEvent(event) {
		order = event.detail.order;
	}
</script>

<Visa />
<!-- The following div helps detecting if the iframe is visible or not and correctly showing the contents. -->
<div class="left-0 bottom-0 w-[1px] h-[1px]" />
{#if visible}
	<div class="theme-provider" transition:fade>
		{#if order}
			<ThankYouPage {order} on:back-click={onBackClick}></ThankYouPage>
		{:else}
			<FlowSinglePage
				{cart}
				{largeLogo}
				{smallLogo}
				{privacyPolicy}
				{termsOfUse}
				{isParentIframed}
				on:back-click={onBackClick}
				on:orderPlacedEvent={onOrderPlacedEvent}
			/>
		{/if}
	</div>
{/if}
