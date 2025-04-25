<script>
	import { fly, slide, blur } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import { toCurrency } from '$lib/states/ui-config.svelte';
	import { phoneMask } from '$lib/utils/masks';
	import Icon from '@iconify/svelte';

	const MODES = {
		PREVIEW: 'PREVIEW',
		EDIT: 'EDIT',
		LIST: 'LIST'
	};

	/**
	 * @typedef {Object} CheckoutContainerProps
	 * @property {import('svelte').Snippets} addressList - The snippet to render the address list
	 * @property {import('svelte').Snippets} addressForm - The snippet to render the address form
	 * @property {import('svelte').Snippets} methodsList - The snippet to render the methods list
	 * @property {import('svelte').Snippets} paymentForm - The snippet to render the payment form
	 * @property {import('svelte').Snippets} cardsList - The snippet to render the cards list
	 * @property {Array<Object>} addresses - The list of addresses
	 * @property {Object} selectedAddress - The selected address
	 * @property {Array<Object>} shippingMethods - The list of shipping methods
	 * @property {Object} selectedShippingMethod - The selected shipping method
	 * @property {Array<Object>} cards - The list of cards
	 * @property {Object} selectedCard - The selected card
	 */

	/**
	 * @type {CheckoutContainerProps}
	 */
	let {
		// Snippets
		addressList,
		addressForm,
		methodsList,
		paymentForm,
		cardsList,

		// Bindables
		addresses = $bindable([]),
		selectedAddress = $bindable({}),
		shippingMethods = $bindable([]),
		selectedShippingMethod = $bindable({}),
		cards = $bindable([]),
		selectedCard = $bindable({})
	} = $props();

	let modes = $state({
		address: Object.keys(selectedAddress).length > 0 ? MODES.PREVIEW : MODES.EDIT, // preview, edit, list
		method: Object.keys(selectedShippingMethod).length > 0 ? MODES.PREVIEW : MODES.EDIT, // preview, edit
		payment: Object.keys(selectedCard).length > 0 ? MODES.PREVIEW : MODES.EDIT // preview, edit
	});

	function handleChangeAddress() {
		modes.address = addresses.length > 0 ? MODES.LIST : MODES.EDIT;
	}

	function handleSelectAddress() {
		modes.method = MODES.EDIT;
	}

	function handleAddNewAddress() {
		modes.address = MODES.EDIT;
		modes.method = MODES.EDIT;
	}

	function handleChangeCard() {
		modes.payment = cards.length > 0 ? MODES.LIST : MODES.EDIT;
	}

	function handleAddNewCard() {
		modes.payment = MODES.EDIT;
	}
</script>

<div class="flex flex-col gap-1 py-4">
	<div>
		{#if [MODES.EDIT, MODES.PREVIEW].includes(modes.address) || modes.method === MODES.EDIT}
			<p class="text-md mb-4 font-semibold" in:fly>{m.shipping_info()}</p>
		{/if}

		<!-- Address -->
		{#if modes.address === MODES.PREVIEW}
			<div
				class="group-item flex items-center justify-between text-sm"
				out:blur={{ duration: 5 }}
			>
				<span class="flex flex-col gap-1 p-5">
					<p class="border-border border-b font-bold">{selectedAddress.email}</p>
					<p>
						{selectedAddress.first_name}
						{selectedAddress.last_name} · {selectedAddress.address1}
						{selectedAddress.address2 ? ' ' + selectedAddress.address2 : ''} · {selectedAddress.city}
						· {selectedAddress.state_or_province}
						· {selectedAddress.postal_code}
						· {phoneMask(selectedAddress.phone)}
					</p>
				</span>
				<button
					class="h-full cursor-pointer p-5 text-sm text-blue-500"
					onclick={handleChangeAddress}>{m.change()}</button
				>
			</div>
		{:else if modes.address === MODES.LIST}
			<div class="mb-4" in:slide>
				{@render addressList({
					handleAddNewAddress,
					handleSelectAddress,
					selectedAddress,
					addresses
				})}
			</div>
		{:else if modes.address === MODES.EDIT}
			<div class="mb-4" in:slide>
				{@render addressForm({ selectedAddress })}
			</div>
		{/if}

		<!-- Methods -->
		{#if modes.method === MODES.PREVIEW}
			<div
				class="group-item flex w-full items-center justify-between text-sm"
				out:blur={{ duration: 5 }}
			>
				<div class="flex w-full items-center p-3">
					<span class="flex flex-1 flex-col gap-1 px-2">
						<p class="font-bold">{selectedShippingMethod?.description}</p>
						<!-- <p class="text-xs">{selectedShippingMethod.description}</p> -->
					</span>
					<p class="font-bold">{toCurrency(selectedShippingMethod?.price?.value)}</p>
				</div>
				<button
					class="h-full cursor-pointer p-5 text-sm text-blue-500"
					onclick={() => (modes.method = MODES.EDIT)}>{m.change()}</button
				>
			</div>
		{:else if modes.method === MODES.EDIT}
			<div
				class:mt-4={modes.address !== MODES.EDIT}
				class:mb-4={modes.payment !== MODES.EDIT}
				in:slide
			>
				{@render methodsList({ shippingMethods, selectedShippingMethod })}
			</div>
		{/if}

		<!-- Payment -->
		{#if modes.payment === MODES.EDIT}
			<p class="text-md mt-4 font-semibold" in:fly>{m.payment_method()}</p>
		{/if}
		{#if modes.payment === MODES.PREVIEW}
			<div
				class="group-item flex w-full items-center justify-between text-sm"
				out:blur={{ duration: 5 }}
			>
				<div class="flex w-full items-center gap-4 p-5">
					<Icon icon="fa6-brands:cc-visa" class="text-2xl" />
					<p class="font-bold">Visa *** 1111</p>
				</div>
				<button
					class="h-full cursor-pointer p-5 text-sm text-blue-500"
					onclick={handleChangeCard}>{m.change()}</button
				>
			</div>
		{:else if modes.payment === MODES.LIST}
			<div class="py-4" in:slide>
				{@render cardsList({
					handleAddNewCard,
					cards,
					selectedCard
				})}
			</div>
		{:else if modes.payment === MODES.EDIT}
			<div class="py-4" in:slide>
				{@render paymentForm()}
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference '../../../app.css';

	/* Base styling for all group items - fully rounded by default */
	.group-item {
		@apply border-border rounded-lg border;
	}

	/* Adjacent items adjustment */
	.group-item + .group-item {
		@apply mt-[-1px] rounded-t-none border-t-0;
	}

	/* Force ALL last items to have rounded bottoms */
	.group-item:last-child {
		@apply rounded-b-lg;
	}

	/* Force items followed by another group item to have flat bottom */
	.group-item:has(+ .group-item) {
		@apply rounded-b-none;
	}

	/* Space adjustment for non-adjacent items */
	div:not(.group-item) + .group-item {
		@apply mt-0;
	}
</style>
