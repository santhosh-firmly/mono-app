<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiInput from '$lib/components/ui/input.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';
	import UiLabel from '$lib/components/ui/label.svelte';
	import UiCheckbox from '$lib/components/ui/checkbox.svelte';
	import IconCcBrand from '$lib/components/ui/icons/icon-cc-brand.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		creditCardMask,
		creditCardUnmask,
		monthYearMask,
		monthYearUnmask
	} from '$lib/utils/masks';
	import { isValidCreditCard, isValidExpirationDate, isValidCVC } from '$lib/utils/validations';
	import { useValidator } from '$lib/composables/validator.svelte.js';
	/**
	 * @typedef {Object} CheckoutPaymentForm
	 * @property {string} number - The card number
	 * @property {string} expiration - The expiration date
	 * @property {string} verificationCode - The CVC
	 * @property {Function} onFullfilled - The function to call when the card is filled
	 * @property {boolean} useBillingAsShipping - Whether to use the billing address as the shipping address
	 * @property {import('svelte').Snippet} billingAddressForm - The form to render for the billing address
	 */

	/**
	 * @type {CheckoutPaymentForm}
	 */
	let {
		number = $bindable(''),
		expiration = $bindable(''),
		verificationCode = $bindable(''),
		onFullfilled = () => {},
		billingAddressForm,
		useBillingAsShipping = $bindable(true)
	} = $props();

	let cardNumber = $derived(useValidator(number, isValidCreditCard));
	let expirationDate = $derived(useValidator(expiration, isValidExpirationDate));
	let cvc = $derived(useValidator(verificationCode, isValidCVC));

	let isFilled = $derived(cardNumber.filled && expirationDate.filled && cvc.filled);
	let errors = $derived(cardNumber.error || expirationDate.error || cvc.error);

	$effect(() => {
		onFullfilled(
			isFilled
				? {
						number: cardNumber.value,
						expiration: expirationDate.value,
						verificationCode: cvc.value
					}
				: null
		);
	});
</script>

<div class="flex flex-col gap-4">
	<UiLabel label={m.credit_card()} errorMessage={errors}>
		<UiGroup>
			<UiInput
				onlyNumbers
				placeholder="4111 4111 4111 4111"
				autocomplete=""
				maxlength="23"
				mask={creditCardMask}
				unmask={creditCardUnmask}
				onChange={cardNumber.validate}
				errorMessage={cardNumber.error}
				bind:value={number}
			>
				{#snippet suffix()}
					<div class="*:text-muted flex items-center gap-2 *:text-2xl">
						{#if number.length === 0}
							<div class="hidden items-center gap-2 @3xl:flex">
								<!-- Show all card icons when input is empty -->
								<Icon class="text-border" icon="fa6-brands:cc-visa" />
								<Icon class="text-border" icon="fa6-brands:cc-mastercard" />
								<Icon class="text-border" icon="fa6-brands:cc-jcb" />
								<Icon class="text-border" icon="fa6-brands:cc-amex" />
							</div>
						{:else}
							<IconCcBrand class="text-border" first4={number.slice(0, 4)} />
						{/if}
					</div>
				{/snippet}
			</UiInput>
			<UiGroup horizontal>
				<UiInput
					onlyNumbers
					placeholder="MM / YY"
					maxlength="7"
					mask={monthYearMask}
					unmask={monthYearUnmask}
					onChange={expirationDate.validate}
					errorMessage={expirationDate.error}
					bind:value={expiration}
				/>

				<UiInput
					onlyNumbers
					placeholder="CVC"
					maxlength="4"
					onChange={cvc.validate}
					errorMessage={cvc.error}
					bind:value={verificationCode}
				>
					{#snippet suffix()}
						<Icon icon="ph:credit-card-duotone" class="text-border text-3xl" />
					{/snippet}
				</UiInput>
			</UiGroup>
		</UiGroup>
	</UiLabel>

	<UiCheckbox
		onChange={() => (useBillingAsShipping = !useBillingAsShipping)}
		isChecked={useBillingAsShipping}
		title={m.billing_address_same()}
		labelClass="my-1"
	/>

	{#if !useBillingAsShipping}
		{@render billingAddressForm?.()}
	{/if}
</div>
