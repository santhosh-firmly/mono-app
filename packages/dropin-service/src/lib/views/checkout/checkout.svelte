<script>
	import * as m from '$lib/paraglide/messages';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} CheckoutFormProps
	 * @property {Object} checkout - Checkout state object with form, cart, and methods
	 * @property {Object} c2p - Click to Pay state object
	 * @property {Object} [paypal] - PayPal state object
	 * @property {Object} [merchant] - Merchant configuration and branding
	 * @property {Object} [partner] - Partner configuration and branding
	 * @property {HTMLElement} [paypalFastCheckoutButton] - PayPal fast checkout button element
	 * @property {HTMLElement} [paypalPaymentButton] - PayPal payment button element
	 * @property {Function} [onGoBack] - Handler for back navigation
	 * @property {boolean} [isFullscreen] - Whether checkout is in fullscreen mode
	 * @property {boolean} [useAbsoluteModalPosition] - Use absolute positioning for modals
	 */

	import LayoutSingleFlow from '$lib/components/checkout/layout.svelte';
	import UiFirmlyPowered from '$lib/components/ui/firmly-powered.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';

	import HeaderContainer from '$lib/components/checkout/header.svelte';
	import HeaderGoback from '$lib/components/checkout/go-back.svelte';

	import SummaryImagesPreview from '$lib/components/checkout/summary-images-preview.svelte';
	import SummaryPrice from '$lib/components/checkout/summary-price.svelte';
	import SummaryWrapper from '$lib/components/checkout/summary-wrapper.svelte';
	import SummaryLineItem from '$lib/components/checkout/summary-line-item.svelte';
	import SummaryPromocode from '$lib/components/checkout/summary-promo-code.svelte';
	import SummaryResume from '$lib/components/checkout/summary-resume.svelte';
	import SummaryCollapsible from '$lib/components/checkout/summary-collapsible.svelte';

	import CheckoutFastButtons from '$lib/components/checkout/fast-checkout.svelte';
	import CheckoutShippingMethods from '$lib/components/checkout/shipping-methods.svelte';
	import CheckoutShippingAddressForm from '$lib/components/checkout/shipping-address-form.svelte';
	import ShippingEmail from '$lib/components/checkout/shipping-email.svelte';
	import CollapsedSection from '$lib/components/checkout/collapsed-section.svelte';
	import PurchaseButton from '$lib/components/checkout/purchase.svelte';
	import TermsBox from '$lib/components/checkout/terms-box.svelte';

	import CheckoutPaymentOptionSwitch from '$lib/components/checkout/payment-option-switch.svelte';
	import CheckoutPaymentForm from '$lib/components/checkout/payment-form.svelte';
	import CheckoutPaymentCardList from '$lib/components/checkout/payment-card-list.svelte';
	import CheckoutPaymentCollapsed from '$lib/components/checkout/payment-collapsed.svelte';
	import CheckoutPaymentPaypal from '$lib/components/checkout/payment-paypal.svelte';
	import ClickToPayModal from '$lib/components/checkout/click-to-pay-modal.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import PaymentCvvConfirmation from '$lib/components/checkout/payment-cvv-confirmation.svelte';

	/** @type {CheckoutFormProps} */
	let {
		checkout,
		c2p,
		paypal = null,
		merchant = null,
		partner = null,
		paypalFastCheckoutButton,
		paypalPaymentButton,
		onGoBack = () => {},
		isFullscreen = false,
		useAbsoluteModalPosition = false
	} = $props();

	// UI-only state
	let forceExpandShipping = $state(false);
	let forceExpandShippingMethod = $state(false);
	let forceExpandPayment = $state(false);
	let forceManualMode = $state(false);
	let showMiniOverview = $state(false);

	// DOM references
	let headerRef = $state(null);
	let summaryPreviewRef = $state(null);
	let paypalFastCheckoutContainer = $state(null);
	let paypalPaymentContainer = $state(null);
	let layoutContainerRef = $state(null);

	// UI-derived values
	let layoutColors = $derived({
		primary: merchant?.actionColor || '#333333',
		background: merchant?.primaryColor || '#ffffff'
	});

	let resolvedPartnerName = $derived(partner?.displayName);
	let resolvedMerchantName = $derived(checkout.cart?.display_name);
	// Fullscreen is the standalone checkout; non-fullscreen is embedded in a buy-now flow
	let isBuyFlow = $derived(!isFullscreen);

	let termsAnchors = $derived.by(() => {
		const merchantAnchors = [
			{ label: `${resolvedMerchantName} Terms of Service`, url: merchant?.termsOfUse },
			{ label: `${resolvedMerchantName} Privacy Policy`, url: merchant?.privacyPolicy }
		];

		if (!isBuyFlow) return merchantAnchors;

		const partnerAnchors = [
			{ label: `${resolvedPartnerName} Terms of Service`, url: partner?.termsOfUse },
			{ label: `${resolvedPartnerName} Privacy Policy`, url: partner?.privacyPolicy }
		];

		return [...partnerAnchors, ...merchantAnchors];
	});

	let isShippingCollapsed = $derived(!forceExpandShipping && checkout.shippingPreFilled);
	let isShippingMethodCollapsed = $derived(
		!forceExpandShippingMethod && checkout.hadInitialShippingMethod
	);
	let isPaymentCollapsed = $derived(
		!forceExpandPayment &&
			checkout.hadInitialCard &&
			!!checkout.selectedCard &&
			!checkout.showPaymentCvvConfirmation
	);

	// IntersectionObserver for mini overview
	$effect(() => {
		if (!summaryPreviewRef || typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					showMiniOverview = !entry.isIntersecting;
				});
			},
			{ threshold: 0.1 }
		);

		observer.observe(summaryPreviewRef);
		return () => observer.disconnect();
	});

	// Initialize forms when cart changes
	$effect(() => {
		checkout.initializeForms(
			checkout.cart?.shipping_info || {},
			checkout.cart?.billing_info || {}
		);
	});

	// Force manual mode when email is autofilled
	$effect(() => {
		if (checkout.emailAutofillDetected) {
			forceManualMode = true;
		}
	});

	// Sync email to cart
	$effect(() => {
		checkout.syncEmailToCart();
	});

	// Auto-submit shipping when ready
	$effect(() => {
		checkout.submitShippingIfReady();
	});

	// Render PayPal buttons
	$effect(() => {
		if (paypal?.initialized && paypalFastCheckoutContainer) {
			paypal.renderButton(paypalFastCheckoutContainer, () => checkout.placeOrder('paypal'));
		}
	});

	$effect(() => {
		if (paypal?.initialized && paypalPaymentContainer) {
			paypal.renderButton(paypalPaymentContainer, () => checkout.placeOrder('paypal'), {
				label: 'pay'
			});
		}
	});

	// Update forms and lock payment method when PayPal is authorized
	$effect(() => {
		if (paypal?.isAuthorized && checkout.cart?.shipping_info) {
			checkout.shippingForm?.setValues(checkout.cart.shipping_info);
			checkout.shippingPreFilled = true;
			if (checkout.cart?.billing_info) {
				checkout.billingForm?.setValues(checkout.cart.billing_info);
			}
			checkout.selectedPaymentMethod = 'paypal';
		}
	});

	async function handleEmailBlur() {
		const email = checkout.shippingForm.email.value;
		const isValid = checkout.shippingForm.email.filled && !checkout.shippingForm.email.error;

		if (!isValid || !c2p?.initialized || c2p?.userLoggedIn) return;

		await c2p.validateEmail(email, 'EMAIL');
	}

	let undoingItems = $state({});
	let promoError = $state('');

	async function handleQuantityChange(item) {
		if (!item?.sku || item.quantity === undefined) return;

		checkout.clearLineItemError(item.sku);

		let result;
		if (item.quantity === 0) {
			result = await checkout.removeLineItem(item.sku);
		} else {
			result = await checkout.updateLineItem(item.sku, item.quantity);
		}

		if (!result.success && result.error) {
			checkout.setLineItemError(item.sku, result.error);
		}
	}

	async function handleUndoRemoval(sku) {
		undoingItems = { ...undoingItems, [sku]: true };
		checkout.clearLineItemError(sku);

		const result = await checkout.undoRemoval(sku);

		if (!result.success && result.error) {
			checkout.setLineItemError(sku, result.error);
		}

		undoingItems = Object.fromEntries(
			Object.entries(undoingItems).filter(([key]) => key !== sku)
		);
	}

	async function handlePromoSubmit(code) {
		promoError = '';
		const result = await checkout.addPromo(code);

		if (!result.success && result.error) {
			promoError = result.error;
		}
	}

	async function handlePromoRemoveAll() {
		promoError = '';
		await checkout.removeAllPromos();
	}

	function clearSavedCards() {
		checkout.selectedCardId = null;
		checkout.storage = { ...checkout.storage, credit_cards: [] };
		if (c2p) {
			c2p.reset();
			c2p.initialized = true;
		}
	}

	function handleCancelCvv() {
		if (checkout.cancelCvvConfirmation()) {
			forceExpandPayment = true;
		}
	}
</script>

{#snippet CartSummary({ hiddenLineItems = false, hiddenTotal = false, hideQuantity = false } = {})}
	<SummaryWrapper>
		{#snippet lineItems()}
			{#if checkout.lineItems.length > 0 && !hiddenLineItems}
				<div class="border-b-border flex flex-col gap-4 border-b pb-8">
					{#each checkout.lineItems as item (item.sku)}
						<div transition:slide={{ duration: 300 }}>
							<SummaryLineItem
								image={item.image}
								title={item.title}
								description={item.description}
								price={item.price}
								quantity={item.quantity}
								pendingRemoval={item.pendingRemoval}
								isUndoing={undoingItems[item.sku]}
								removalCountdown={checkout.removalCountdowns[item.sku] || 0}
								onQuantityChange={(qty) =>
									handleQuantityChange({ ...item, quantity: qty })}
								onUndo={() => handleUndoRemoval(item.sku)}
								disabled={checkout.isCartLoading}
								error={checkout.lineItemErrors[item.sku] || ''}
								{hideQuantity}
							/>
						</div>
					{/each}
				</div>
			{/if}
		{/snippet}
		{#snippet promocode()}
			{#if checkout.features.promoCodes}
				<SummaryPromocode
					promocodes={checkout.cart?.promo_codes}
					isSubmitting={checkout.pending?.ADD_PROMO_CODE}
					isRemovingAll={checkout.pending?.REMOVE_ALL_CODES}
					error={promoError}
					onSubmit={handlePromoSubmit}
					onRemoveAll={handlePromoRemoveAll}
				/>
			{/if}
		{/snippet}
		{#snippet resume()}
			<SummaryResume
				isCalculating={checkout.isCartLoading}
				shipping={{
					price: checkout.cart?.shipping_method?.price?.value,
					description: checkout.cart?.shipping_method?.description
				}}
				total={checkout.cart?.total?.value}
				subtotal={checkout.cart?.sub_total?.value}
				tax={checkout.cart?.tax?.value}
				{hiddenTotal}
			/>
		{/snippet}
	</SummaryWrapper>
{/snippet}

{#snippet EmailSection()}
	<ShippingEmail
		form={checkout.shippingForm}
		onBlur={handleEmailBlur}
		isValidating={c2p?.isValidatingEmail}
		c2pInitialized={c2p?.initialized}
	/>

	{#if c2p?.error}
		<span class="text-danger py-2 text-xs">{c2p.error}</span>
	{/if}
{/snippet}

{#snippet ShippingSection()}
	<div class="flex flex-col gap-4">
		<CheckoutShippingAddressForm
			form={checkout.shippingForm}
			addressCompletions={checkout.shippingAutocomplete.completions}
			selectedCompletionAddress={checkout.shippingAutocomplete.selectedAddress}
			isAutocompleteLoading={checkout.shippingAutocomplete.isLoading}
			{forceManualMode}
			externalError={checkout.errors.shipping}
			onInputAddressCompletion={(q) => checkout.searchAddress(q, 'shipping')}
			onSelectAddressCompletion={(o) => checkout.selectAddress(o, 'shipping')}
		/>

		<CheckoutShippingMethods
			shippingMethods={checkout.cart?.shipping_method_options || []}
			selectedShippingMethod={checkout.cart?.shipping_method}
			onSelect={(sku) => checkout.selectShippingMethod(sku)}
			isUpdating={checkout.pending?.UPDATE_SHIPPING_METHOD}
			isLoading={checkout.pending?.SET_SHIPPING_ADDRESS}
		/>

		{#if checkout.errors.shippingMethod}
			<span class="text-danger py-2 text-xs">{checkout.errors.shippingMethod}</span>
		{/if}
	</div>
{/snippet}

{#snippet PaymentSection()}
	{#if checkout.hasStoredCards}
		<CheckoutPaymentCardList
			cards={checkout.storage?.credit_cards}
			selectedCard={checkout.selectedCard}
			disabled={checkout.placeOrderPending}
			onSelect={(card) => {
				const cardId = card?.id || card?.pan;
				handleCancelCvv();
				checkout.selectedCardId = cardId || null;

				// Re-selecting a card that previously required CVV
				if (card && checkout.cardRequiresCvv(cardId)) {
					checkout.setCvvRequired(true);
				}
			}}
			onAddNewCard={clearSavedCards}
			onNotYourCards={clearSavedCards}
		/>
	{:else}
		<CheckoutPaymentOptionSwitch
			showPaypal={checkout.features.paypal}
			selectedMethod={checkout.selectedPaymentMethod}
			onMethodChange={(method) => {
				checkout.selectedPaymentMethod = method;
			}}
		>
			{#snippet card()}
				<CheckoutPaymentForm
					bind:useBillingAsShipping={checkout.useBillingAddress}
					onFullfilled={(data) => checkout.setPaymentFormData(data)}
				>
					{#snippet billingAddressForm()}
						<CheckoutShippingAddressForm
							useToBilling
							form={checkout.billingForm}
							addressCompletions={checkout.billingAutocomplete.completions}
							selectedCompletionAddress={checkout.billingAutocomplete.selectedAddress}
							onInputAddressCompletion={(q) => checkout.searchAddress(q, 'billing')}
							onSelectAddressCompletion={(o) => checkout.selectAddress(o, 'billing')}
							isAutocompleteLoading={checkout.billingAutocomplete.isLoading}
						/>
					{/snippet}
				</CheckoutPaymentForm>
			{/snippet}
			{#snippet paypalOption()}
				<CheckoutPaymentPaypal
					connected={paypal?.isAuthorized ?? false}
					bind:buttonContainer={paypalPaymentContainer}
					paypalButton={paypalPaymentButton}
				/>
			{/snippet}
		</CheckoutPaymentOptionSwitch>
	{/if}
{/snippet}

{#snippet BackButton()}
	<HeaderGoback
		logoUrl={merchant?.largeLogo}
		storeName={checkout.domain}
		onclick={onGoBack}
		{isFullscreen}
	/>
{/snippet}

{#snippet MobileHeader()}
	<HeaderContainer
		bind:this={headerRef}
		itemsQuantity={checkout.itemsQuantity}
		totalPrice={checkout.totalPrice}
		{showMiniOverview}
		productImage={checkout.cart?.line_items?.[0]?.image?.url}
		colors={layoutColors}
	>
		{#snippet backButton()}{@render BackButton()}{/snippet}
		{#snippet summary()}{@render CartSummary()}{/snippet}
	</HeaderContainer>
{/snippet}

{#snippet LeftSide()}
	<button
		bind:this={summaryPreviewRef}
		class="w-full cursor-pointer @3xl:hidden"
		onclick={() => headerRef?.openSummary()}
	>
		<SummaryImagesPreview images={checkout.cart?.line_items?.map((item) => item.image?.url)}>
			<SummaryPrice
				isCalculating={checkout.isCartLoading}
				itemsQuantity={checkout.itemsQuantity}
				totalPrice={checkout.totalPrice}
			/>
		</SummaryImagesPreview>
	</button>
	<div class="hidden flex-col @3xl:flex @3xl:gap-9">
		{@render BackButton()}
		<SummaryPrice
			class="self-start"
			isCalculating={checkout.isCartLoading}
			itemsQuantity={checkout.itemsQuantity}
			totalPrice={checkout.totalPrice}
		/>
		{@render CartSummary()}
	</div>
	<div class="mt-10 hidden justify-center @3xl:flex">
		<UiFirmlyPowered />
	</div>
{/snippet}

{#snippet CollapsedShippingInfo()}
	<CollapsedSection onchange={() => (forceExpandShipping = true)} grouped>
		<span class="text-sm font-bold">
			{checkout.cart?.shipping_info?.email || checkout.cart?.email}
		</span>
		{#if checkout.cart?.shipping_info?.address1}
			<hr class="border-border my-2" />
			<span class="text-sm">
				{checkout.formatShippingAddress(checkout.cart?.shipping_info)}
			</span>
		{/if}
	</CollapsedSection>
{/snippet}

{#snippet CollapsedShippingMethod()}
	<CollapsedSection onchange={() => (forceExpandShippingMethod = true)} grouped icon="switch">
		<div class="flex flex-row justify-between text-sm">
			<span class="font-bold">
				{checkout.cart?.shipping_method?.description}
			</span>
			<span class="font-bold">
				{checkout.cart?.shipping_method?.price?.symbol}{checkout.cart?.shipping_method
					?.price?.value}
			</span>
		</div>
		{#if checkout.cart?.shipping_method?.estimate}
			<span class="text-xs text-gray-500">
				{checkout.cart?.shipping_method?.estimate}
			</span>
		{/if}
	</CollapsedSection>
{/snippet}

{#snippet CollapsedPayment()}
	<CheckoutPaymentCollapsed
		card={checkout.selectedCard}
		onchange={() => (forceExpandPayment = true)}
		grouped
	/>
{/snippet}

{#snippet ExpandedShippingMethods()}
	<CheckoutShippingMethods
		shippingMethods={checkout.cart?.shipping_method_options || []}
		selectedShippingMethod={checkout.cart?.shipping_method}
		onSelect={(sku) => checkout.selectShippingMethod(sku)}
		isUpdating={checkout.pending?.UPDATE_SHIPPING_METHOD}
		isLoading={checkout.pending?.SET_SHIPPING_ADDRESS}
	/>
	{#if checkout.errors.shippingMethod}
		<span class="text-danger py-2 text-xs">{checkout.errors.shippingMethod}</span>
	{/if}
{/snippet}

{#snippet RightSide()}
	{@const allCollapsed = isShippingCollapsed && isPaymentCollapsed && checkout.selectedCard}
	{@const hasShippingMethod =
		isShippingMethodCollapsed && checkout.cart?.shipping_method?.description}

	<div class="flex flex-col gap-6">
		{#if checkout.features.paypal && !paypal?.isAuthorized}
			<CheckoutFastButtons
				use={['paypal']}
				onclick={(method) => checkout.useFastCheckout(method)}
				bind:paypalButtonContainer={paypalFastCheckoutContainer}
				paypalButton={paypalFastCheckoutButton}
			/>
		{/if}

		{#if allCollapsed && hasShippingMethod}
			<section>
				<UiGroup>
					{@render CollapsedShippingInfo()}
					{@render CollapsedShippingMethod()}
					{@render CollapsedPayment()}
				</UiGroup>
			</section>
		{:else if allCollapsed && !hasShippingMethod}
			<section>
				<UiGroup>
					{@render CollapsedShippingInfo()}
				</UiGroup>
				<div class="mt-4">
					{@render ExpandedShippingMethods()}
				</div>
			</section>

			<section>
				<UiGroup>
					{@render CollapsedPayment()}
				</UiGroup>
			</section>
		{:else}
			<section>
				{#if isShippingCollapsed}
					<UiGroup>
						{@render CollapsedShippingInfo()}
						{#if hasShippingMethod}
							{@render CollapsedShippingMethod()}
						{/if}
					</UiGroup>

					{#if !hasShippingMethod}
						<div class="mt-4">
							{@render ExpandedShippingMethods()}
						</div>
					{/if}
				{:else}
					<h2 class="mb-4 text-sm font-semibold text-gray-700">{m.shipping_info()}</h2>
					<div class="flex flex-col gap-4">
						{@render EmailSection()}
						{@render ShippingSection()}
					</div>
				{/if}
			</section>

			<section>
				{#if isPaymentCollapsed && checkout.selectedCard}
					<UiGroup>
						{@render CollapsedPayment()}
					</UiGroup>
				{:else}
					<h2 class="mb-4 text-sm font-semibold text-gray-700">{m.payment_method()}</h2>
					{@render PaymentSection()}
				{/if}
			</section>
		{/if}

		<div class="flex flex-col gap-4 @3xl:hidden">
			<SummaryCollapsible>
				{#snippet collapsibleContent()}
					<div class="border-b-border flex flex-col gap-4 border-b pb-4">
						{#each checkout.lineItems as item, index (index)}
							<SummaryLineItem
								image={item.image}
								title={item.title}
								description={item.description}
								price={item.price}
								quantity={item.quantity}
								hideQuantity
							/>
						{/each}
					</div>
				{/snippet}
			</SummaryCollapsible>
			{@render CartSummary({ hiddenLineItems: true })}
		</div>

		{#if checkout.features.terms}
			<div class="mt-4">
				<TermsBox
					partnerName={isBuyFlow ? resolvedPartnerName : ''}
					merchantName={resolvedMerchantName}
					anchors={termsAnchors}
				/>
			</div>
		{/if}

		<!-- Hide Place Order when CVV modal is showing (button is inside modal) -->
		{#if !checkout.showPaymentCvvConfirmation}
			<div class="mt-4">
				<PurchaseButton
					disabled={!checkout.canPlaceOrder || checkout.isCartLoading}
					loading={checkout.placeOrderPending}
					success={!!checkout.orderResult}
					totalPrice={checkout.totalPrice}
					error={checkout.placeOrderError}
					onSubmit={() => checkout.placeOrder(checkout.selectedPaymentMethod)}
					onAnimationComplete={() => checkout.goToThankYou()}
				/>
			</div>
		{/if}

		<div class="my-6 flex justify-center @3xl:hidden">
			<UiFirmlyPowered />
		</div>
	</div>
{/snippet}

<div
	bind:this={layoutContainerRef}
	class="relative flex min-h-0 flex-1 flex-col overflow-hidden"
	class:overflow-hidden={(c2p?.showModal || checkout.showPaymentCvvConfirmation) &&
		useAbsoluteModalPosition}
>
	<!-- Scrollable content area -->
	<div class="flex-1 overflow-auto">
		<LayoutSingleFlow isLoading={checkout.pending?.cart} colors={layoutColors}>
			{#snippet mobileHeader()}{@render MobileHeader()}{/snippet}
			{#snippet asection()}{@render LeftSide()}{/snippet}
			{#snippet bsection()}{@render RightSide()}{/snippet}
		</LayoutSingleFlow>
	</div>

	<!-- Click to Pay Modal -->
	<ClickToPayModal
		show={c2p?.showModal}
		otpDestination={c2p?.otpDestination || { emails: [], phones: [] }}
		network={c2p?.network || 'mastercard'}
		isLoading={c2p?.isVerifyingOtp}
		error={c2p?.error}
		onSubmit={(code) => c2p?.verifyOtp(code)}
		onClose={() => c2p?.closeModal()}
		onResendOtp={(channel) => c2p?.resendOtp(channel)}
		useAbsolutePosition={useAbsoluteModalPosition}
	/>

	<!-- CVV Confirmation Modal -->
	<Modal
		show={checkout.showPaymentCvvConfirmation}
		onClose={handleCancelCvv}
		loading={checkout.cvvLoading}
		useAbsolutePosition={useAbsoluteModalPosition}
		ariaLabelledby="cvv-modal-title"
	>
		<div class="p-6">
			<h2 id="cvv-modal-title" class="sr-only">Confirm CVV</h2>
			<PaymentCvvConfirmation
				card={checkout.selectedCard}
				value={checkout.cvvValue}
				error={checkout.cvvError}
				loading={checkout.cvvLoading}
				onCvvChange={(v) => (checkout.cvvValue = v)}
				onCancel={handleCancelCvv}
			>
				{#snippet submitButton()}
					<PurchaseButton
						disabled={!checkout.canPlaceOrder || checkout.cvvValue.length < 3}
						loading={checkout.placeOrderPending}
						success={!!checkout.orderResult}
						totalPrice={checkout.totalPrice}
						error={checkout.placeOrderError}
						onSubmit={() => checkout.placeOrder(checkout.selectedPaymentMethod)}
						onAnimationComplete={() => checkout.goToThankYou()}
						hideSecureMessage
						class="w-full"
					/>
				{/snippet}
			</PaymentCvvConfirmation>
		</div>
	</Modal>
</div>
