<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiInput from '$lib/components/ui/input.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';
	import UiSmallButton from '$lib/components/ui/small-button.svelte';
	import UiLabel from '$lib/components/ui/label.svelte';
	import * as m from '$lib/paraglide/messages';
	import { phoneMask, phoneUnmask, zipCodeMask, zipCodeUnmask } from '$lib/utils/masks';
	import UiAutocomplete from '$lib/components/ui/autocomplete.svelte';
	import { autofillDetection } from '$lib/directives/autofill-detection.js';

	/**
	 * @typedef {Object} CheckoutShippingAddressFormProps
	 * @property {boolean} useToBilling - Whether the address is used as billing
	 * @property {Array<{id: string, value: string}>} addressCompletions - The address completions
	 * @property {Function} onSelectAddressCompletion - The function to call when an address is selected
	 * @property {Function} onInputAddressCompletion - The function to call when the address is input
	 * @property {boolean} isAutocompleteLoading - Whether the autocomplete is loading
	 * @property {Object} selectedCompletionAddress - The selected completion address
	 * @property {Object} form - The form object (REQUIRED - must be passed from container)
	 * @property {string} externalError - External error message to display
	 */

	/**
	 * @type {CheckoutShippingAddressFormProps}
	 */
	let {
		useToBilling = false,
		isAutocompleteLoading = false,
		addressCompletions = [],
		selectedCompletionAddress = null,
		onSelectAddressCompletion,
		onInputAddressCompletion,
		form,
		forceManualMode = false,
		externalError = ''
	} = $props();

	let isManualMode = $state(false);
	let isAutofilling = $state(false);

	// Allow external control of manual mode
	$effect(() => {
		if (forceManualMode) {
			isManualMode = true;
		}
	});

	function toggleManualMode() {
		isManualMode = !isManualMode;
	}

	// Auto-enable manual mode when address autocomplete selects an address
	$effect(() => {
		if (selectedCompletionAddress && Object.keys(selectedCompletionAddress).length > 0) {
			isManualMode = true;

			form.address.validate(selectedCompletionAddress.address1);
			form.address2.validate(selectedCompletionAddress.address2);
			form.city.validate(selectedCompletionAddress.city);
			form.stateOrProvince.validate(selectedCompletionAddress.state_or_province);
			form.zipCode.validate(selectedCompletionAddress.postal_code);
		}
	});

	// Auto-enable manual mode if form is pre-filled from cart
	$effect(() => {
		if (form.city.filled || form.zipCode.filled || form.stateOrProvince.filled) {
			isManualMode = true;
		}
	});

	function handleAutofillDetected() {
		isManualMode = true;
		isAutofilling = true;
		setTimeout(() => {
			isAutofilling = false;
		}, 1000);
	}
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
			autocomplete="{useToBilling ? 'billing' : 'shipping'} name"
		/>
		<UiAutocomplete
			isOpen={!form.isFullFilled && form.address.value.length >= 3}
			onSelect={onSelectAddressCompletion}
			options={addressCompletions}
			value={form.address.value}
		>
			{#snippet input({ handleInput, value })}
				<UiInput
					{value}
					placeholder={m.address()}
					autocomplete="{useToBilling ? 'billing' : 'shipping'} address-line1"
					errorMessage={form.address.error}
					onChange={form.address.validate}
					onInput={(inputValue) => {
						handleInput(inputValue);

						if (inputValue.length >= 4 && !isAutofilling) {
							onInputAddressCompletion(inputValue);
						}
					}}
					use={[[autofillDetection, handleAutofillDetected]]}
				>
					{#snippet suffix()}
						<div class="flex items-center gap-x-1">
							{#if isAutocompleteLoading}
								<Icon
									icon="eos-icons:loading"
									class="text-muted size-4  animate-spin"
								/>
							{/if}
							{#if !isManualMode}
								<UiSmallButton onclick={toggleManualMode}
									>{m.enter_manually()}</UiSmallButton
								>
							{/if}
							{#if form.address.filled && form.city.filled && form.stateOrProvince.filled && form.zipCode.filled}
								<UiSmallButton onclick={form.resetAddress}
									>{m.clear()}</UiSmallButton
								>
							{/if}
						</div>
					{/snippet}
				</UiInput>
			{/snippet}
			{#snippet bottomContent({ handleClose })}
				<button
					class="w-full cursor-pointer rounded-lg p-2 text-left text-xs underline"
					onclick={() => {
						handleClose();
						isManualMode = true;
					}}
				>
					{m.enter_manually()}
				</button>
			{/snippet}
		</UiAutocomplete>
		<!-- Always render manual fields but hide them when not in manual mode -->
		<div class={!isManualMode ? 'not-expanded' : ''}>
			<UiInput
				placeholder={m.addressLine2()}
				value={form.address2.value}
				errorMessage={form.address2.error}
				onChange={form.address2.validate}
				autocomplete="{useToBilling ? 'billing' : 'shipping'} address-line2"
				use={[[autofillDetection, handleAutofillDetected]]}
			/>
		</div>
		<div class={!isManualMode ? 'not-expanded' : ''}>
			<UiGroup horizontal>
				<UiInput
					placeholder={m.city()}
					value={form.city.value}
					errorMessage={form.city.error}
					onChange={form.city.validate}
					autocomplete="{useToBilling ? 'billing' : 'shipping'} address-level2"
					use={[[autofillDetection, handleAutofillDetected]]}
				/>
				<UiInput
					placeholder={m.zip()}
					value={form.zipCode.value}
					errorMessage={form.zipCode.error}
					onChange={form.zipCode.validate}
					autocomplete="{useToBilling ? 'billing' : 'shipping'} postal-code"
					mask={zipCodeMask}
					unmask={zipCodeUnmask}
					onlyNumbers={true}
					use={[[autofillDetection, handleAutofillDetected]]}
				/>
			</UiGroup>
		</div>
		<div class={!isManualMode ? 'not-expanded' : ''}>
			<UiInput
				placeholder={m.state()}
				value={form.stateOrProvince.value}
				errorMessage={form.stateOrProvince.error}
				onChange={form.stateOrProvince.validate}
				autocomplete="{useToBilling ? 'billing' : 'shipping'} address-level1"
				use={[[autofillDetection, handleAutofillDetected]]}
			/>
		</div>
		<UiInput
			placeholder="(555) 555-0123"
			value={form.phoneNumber.value}
			errorMessage={form.phoneNumber.error}
			onChange={form.phoneNumber.validate}
			autocomplete="{useToBilling ? 'billing' : 'shipping'} tel"
			mask={phoneMask}
			unmask={phoneUnmask}
			onlyNumbers={true}
			use={[[autofillDetection, handleAutofillDetected]]}
		>
			{#snippet prefix()}
				<p>🇺🇸</p>
			{/snippet}
		</UiInput>
	</UiGroup>
	{#if externalError}
		<span class="text-danger text-xs">
			{externalError}
		</span>
	{/if}
</UiLabel>
