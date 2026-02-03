<script>
	import { onMount, untrack } from 'svelte';
	import {
		initializeConfigurator,
		resetConfigurator
	} from '$lib/states/configurator/configurator.svelte.js';
	import {
		initializeFlowPlayer,
		resetFlowPlayer
	} from '$lib/states/configurator/flow-player.svelte.js';
	import { initializeCheckout, resetCheckout } from '$lib/states/checkout/index.svelte.js';
	import { initializeMerchant, resetMerchant } from '$lib/states/merchant.svelte.js';
	import { initializeNotices, resetNotices } from '$lib/states/notices.svelte.js';
	import { initializeClickToPay, resetClickToPay } from '$lib/states/click-to-pay.svelte.js';
	import { initializeBuyNow, getBuyNow, resetBuyNow } from '$lib/states/buy-now.svelte.js';
	import { getCartForState, mockCartWithShipping } from '$lib/utils/mocks/mock-data.js';
	import { config } from '$lib/utils/config.js';
	import {
		enableC2PMock,
		disableC2PMock,
		setConfiguratorForC2PMock
	} from '$lib/utils/mocks/c2p-mock.js';
	import {
		enablePayPalMock,
		disablePayPalMock,
		setConfiguratorForPayPalMock
	} from '$lib/utils/mocks/paypal-mock.js';
	import { resetCartState } from '$lib/utils/mocks/handlers.js';
	import { initializePayPal, resetPayPal } from '$lib/states/paypal.svelte.js';

	import Configurator from '$lib/views/configurator/index.svelte';
	import Checkout from '$lib/views/checkout/index.svelte';
	import BuyNow from '$lib/views/buy-now/index.svelte';
	import StoreView from '$lib/components/configurator/store-view.svelte';
	import MockPdpPage from '$lib/components/configurator/mock-pdp-page.svelte';

	let configurator = $state(null);
	let checkout = $state(null);
	let merchant = $state(null);
	let c2p = $state(null);
	let paypal = $state(null);
	let notices = $state(null);
	let flowPlayer = $state(null);
	let browserContentRef = $state(null);
	let mounted = $state(false);
	let error = $state(null);

	let prevFeatures = $state({
		promoCodes: true,
		paypal: true,
		clickToPay: true
	});
	let currentCartState = $state(null);
	let prevTheme = $state(null);

	let storeResetKey = $state(0);

	let pdpEnabled = $derived(configurator?.pdpEnabled ?? false);

	let isBuyNow = $derived(configurator?.product === 'buyNow');
	let browserUrl = $derived(isBuyNow ? 'merchant-store.com/article' : 'checkout.firmly.ai');
	let partnerPresentation = $derived({
		displayName: configurator?.theme?.merchantName,
		largeLogo: configurator?.theme?.largeLogo
	});

	function reloadCheckoutState() {
		resetCheckout();
		resetClickToPay();
		resetPayPal();
		resetCartState();

		checkout = initializeCheckout({
			domain: 'demo-store.com',
			store: { logoUrl: null },
			pending: { cart: false }
		});

		const baseCart =
			currentCartState === 'prefilledShipping'
				? mockCartWithShipping
				: getCartForState('Blank');
		const cart = {
			...baseCart,
			features: {
				promo_codes: configurator.features.promoCodes,
				paypal: configurator.features.paypal
			},
			shop_properties: {
				paypal: configurator.features.paypal
					? { sandbox: true, payment_enabled: true }
					: null
			}
		};
		checkout.setCart(cart);
		checkout.initializeForms(cart.shipping_info || {}, cart.billing_info || {});

		c2p = initializeClickToPay();
		if (configurator.features.clickToPay) {
			enableC2PMock();
			c2p.initialized = true;
		} else {
			disableC2PMock();
		}

		paypal = initializePayPal();
		if (configurator.features.paypal) {
			enablePayPalMock();
			paypal.initialized = true;
		} else {
			disablePayPalMock();
		}
	}

	function handleReload() {
		if (flowPlayer) {
			flowPlayer.stop();
		}

		configurator.reset();

		if (isBuyNow) {
			getBuyNow().setupLayout(configurator.layoutType);
			storeResetKey++;
		}

		reloadCheckoutState();
	}

	$effect(() => {
		const features = configurator?.features;
		if (!features) return;

		const changed =
			features.promoCodes !== prevFeatures.promoCodes ||
			features.paypal !== prevFeatures.paypal ||
			features.clickToPay !== prevFeatures.clickToPay;

		if (changed) {
			if (features.clickToPay !== prevFeatures.clickToPay) {
				untrack(() => {
					if (features.clickToPay) {
						enableC2PMock();
						if (c2p) c2p.initialized = true;
					} else {
						disableC2PMock();
						if (c2p) c2p.initialized = false;
					}
				});
			}

			if (features.paypal !== prevFeatures.paypal) {
				untrack(() => {
					if (features.paypal) {
						enablePayPalMock();
						if (paypal) paypal.initialized = true;
					} else {
						disablePayPalMock();
						if (paypal) {
							paypal.initialized = false;
							paypal.reset();
						}
					}
				});
			}

			prevFeatures = { ...features };

			untrack(() => {
				if (flowPlayer && !flowPlayer.isPlaying && !flowPlayer.isConfiguringFeatures) {
					flowPlayer.reset();
				}
			});

			untrack(() => {
				if (!checkout?.cart) return;
				checkout.setCart({
					...checkout.cart,
					features: {
						promo_codes: features.promoCodes,
						paypal: features.paypal
					}
				});
			});
		}
	});

	$effect(() => {
		const theme = configurator?.theme;
		if (!theme || !merchant) return;

		const themeKey = JSON.stringify(theme);
		if (themeKey === prevTheme) return;

		prevTheme = themeKey;
		untrack(() => {
			merchant.primaryColor = theme.primaryColor;
			merchant.actionColor = theme.actionColor;
			merchant.largeLogo = theme.largeLogo;
			merchant.smallLogo = theme.smallLogo;
		});
	});

	$effect(() => {
		const layoutType = configurator?.layoutType;
		if (!layoutType || !mounted) return;

		untrack(() => {
			const buyNow = getBuyNow();
			buyNow.setupLayout(layoutType);
			if (buyNow.mode === 'checkout' || buyNow.mode === 'pdp') {
				storeResetKey++;
			}
		});
	});

	$effect(() => {
		const enabled = configurator?.pdpEnabled;
		if (enabled == null || !mounted) return;

		untrack(() => {
			if (isBuyNow) {
				storeResetKey++;
			}
		});
	});

	$effect(() => {
		if (flowPlayer && browserContentRef) {
			flowPlayer.setContainer(browserContentRef);
		}
	});

	onMount(async () => {
		try {
			config.apiServer = 'https://api.mock.firmly.com';
			config.ccServer = 'https://cc.mock.firmly.com';
			config.domain = 'demo-store.com';

			const { worker } = await import('$lib/utils/mocks/browser.js');
			const { setConfiguratorForHandlers } = await import('$lib/utils/mocks/handlers.js');

			configurator = initializeConfigurator();

			if (worker) {
				await worker.start({
					onUnhandledRequest: 'bypass',
					quiet: true
				});
				setConfiguratorForHandlers(configurator);
			}

			resetBuyNow();
			resetCheckout();
			resetClickToPay();
			resetNotices();
			resetMerchant();

			const buyNow = initializeBuyNow('pdp');
			buyNow.setupLayout(configurator.layoutType);
			notices = initializeNotices();

			merchant = initializeMerchant({
				theme: {
					largeLogo: configurator.theme.largeLogo,
					smallLogo: configurator.theme.smallLogo,
					colors: {
						primary: configurator.theme.primaryColor,
						action: configurator.theme.actionColor
					}
				}
			});

			setConfiguratorForC2PMock(configurator);
			setConfiguratorForPayPalMock(configurator);
			reloadCheckoutState();

			flowPlayer = initializeFlowPlayer();
			flowPlayer.setConfigurator(configurator);
			flowPlayer.setOnReload(() => {
				if (configurator.product === 'buyNow') {
					getBuyNow().setupLayout(configurator.layoutType);
					storeResetKey++;
				}
				reloadCheckoutState();
			});
			flowPlayer.setOnCartStateChange((state) => {
				currentCartState = state;
			});
			flowPlayer.setOnPdpEnabledChange((enabled) => {
				configurator.setPdpEnabled(enabled);
			});

			mounted = true;
		} catch (e) {
			error = e.message + (e.stack ? '\n' + e.stack : '');
		}

		return async () => {
			const { worker } = await import('$lib/utils/mocks/browser.js');
			if (worker) worker.stop();

			disableC2PMock();
			disablePayPalMock();
			resetFlowPlayer();
			resetConfigurator();
			resetBuyNow();
			resetCheckout();
			resetPayPal();
			resetClickToPay();
			resetNotices();
			resetMerchant();
		};
	});
</script>

<svelte:head>
	<title>V5 Configurator - Firmly Edge</title>
</svelte:head>

{#if error}
	<div
		class="flex h-screen w-full flex-col items-center justify-center bg-gray-100 p-4 text-red-500"
	>
		<p class="font-bold">Error:</p>
		<p class="text-sm">{error}</p>
	</div>
{:else if mounted && configurator && checkout && merchant}
	<Configurator
		{configurator}
		{flowPlayer}
		onReload={handleReload}
		bind:browserContentRef
		{browserUrl}
	>
		{#key configurator.language}
			{#if isBuyNow}
				<StoreView
					buyNow={getBuyNow()}
					merchantName={configurator.theme.merchantName}
					{pdpEnabled}
					resetKey={storeResetKey}
					language={configurator.language}
				>
					{#if pdpEnabled}
						<BuyNow
							{checkout}
							{c2p}
							{paypal}
							{merchant}
							notices={notices?.notices}
							{partnerPresentation}
							isFullscreen={false}
							onGoBack={() => getBuyNow().goToPdp()}
							onDismissNotice={(id) => notices?.dismiss(id)}
							useAbsoluteModalPosition={true}
						>
							{#snippet pdpContent()}
								<MockPdpPage
									language={configurator.language}
									onBuyNow={() => getBuyNow().goToCheckout()}
								/>
							{/snippet}
						</BuyNow>
					{:else}
						<Checkout
							{checkout}
							{c2p}
							{paypal}
							{merchant}
							notices={notices?.notices}
							isFullscreen={false}
							onGoBack={() => getBuyNow().close()}
							onClose={() => storeResetKey++}
							onDismissNotice={(id) => notices?.dismiss(id)}
							useAbsoluteModalPosition={true}
						/>
					{/if}
				</StoreView>
			{:else}
				<Checkout
					{checkout}
					{c2p}
					{paypal}
					{merchant}
					notices={notices?.notices}
					isFullscreen={true}
					onDismissNotice={(id) => notices?.dismiss(id)}
				/>
			{/if}
		{/key}
	</Configurator>
{:else}
	<div class="flex h-screen w-full items-center justify-center bg-gray-100">
		<div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
	</div>
{/if}
