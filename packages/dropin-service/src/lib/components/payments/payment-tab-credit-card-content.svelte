<script>
	// @ts-nocheck

	import {
		CARD_ICON_COMPONENTS,
		EmptyCardInfo,
		formatCardNumberRaw,
		getCardTypeByValue
	} from '$lib/browser/credit-card-helper.js';
	import { BillingInfoSchema, CreditCardApiSchema } from '$lib/browser/schema.js';
	import { slide } from 'svelte/transition';
	import ExistingCreditCard from '$lib/components/checkout/existing-credit-card.svelte';
	import Group from '$lib/components/common/group.svelte';
	import { NEW_CARD_OPTION } from '$lib/constants.js';
	import Address from '$lib/components/checkout/address.svelte';
	import Checkbox from '$lib/components/common/checkbox.svelte';


	/**
	 * @typedef {Object} PaymentTabCreditCardContentProps
	 * @property {boolean} isCvvRequired - Whether the CVV is required
	 * @property {string} cvvConfirmationValue - The value of the CVV confirmation
	 * @property {string} number - The card number
	 * @property {string} expiryDate - The expiry date of the card
	 * @property {boolean} disabled - Whether the component is disabled
	 * @property {Function} onCreditCardUpdated - The function to call when the credit card is updated
	 * @property {Array} savedCreditCards - The list of saved credit cards
	 * @property {boolean} cardBrandDetected - Controls if the card badge should be shown as part of the input element
	 * @property {Function} validateAndSubmitBillingAddress - The function to call when the billing address is validated and submitted
	 * @property {boolean} shouldTryFocusOnPaymentTab - Whether the component should try to focus on the payment tab
	 * @property {boolean} isBillingSameShipping - Whether the billing address is the same as the shipping address
	 * @property {Function} getBillingInfo - The function to call to get the billing information
	 */
	let { isCvvRequired = false, cvvConfirmationValue = '', number, expiryDate = '', disabled = false, onCreditCardUpdated = () => {}, savedCreditCards = [], cardBrandDetected = false, validateAndSubmitBillingAddress, shouldTryFocusOnPaymentTab, isBillingSameShipping = true, getBillingInfo } = $props();

	let cardComponent = $state(EmptyCardInfo.component);
	let numberElement = $state();

	$effect(() => {
		if (shouldTryFocusOnPaymentTab && numberElement) {
			numberElement.focus();
		}
	})

	
	let filteredCards = $derived(savedCreditCards.filter((c) => c.last_four));
	let selectedCardOption = $state(savedCreditCards?.[0]?.id || NEW_CARD_OPTION);
	

	$effect(() => {
		if (!number?.includes('*')) {
			let t = getCardTypeByValue(number, 'checkoutV4');
			if (t === EmptyCardInfo) {
				cardBrandDetected = false;
				cardComponent = EmptyCardInfo.component;
			} else if (cardComponent !== t.component) {
				cardComponent = t.component;
				// currentCardType = t.type;
				cardBrandDetected = true;
			}
		}
	})


	let fieldset = $state();

	let error = $state('');

	// Remove non digit values from CVV
	
	let verification_value = $state(verification_value?.replace(/\D/g, ''));
	

	export const validateCreditCard = async (event, showSchemaErrors) => {
		if (!event || !fieldset.contains(event.relatedTarget)) {
			try {
				const [month, year] = expiryDate.split('/');

				const creditCard = {
					number,
					month,
					year: '20' + year,
					verification_value:
						selectedCardOption !== NEW_CARD_OPTION ? cvvConfirmationValue : verification_value
				};

				let isBillingCorrect = true;
				if (!isBillingSameShipping) {
					isBillingCorrect = await validateAndSubmitBillingAddress(BillingInfoSchema, false);
				}

				const result = await CreditCardApiSchema.validate(creditCard, {
					abortEarly: false
				});

				const now = new Date();

				if (
					parseInt(creditCard.year) <= now.getFullYear() &&
					parseInt(month) < now.getMonth() + 1
				) {
					error = 'Expiry date cannot be in the past';
				} else {
					error = '';
					await onCreditCardUpdated(result);
				}

				return isBillingCorrect;
			} catch (e) {
				if (showSchemaErrors || e.inner[0].type !== 'required') {
					error = e.inner[0].message;
				}

				return false;
			}
		}
	};

	$effect(() => {
		const ret = formatCardNumberRaw(number);
		number = ret.formatted;
	})

	$effect(() => {
		expiryDate = expiryDate.replace(/[^\d/]/g, '');
		let expiry = expiryDate;
		if (/^[2-9]$/.test(expiry)) {
			expiry = `0${expiry}`;
		}

		if (expiryDate.length === 2 && +expiryDate > 12) {
			const [head, ...tail] = expiryDate.split('');
			expiry = `0${head}/${tail.join('')}`;
		} else if (/^1[/-]$/.test(expiry)) {
			expiryDate = `01/`;
		} else {
			expiry = expiry.match(/(\d{1,2})/g) || [];
			if (expiry.length === 1) {
				if (!expiryDate && expiryDate.includes('/')) {
					expiryDate = expiry[0];
				}
			} else if (expiry.length > 2) {
				const [, month = null, year = null] = expiry.join('').match(/^(\d{2}).*(\d{2})$/) || [];
				expiryDate = [month, year].join('/');
			} else {
				expiryDate = expiry.join('/');
			}
		}
	})
</script>

{#if filteredCards && filteredCards.length > 0}
	<div class="mb-3">
		<Group>
			{#each filteredCards as savedCard, index}
				<label
					class="flex flex-row items-center px-3 py-3 gap-3 col-span-2 w-full border-0"
					class:disabled-label={disabled}
					class:rounded-t-lg={index === 0}
				>
					<input
						name="credit-card-option"
						class="disabled:bg-fy-on-primary-subtle text-fy-action"
						type="radio"
						{disabled}
						value={savedCard.id}
						bind:group={selectedCardOption}
					/>
					<ExistingCreditCard
						type={savedCard.card_type?.toLowerCase()}
						number={savedCard.last_four}
						customArtUrl={savedCard.art}
					/>
					{#if isCvvRequired && selectedCardOption === savedCard.id}
						<div class="flex items-center gap-2 mb-2">
							<span class="text-fy-alert text-sm">Please confirm your CVV</span>
						</div>
						<div class="px-3 py-2">
							<input
								class="border border-fy-on-primary-subtle w-full placeholder:text-fy-on-primary-subtle rounded p-2 disabled:bg-gray-100"
								class:error
								{disabled}
								bind:value={cvvConfirmationValue}
								data-testid="cvvConfirmationValue"
								placeholder="CVV"
								autocomplete="cc-csc"
								maxlength="4"
								inputmode="numeric"
								type="text"
							/>
						</div>
					{/if}
				</label>
			{/each}
			<label
				class="flex flex-row items-center px-3 py-3 gap-3 col-span-2 w-full border-0 rounded-b-lg"
				class:disabled-label={disabled}
			>
				<input
					name="credit-card-option"
					class="disabled:bg-fy-on-primary-subtle text-fy-action"
					type="radio"
					{disabled}
					value={NEW_CARD_OPTION}
					bind:group={selectedCardOption}
				/>
				<div class="w-full flex gap-3 items-center">
					<div class="h-full flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="44"
							height="28"
							viewBox="0 0 44 28"
							fill="none"
						>
							<path
								d="M6.28571 0C4.61864 0 3.01984 0.536363 1.84104 1.49109C0.662243 2.44582 0 3.74072 0 5.09091V6.36364H44V5.09091C44 3.74072 43.3378 2.44582 42.159 1.49109C40.9802 0.536363 39.3814 0 37.7143 0H6.28571Z"
								fill="#1A2552"
								fill-opacity="0.53"
							/>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M44 10H0V22.7273C0 24.0775 0.662243 25.3724 1.84104 26.3271C3.01984 27.2818 4.61864 27.8182 6.28571 27.8182H37.7143C39.3814 27.8182 40.9802 27.2818 42.159 26.3271C43.3378 25.3724 44 24.0775 44 22.7273V10ZM6.28571 16.3636C6.28571 16.0261 6.45128 15.7024 6.74598 15.4637C7.04068 15.225 7.44037 15.0909 7.85714 15.0909H20.4286C20.8453 15.0909 21.245 15.225 21.5397 15.4637C21.8344 15.7024 22 16.0261 22 16.3636C22 16.7012 21.8344 17.0249 21.5397 17.2636C21.245 17.5023 20.8453 17.6364 20.4286 17.6364H7.85714C7.44037 17.6364 7.04068 17.5023 6.74598 17.2636C6.45128 17.0249 6.28571 16.7012 6.28571 16.3636ZM7.85714 20.1818C7.44037 20.1818 7.04068 20.3159 6.74598 20.5546C6.45128 20.7933 6.28571 21.117 6.28571 21.4546C6.28571 21.7921 6.45128 22.1158 6.74598 22.3545C7.04068 22.5932 7.44037 22.7273 7.85714 22.7273H14.1429C14.5596 22.7273 14.9593 22.5932 15.254 22.3545C15.5487 22.1158 15.7143 21.7921 15.7143 21.4546C15.7143 21.117 15.5487 20.7933 15.254 20.5546C14.9593 20.3159 14.5596 20.1818 14.1429 20.1818H7.85714Z"
								fill="#1A2552"
								fill-opacity="0.53"
							/>
						</svg>
					</div>
					<span class="text-fy-on-surface text-sm font-bold">Add New Card</span>
				</div>
			</label>
		</Group>
	</div>
{/if}
{#if !filteredCards || filteredCards.length === 0 || selectedCardOption === NEW_CARD_OPTION}
	<fieldset
		bind:this={fieldset}
		on:focusout={validateCreditCard}
		transition:slide={{ duration: 150 }}
	>
		<h3 class="text-sm">Card information</h3>
		<Group>
			<div class="w-full col-span-2 relative flex flex-row justify-between rounded-t-lg">
				<div class="flex w-full">
					<input
						class="border-0 w-full placeholder:text-fy-on-primary-subtle rounded-t-lg disabled:bg-gray-100"
						class:error
						{disabled}
						bind:value={number}
						bind:this={numberElement}
						data-testid="number"
						placeholder="1234 1234 1234 1234"
						autocomplete="cc-number"
						inputmode="numeric"
						type="text"
					/>
				</div>
				<div
					class="card-brand-icons absolute flex right-0 top-0 pr-2 h-full items-center z-10 ml-4"
				>
					{#if cardBrandDetected}
						<span class="pr-2"><svelte:component this={cardComponent} /></span>
					{:else}
						{#each CARD_ICON_COMPONENTS as brand}
							<span class="flex w-10 items-center justify-center max-sm:hidden">
								<svelte:component this={brand} />
							</span>
						{/each}
					{/if}
				</div>
			</div>
			<div class="w-full relative flex flex-col justify-center rounded-bl-lg">
				<input
					class="border-0 w-full placeholder:text-fy-on-primary-subtle rounded-bl-lg disabled:bg-gray-100"
					class:error
					{disabled}
					bind:value={expiryDate}
					data-testid="expiry"
					placeholder="MM / YY"
					autocomplete="cc-exp"
					type="text"
				/>
			</div>
			<div class="w-full relative flex flex-row justify-center rounded-br-lg">
				<div class="flex w-full">
					<input
						class="border-0 border-fy-on-primary-subtle w-full placeholder:text-fy-on-primary-subtle rounded-br-lg disabled:bg-gray-100"
						class:error
						{disabled}
						bind:value={verification_value}
						data-testid="verification_value"
						placeholder="CVV"
						autocomplete="cc-csc"
						maxlength="4"
						inputmode="numeric"
						type="text"
					/>
				</div>
				<div class="mr-3 absolute top-0 right-0 z-10 h-full justify-center flex flex-col">
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 44 44">
						<g fill="none" fill-rule="evenodd">
							<path d="M0 0h44v44H0z" />
							<path
								class="stroke-fy-on-surface-subtle"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M39.493 6.5a4.01 4.01 0 0 1 4.007 4.005v22.99a4.005 4.005 0 0 1-4.007 4.005H4.507A4.01 4.01 0 0 1 .5 33.495v-22.99A4.005 4.005 0 0 1 4.507 6.5h34.986z"
							/>
							<circle cx="27.5" cy="27.5" r="1" class="stroke-fy-on-surface-subtle" />
							<circle cx="31.5" cy="27.5" r="1" class="stroke-fy-on-surface-subtle" />
							<circle cx="35.5" cy="27.5" r="1" class="stroke-fy-on-surface-subtle" />
							<path class="fill-fy-on-surface-subtle" d="M1 11h42v1H1zM1 15h42v1H1z" />
							<path
								stroke="#904EBA"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M33.497 21.5a6.006 6.006 0 0 1 6.003 6c0 3.314-2.678 6-6.003 6h-3.994a6.006 6.006 0 0 1-6.003-6c0-3.314 2.678-6 6.003-6h3.994z"
							/>
						</g>
					</svg>
				</div>
			</div>
		</Group>
		{#if error}
			<span class="text-xs text-fy-alert">
				{error}
			</span>
		{/if}
	</fieldset>
{/if}

{#if selectedCardOption === NEW_CARD_OPTION}
	<div class="pt-5">
		<Checkbox
			bind:isChecked={isBillingSameShipping}
			{disabled}
			title="Billing address is the same as shipping address"
			labelClasses="w-full flex rounded-lg my-1"
		/>
	</div>
{/if}

{#if !isBillingSameShipping}
	<div class="pt-4" transition:slide={{ duration: 150 }}>
		<span class="text-sm">Billing Address</span>
		<Address
			{disabled}
			namePlaceHolder="Full name on card"
			addressType="billing"
			bind:validateAndSubmit={validateAndSubmitBillingAddress}
			bind:getAddressInfo={getBillingInfo}
		/>
	</div>
{/if}

<style>
	input.error {
		color: var(--fy-alert);
		box-shadow: var(--fy-form-element-input-error);
		z-index: 1;
	}

	input:focus {
		border: 0 !important;
		outline: 0 !important;
		z-index: 2;

		box-shadow: var(--fy-form-element-input-focus);
		transition-property: box-shadow, color, filter;
	}

	.disabled-label {
		@apply bg-gray-100;
	}
</style>
