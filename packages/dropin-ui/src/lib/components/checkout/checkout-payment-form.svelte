<script>
	import Icon from '@iconify/svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';
	import UiGroup from '$lib/components/ui/ui-group.svelte';
	import UiLabel from '$lib/components/ui/ui-label.svelte';
	import UiCheckbox from '$lib/components/ui/ui-checkbox.svelte';
	import IconCcBrand from '$lib/components/icon/icon-cc-brand.svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		creditCardMask,
		creditCardUnmask,
		monthYearMask,
		monthYearUnmask
	} from '$lib/utils/masks';
	import { isValidCreditCard, isValidExpirationDate, isValidCVC } from '$lib/utils/validations';
	import { useValidator } from '$lib/utils/validator.svelte';
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
		number = '',
		expiration = '',
		verificationCode = '',
		onFullfilled = () => {},
		billingAddressForm,
		useBillingAsShipping = $bindable(true)
	} = $props();

	let cardNumberWithoutValidation = $state(number);
	let cardNumber = useValidator(number, isValidCreditCard);
	let expirationDate = useValidator(expiration, isValidExpirationDate);
	let cvc = useValidator(verificationCode, isValidCVC);

	let isFilled = $derived(cardNumber.filled && expirationDate.filled && cvc.filled);
	let errors = $derived(cardNumber.error || expirationDate.error || cvc.error);

	$effect(() => {
		if (isFilled) {
			onFullfilled({
				number: cardNumber.value,
				expiration: expirationDate.value,
				verificationCode: cvc.value
			});
		}
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
				bind:value={cardNumberWithoutValidation}
			>
				{#snippet suffix()}
					<div class="[&>*]:text-muted flex items-center gap-2 [&>*]:text-2xl">
						{#if cardNumberWithoutValidation.length === 0}
							<div class="hidden items-center gap-2 @md:flex">
								<!-- Show all card icons when input is empty -->
								<Icon icon="fa6-brands:cc-visa" />
								<Icon icon="fa6-brands:cc-mastercard" />
								<Icon icon="fa6-brands:cc-jcb" />
								<Icon icon="fa6-brands:cc-amex" />
							</div>
						{:else}
							<IconCcBrand first4={cardNumberWithoutValidation.slice(0, 4)} />
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
					value={expirationDate.value}
				/>

				<UiInput
					onlyNumbers
					placeholder="CVC"
					maxlength="4"
					onChange={cvc.validate}
					errorMessage={cvc.error}
					value={cvc.value}
				>
					{#snippet suffix()}
						<Icon icon="ph:credit-card-duotone" class="text-muted text-3xl" />
					{/snippet}
				</UiInput>
			</UiGroup>
		</UiGroup>
	</UiLabel>

	<UiCheckbox
		onChange={() => (useBillingAsShipping = !useBillingAsShipping)}
		isChecked={useBillingAsShipping}
	>
		<p class="text-muted text-xs">
			{m.billing_address_same()}
		</p>
	</UiCheckbox>

	{#if !useBillingAsShipping}
		{@render billingAddressForm?.()}
	{/if}
</div>
