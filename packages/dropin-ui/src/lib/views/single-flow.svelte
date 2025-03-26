<script>
	// Layout
	import LayoutSingleFlow from '$lib/components/layout-single-flow.svelte';
	import UiFirmlyPowered from '$lib/components/ui/ui-firmly-powered.svelte';

	// Header
	import HeaderContainer from '$lib/components/header/header-container.svelte';
	import HeaderGoback from '$lib/components/header/header-goback.svelte';

	// Cart
	import CartContainer from '$lib/components/cart/cart-container.svelte';
	import CartResume from '$lib/components/cart/cart-resume.svelte';

	// Cart Summary
	import CartSummaryContainer from '$lib/components/cart/cart-summary-container.svelte';
	import CartSummaryPromoCode from '$lib/components/cart/cart-summary-promocode.svelte';
	import CartSummaryResume from '$lib/components/cart/cart-summary-resume.svelte';

	// Checkout
	import CheckoutFastButtons from '$lib/components/checkout/checkout-fast-buttons.svelte';
	import CheckoutContainer from '$lib/components/checkout/checkout-container.svelte';
	import CheckoutSummary from '$lib/components/checkout/checkout-summary.svelte';

	// Checkout Shipping
	import CheckoutShippingEmailForm from '$lib/components/checkout/checkout-shipping-email-form.svelte';
	import CheckoutShippingAddressForm from '$lib/components/checkout/checkout-shipping-address-form.svelte';
	import CheckoutShippingMethods from '$lib/components/checkout/checkout-shipping-methods.svelte';
	import CheckoutShippingList from '$lib/components/checkout/checkout-shipping-list.svelte';

	// Checkout Payment
	import CheckoutPaymentContainer from '$lib/components/checkout/checkout-payment-container.svelte';
	import CheckoutPaymentForm from '$lib/components/checkout/checkout-payment-form.svelte';
	import CheckoutPaymentCardList from '$lib/components/checkout/checkout-payment-card-list.svelte';
	import CheckoutPaymentPaypal from '$lib/components/checkout/checkout-payment-paypal.svelte';

	// Checkout Footer
	import CheckoutFooter from '$lib/components/checkout/checkout-footer.svelte';

	// Forms
	import { useCheckoutForm } from '$lib/states/forms.svelte';

	let { data, dispatch } = $props();

	let checkoutForm = useCheckoutForm(data.cart?.shipping_info);
	let billingForm = useCheckoutForm(data.cart?.billing_info);
	let useBillingAddress = $state(false);

	function handleSubmit() {
		if (!useBillingAddress && checkoutForm.isFullFilled) {
			dispatch('place_order');
			return;
		}

		checkoutForm.validate();

		if (useBillingAddress) {
			billingForm.validate();
		}
	}

	let totalPrice = $derived(data.cart?.total?.value);
	let itemsQuantity = $derived(data.cart?.line_items.reduce((acc, item) => acc + item.quantity, 0));
	let isFullCartUpdating = $derived(
		data.pending['update_line_item'] ||
			data.pending['add_promo_code'] ||
			data.pending['remove_all_codes'] ||
			data.pending['calculate_shipping'] ||
			data.pending['set_shipping_address'] ||
			data.pending['update_shipping_method']
	);

	$effect(() => {
		if (checkoutForm.isFullFilled && !checkoutForm.startedFullFilled) {
			dispatch('set_shipping_address', {
				email: checkoutForm.email.value,
				first_name: checkoutForm.name.value.split(' ')[0],
				last_name: checkoutForm.name.value.split(' ')[1],
				address1: checkoutForm.address.value,
				city: checkoutForm.city.value,
				state_or_province: checkoutForm.stateOrProvince.value,
				postal_code: checkoutForm.zipCode.value
			});
		}
	});
</script>

<!-- Cart Summary used in both the left and right side of the UI -->
{#snippet CartSummary({ isCheckoutSummary = false, hiddenLineItems = false } = {})}
	<CartSummaryContainer
		{hiddenLineItems}
		onQuantityChange={(item) => dispatch('update_line_item', item)}
		isUpdating={isFullCartUpdating}
		items={data.cart?.line_items?.map((item) => ({
			image: item.image?.url,
			title: item?.description,
			description: item?.variant_description,
			price: item?.line_price.value,
			quantity: item?.quantity
		}))}
	>
		{#snippet promocode()}
			<CartSummaryPromoCode
				promocodes={data.cart?.promo_codes}
				isSubmitting={data.pending['add_promo_code']}
				isRemovingAll={data.pending['remove_all_codes']}
				onSubmit={(promocode) => dispatch('add_promo_code', promocode)}
				onRemoveAll={() => dispatch('remove_all_codes')}
			/>
		{/snippet}
		{#snippet resume()}
			<CartSummaryResume
				isCalculating={isFullCartUpdating}
				shipping={{
					price: data.cart?.shipping_method?.price?.value,
					description: data.cart?.shipping_method?.description
				}}
				total={data.cart?.total?.value}
				subtotal={data.cart?.sub_total?.value}
				tax={data.cart?.tax?.value}
				hiddenTotal={isCheckoutSummary}
			/>
		{/snippet}
	</CartSummaryContainer>
{/snippet}

<!-- The left side of the UI -->
{#snippet LeftSide()}
	<HeaderContainer class="md:hidden" logoUrl={data.store?.logoUrl} {itemsQuantity} {totalPrice}>
		{#snippet backButton()}{@render BackButton()}{/snippet}
		{#snippet summary()}{@render CartSummary()}{/snippet}
	</HeaderContainer>
	<CartContainer class="md:hidden" images={data.cart?.line_items?.map((item) => item.image?.url)}>
		<CartResume isCalculating={isFullCartUpdating} {itemsQuantity} {totalPrice} />
	</CartContainer>
	<div class="hidden flex-col md:flex md:gap-9">
		{@render BackButton()}
		<CartResume
			class="self-start"
			isCalculating={isFullCartUpdating}
			{itemsQuantity}
			{totalPrice}
		/>
		{@render CartSummary()}
	</div>
	<div class="mt-10 hidden justify-center md:flex">
		<UiFirmlyPowered />
	</div>
{/snippet}

<!-- The right side of the UI -->
{#snippet RightSide()}
	<CheckoutFastButtons
		use={['shoppay', 'paypal']}
		onclick={(method) => dispatch('use_fast_checkout', method)}
	/>
	<CheckoutContainer
		addresses={data.storage?.shipping_addresses}
		shippingMethods={data.cart?.shipping_method_options}
		cards={data.storage?.credit_cards}
		selectedAddress={data.cart?.shipping_info}
		selectedShippingMethod={data.cart?.shipping_method}
		selectedCard={data.storage?.credit_cards?.[0]}
	>
		{#snippet addressList({ addresses, selectedAddress, handleAddNewAddress, handleSelectAddress })}
			<CheckoutShippingList
				{addresses}
				{selectedAddress}
				disabled={isFullCartUpdating}
				onSelect={(shippingAddress) => {
					dispatch('set_shipping_address', shippingAddress);
					handleSelectAddress();
				}}
				onAddNewAddress={handleAddNewAddress}
			/>
		{/snippet}
		{#snippet addressForm()}
			<div class="flex flex-col gap-4">
				<CheckoutShippingEmailForm form={checkoutForm} />
				<CheckoutShippingAddressForm
					form={checkoutForm}
					selectedCompletionAddress={data?.autocomplete.shippingAddress}
					onInputAddressCompletion={(value) => dispatch('input_shipping_address_completion', value)}
					onSelectAddressCompletion={(value) =>
						dispatch('select_shipping_address_completion', value)}
					isAutocompleteLoading={data.pending['input_shipping_address_completion'] ||
						data.pending['select_shipping_address_completion']}
					addressCompletions={data?.autocomplete.shippingCompletions}
				/>
			</div>
		{/snippet}
		{#snippet methodsList({ shippingMethods, selectedShippingMethod })}
			<CheckoutShippingMethods
				{shippingMethods}
				{selectedShippingMethod}
				onSelect={(shippingMethod) => dispatch('update_shipping_method', shippingMethod)}
				isUpdating={isFullCartUpdating}
				isLoading={data.pending['calculate_shipping'] || data.pending['set_shipping_address']}
			/>
		{/snippet}
		{#snippet cardsList({ cards, selectedCard, handleAddNewCard })}
			<CheckoutPaymentCardList
				{cards}
				{selectedCard}
				disabled={isFullCartUpdating}
				onSelect={(card) => dispatch('set_credit_card', card)}
				onAddNewCard={handleAddNewCard}
			/>
		{/snippet}
		{#snippet paymentForm()}
			<CheckoutPaymentContainer>
				{#snippet card()}
					<CheckoutPaymentForm bind:useBillingAsShipping={useBillingAddress}>
						{#snippet billingAddressForm()}
							<CheckoutShippingAddressForm
								useToBilling
								form={billingForm}
								addressCompletions={data?.autocomplete.billingCompletions}
								selectedCompletionAddress={data?.autocomplete.billingAddress}
								onInputAddressCompletion={(value) =>
									dispatch('input_billing_address_completion', value)}
								onSelectAddressCompletion={(value) => {
									dispatch('select_billing_address_completion', value);
								}}
								isAutocompleteLoading={data.pending['input_billing_address_completion'] ||
									data.pending['select_billing_address_completion']}
							/>
						{/snippet}
					</CheckoutPaymentForm>
				{/snippet}
				{#snippet paypal()}
					<CheckoutPaymentPaypal onclick={() => dispatch('use_fast_checkout', 'paypal')} />
				{/snippet}
			</CheckoutPaymentContainer>
		{/snippet}
	</CheckoutContainer>
	<CheckoutSummary class="md:hidden">
		{#snippet summary(hiddenLineItems)}
			{@render CartSummary({ hiddenLineItems, isCheckoutSummary: true })}
		{/snippet}
	</CheckoutSummary>
	<div class="mt-8">
		<CheckoutFooter disabled={isFullCartUpdating} {totalPrice} onSubmit={handleSubmit} />
		<div class="mt-12 mb-8 flex justify-center md:hidden">
			<UiFirmlyPowered />
		</div>
	</div>
{/snippet}

<!-- Back button used in both the left and right side of the UI -->
{#snippet BackButton()}
	<HeaderGoback logoUrl={data.store?.logoUrl} onclick={() => dispatch('go_back')} />
{/snippet}

<!-- The main layout of the UI -->
<LayoutSingleFlow isLoading={data.pending['cart']}>
	{#snippet asection()}{@render LeftSide()}{/snippet}
	{#snippet bsection()}{@render RightSide()}{/snippet}
</LayoutSingleFlow>
