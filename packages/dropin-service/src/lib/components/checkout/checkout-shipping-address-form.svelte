<script>
	import Icon from '@iconify/svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';
	import UiGroup from '$lib/components/ui/ui-group.svelte';
	import UiSmallButton from '$lib/components/ui/ui-small-button.svelte';
	import UiLabel from '$lib/components/ui/ui-label.svelte';
	import * as m from '$lib/paraglide/messages';
	import { phoneMask, phoneUnmask, zipCodeMask, zipCodeUnmask } from '$lib/utils/masks';
	import UiAutocomplete from '$lib/components/ui/ui-autocomplete.svelte';
	import { useCheckoutForm } from '$lib/states/forms.svelte';

	/**
	 * @typedef {Object} CheckoutShippingAddressFormProps
	 * @property {boolean} useToBilling - Whether the address is used as billing
	 * @property {Array<{id: string, value: string}>} addressCompletions - The address completions
	 * @property {Function} onSelectAddressCompletion - The function to call when an address is selected
	 * @property {Function} onInputAddressCompletion - The function to call when the address is input
	 * @property {boolean} isAutocompleteLoading - Whether the autocomplete is loading
	 * @property {Object} selectedCompletionAddress - The selected completion address
	 * @property {Object} form - The form
	 */

	/**
	 * @type {CheckoutShippingAddressFormProps}
	 */
	let {
		useToBilling = false,
		isAutocompleteLoading = false,
		addressCompletions = [],
		selectedCompletionAddress = {},
		onSelectAddressCompletion,
		onInputAddressCompletion,
		form = useCheckoutForm()
	} = $props();

	let isManualMode = $state(form?.isFullFilled);

	function toggleManualMode() {
		isManualMode = !isManualMode;
	}

	$effect(() => {
		if (Object.keys(selectedCompletionAddress).length > 0) {
			isManualMode = true;

			form.address.validate(selectedCompletionAddress.address1);
			form.address2.validate(selectedCompletionAddress.address2);
			form.city.validate(selectedCompletionAddress.city);
			form.stateOrProvince.validate(selectedCompletionAddress.state_or_province);
			form.zipCode.validate(selectedCompletionAddress.postal_code);
		}
	});
</script>

<UiLabel
	label={!useToBilling ? m.shipping_address() : m.billing_address()}
	errorMessage={form.errors}
>
	<UiGroup>
		<UiInput
			placeholder={!useToBilling ? m.name() : m.full_name_on_card()}
			value={form.name.value}
			errorMessage={form.name.error}
			onChange={form.name.validate}
			name="name"
			autocomplete="name"
		/>
		<UiAutocomplete
			isOpen={!form.isFullFilled}
			onSelect={onSelectAddressCompletion}
			options={addressCompletions}
			value={form.address.value}
		>
			{#snippet input({ handleInput, value })}
				<UiInput
					{value}
					placeholder={m.address()}
					autocomplete="off"
					errorMessage={form.address.error}
					onChange={form.address.validate}
					onInput={(value) => {
						handleInput(value);

						if (value.length >= 4) {
							onInputAddressCompletion(value);
						}
					}}
				>
					{#snippet suffix()}
						<div class="flex items-center gap-x-1">
							{#if isAutocompleteLoading}
								<Icon icon="eos-icons:loading" class="text-muted h-4 w-4 animate-spin" />
							{/if}
							{#if !isManualMode}
								<UiSmallButton onclick={toggleManualMode}>{m.enter_manually()}</UiSmallButton>
							{/if}
							{#if form.address.filled && form.city.filled && form.stateOrProvince.filled && form.zipCode.filled}
								<UiSmallButton onclick={form.resetAddress}>{m.clear()}</UiSmallButton>
							{/if}
						</div>
					{/snippet}
				</UiInput>
			{/snippet}
			{#snippet bottomContent({ handleClose })}
				<button
					class="w-full cursor-pointer rounded-lg px-2 py-2 text-left text-xs underline"
					onclick={() => {
						handleClose();
						isManualMode = true;
					}}
				>
					{m.enter_manually()}
				</button>
			{/snippet}
		</UiAutocomplete>
		{#if isManualMode}
			<UiInput
				placeholder={m.addressLine2()}
				value={form.address2.value}
				errorMessage={form.address2.error}
				onChange={form.address2.validate}
			/>
			<UiGroup horizontal>
				<UiInput
					placeholder={m.city()}
					value={form.city.value}
					errorMessage={form.city.error}
					onChange={form.city.validate}
				/>
				<UiInput
					placeholder={m.zip()}
					value={form.zipCode.value}
					errorMessage={form.zipCode.error}
					onChange={form.zipCode.validate}
					mask={zipCodeMask}
					unmask={zipCodeUnmask}
					onlyNumbers={true}
				/>
			</UiGroup>
			<UiInput
				placeholder={m.state()}
				value={form.stateOrProvince.value}
				errorMessage={form.stateOrProvince.error}
				onChange={form.stateOrProvince.validate}
			/>
		{/if}
		<UiInput
			placeholder="(555) 555-0123"
			value={form.phoneNumber.value}
			errorMessage={form.phoneNumber.error}
			onChange={form.phoneNumber.validate}
			mask={phoneMask}
			unmask={phoneUnmask}
			onlyNumbers={true}
		>
			{#snippet prefix()}
				<p>🇺🇸</p>
			{/snippet}
		</UiInput>
	</UiGroup>
</UiLabel>
