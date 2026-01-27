<script>
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiInput from '$lib/components/ui/input.svelte';
	import IconCcBrand from '$lib/components/ui/icons/icon-cc-brand.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} PaymentCvvConfirmationProps
	 * @property {Object} card - Selected card details (first4, last4, brand)
	 * @property {string} [value] - CVV input value
	 * @property {string} [error] - Validation error message
	 * @property {boolean} [loading] - Disable inputs during submission
	 * @property {Function} [onCvvChange] - Handler for CVV input changes
	 * @property {Function} [onCancel] - Handler to switch to different card
	 * @property {import('svelte').Snippet} submitButton - Submit button content
	 */

	/** @type {PaymentCvvConfirmationProps} */
	let {
		card,
		value = '',
		error = '',
		loading = false,
		onCvvChange = () => {},
		onCancel = () => {},
		submitButton
	} = $props();

	let cvvInputRef = $state(null);

	$effect(() => {
		tick().then(() => {
			cvvInputRef?.focus();
		});
	});

	function handleChange(newValue) {
		onCvvChange(newValue);
	}
</script>

<div class="flex flex-col gap-4" in:fly={{ y: -20, duration: 300 }}>
	<!-- Selected card display -->
	<div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
		<IconCcBrand first4={card?.first4} class="text-2xl" />
		<div class="flex flex-col">
			<span class="text-sm font-medium">{card?.brand} **** {card?.last4}</span>
			<span class="text-muted text-xs">{m.enter_cvv_to_confirm()}</span>
		</div>
	</div>

	<!-- CVV Input -->
	<div class="cvv-input-wrapper">
		<UiInput
			bind:ref={cvvInputRef}
			onlyNumbers
			placeholder="CVV"
			maxlength="4"
			{value}
			onInput={handleChange}
			errorMessage={error}
			disabled={loading}
		>
			{#snippet suffix()}
				<Icon icon="ph:credit-card-duotone" class="text-muted text-xl" />
			{/snippet}
		</UiInput>
	</div>

	<!-- Submit Button -->
	<div class="w-full">
		{@render submitButton()}
	</div>

	<!-- Cancel/Change card link -->
	<button
		type="button"
		onclick={onCancel}
		disabled={loading}
		class="text-muted cursor-pointer px-4 py-2 text-center text-sm hover:underline disabled:cursor-not-allowed disabled:opacity-50"
	>
		{m.use_different_card()}
	</button>
</div>
