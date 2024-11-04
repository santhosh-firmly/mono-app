<script>
	// @ts-nocheck
	import { bindEvent } from '$lib/browser/dash.js';
	import { version } from '$app/environment';
	import { PUBLIC_api_id } from '$lib/env.js';
	import { initialize, initializeAppVersion, initializeDomain } from '$lib/browser/api-firmly.js';
	import { postCheckoutClosed, postGetParentInfo } from '$lib/browser/cross.js';
	import Visa from '$lib/clients/visa.svelte';
	import { PUBLIC_cf_server } from '$lib/env.js';
	import { onMount } from 'svelte';
	import FlowSinglePage from '$lib/components/v4/flow-single-page.svelte';
	import '$lib/components/v4/theme.scss';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import '../../firmly-edge.postcss';
	import ThankYouPage from '$lib/components/v4/thank-you-page.svelte';

	// Used when the UI loads with no cart information.
	// In such scenario, the dropin performs a getCart call
	// to retrieve the current cart state
	let cartInitialized = false;

	let cart = writable();
	let largeLogo;
	let smallLogo;
	let privacyPolicy;
	let termsOfUse;
	let order = null;
	let isParentIframed = false;

	async function onAddToCart(transferPayload) {
		cartInitialized = true;
		// Remove any existing cart so the skeleton and the collapsed states take action.
		cart.set(null);
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
			cart.set(undefined);
			postCheckoutClosed();
		}
	}

	onMount(() => {
		if (document.body.clientHeight > 0) {
			cartInitialized = false;
			setTimeout(() => {
				if (!cartInitialized) {
					getCart();
				}
			}, 3000);
		}
		bindEvent(window, 'message', (e) => {
			try {
				let data = JSON.parse(e.data);
				if (data.action == 'parentInfo') {
					delete data.action;
					if (!cartInitialized) {
						getCart();
					}
				} else if (data.action == 'firmly::addToCart') {
					// This will redirect the user to Firmly's thank you page
					isParentIframed = data.isIframed;
					initializeDomain(data.store_id);
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
		postCheckoutClosed();
	}

	function onOrderPlacedEvent(event) {
		order = event.detail.order;
	}
</script>

<Visa />
<!-- The following div helps detecting if the iframe is visible or not and correctly showing the contents. -->
<div class="left-0 bottom-0 w-[1px] h-[1px]" />
<div class="theme-provider shadow-lg" transition:fade>
	{#if order}
		<ThankYouPage
			{order}
			on:back-click={onBackClick}
			merchantInfo={{
				largeLogo,
				smallLogo
			}}
		/>
	{:else}
		<FlowSinglePage
			{cart}
			{largeLogo}
			{smallLogo}
			{privacyPolicy}
			{termsOfUse}
			{isParentIframed}
			redirectOnPlaceOrder={false}
			on:back-click={onBackClick}
			on:orderPlacedEvent={onOrderPlacedEvent}
		/>
	{/if}
</div>
