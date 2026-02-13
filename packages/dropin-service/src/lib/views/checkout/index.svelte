<script>
	import CheckoutForm from './checkout.svelte';
	import ThankYou from './thank-you.svelte';
	import ErrorView from '$lib/views/error.svelte';
	import NoticeContainer from '$lib/components/checkout/notice-container.svelte';

	/**
	 * @typedef {Object} CheckoutViewProps
	 * @property {Object} checkout - Checkout state object
	 * @property {Object} c2p - Click to Pay state object
	 * @property {Object} [paypal] - PayPal state object
	 * @property {Object} [merchant] - Merchant configuration
	 * @property {Object} [partner] - Partner configuration and branding
	 * @property {Array} [notices] - Active notices to display
	 * @property {HTMLElement} [paypalFastCheckoutButton] - PayPal fast checkout button element
	 * @property {HTMLElement} [paypalPaymentButton] - PayPal payment button element
	 * @property {Function} [onGoBack] - Handler for back navigation
	 * @property {Function} [onClose] - Handler for closing checkout
	 * @property {Function} [onDismissNotice] - Handler for dismissing notices
	 * @property {boolean} [isFullscreen] - Whether checkout is in fullscreen mode
	 * @property {boolean} [useAbsoluteModalPosition] - Use absolute positioning for modals
	 */

	/** @type {CheckoutViewProps} */
	let {
		checkout,
		c2p,
		paypal = null,
		merchant = null,
		partner = null,
		notices = null,
		paypalFastCheckoutButton,
		paypalPaymentButton,
		onGoBack = () => {},
		onClose = () => {},
		onDismissNotice = () => {},
		isFullscreen = false,
		useAbsoluteModalPosition = false
	} = $props();

	let layoutColors = $derived({
		primary: merchant?.primaryColor || '#ffffff',
		action: merchant?.actionColor || '#333333'
	});
</script>

<div class="relative flex min-h-0 flex-1 flex-col">
	{#if checkout.view === 'error'}
		<ErrorView
			message={checkout.errorMessage}
			errorCode={checkout.errorCode}
			colors={layoutColors}
			{onClose}
		/>
	{:else if checkout.view === 'thankyou'}
		<ThankYou
			order={checkout.orderResult}
			merchantInfo={{
				largeLogo: merchant?.largeLogo,
				privacyPolicy: merchant?.privacyPolicy,
				termsOfUse: merchant?.termsOfUse
			}}
			colors={layoutColors}
			{onClose}
		/>
	{:else}
		<CheckoutForm
			{checkout}
			{c2p}
			{paypal}
			{merchant}
			{partner}
			{paypalFastCheckoutButton}
			{paypalPaymentButton}
			{onGoBack}
			{isFullscreen}
			{useAbsoluteModalPosition}
		/>
	{/if}

	{#if notices?.length}
		<NoticeContainer {notices} onDismiss={onDismissNotice} position="top-right" relative />
	{/if}
</div>
