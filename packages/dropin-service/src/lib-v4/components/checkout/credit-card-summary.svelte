<script lang="ts">
	// @ts-nocheck
	import {
		CardName,
		CardNumber,
		CreditCardInformation,
		CVC,
		ExpiryDate
	} from '$lib-v4/browser/localization.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	import {
		EmptyCardInfo,
		formatCardNumber,
		formatCardNumberRaw,
		formatExpiry,
		getCardTypeByValue,
		validateCreditCard,
		validateCVC,
		validateExpiryDate
	} from '$lib-v4/browser/credit-card-helper.js';
	import FloatingLabelInput from '$lib-v4/components/vendor/floating-label-input.svelte';
	import { createForm } from 'svelte-forms-lib';
	import { CreditCardSchema } from '$lib-v4/browser/schema.js';
	import Helper from '../vendor/helper.svelte';

	/**
	 * Controls if the card badge should be shown as part of the input element
	 */
	export let showCardIcon = true;

	/**
	 * Credit card number
	 */
	export let cardNumber: string;

	/**
	 * Credit card expiration date
	 */
	export let expiryDate: string;

	/**
	 * Name on Credit Card
	 */
	export let cardName: string;

	/**
	 * Credit card CVV
	 */
	export let cvc: string;

	let cardNumberWidth;

	let cardComponent = EmptyCardInfo.component;

	$: {
		if (!$form.cardNumber.includes('*')) {
			let t = getCardTypeByValue($form.cardNumber);
			if (cardComponent !== t.component) {
				cardComponent = t.component;
			}
		}
	}

	function redactCardNumber(number) {
		let t = getCardTypeByValue(number);
		if (cardComponent !== t.component) {
			cardComponent = t.component;
		}

		return formatCardNumberRaw(number.replaceAll(/\d(?=.{4})/g, '*')).formatted;
	}

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: {
			cardNumber: redactCardNumber(cardNumber),
			expiryDate,
			cardName,
			cvc
		},
		// We need our own validation in order to process asterisks on the credit card
		validate: async (values) => {
			const errors = {};
			for (const field in CreditCardSchema.fields) {
				try {
					if (field === 'cardNumber' && values.cardNumber.includes('*')) {
						await CreditCardSchema.validateAt(field, {
							// Validate the input card number instead since the customer didn't touch it
							cardNumber
						});
					} else {
						await CreditCardSchema.validateAt(field, values);
					}
				} catch (validationErrors) {
					errors[field] = validationErrors.message;
				}
			}

			return errors;
		},
		validationSchema: CreditCardSchema,
		onSubmit: (creditCard) => {
			// If the number is redacted, use the original input number in the submission
			if (creditCard.cardNumber.includes('*')) {
				creditCard.cardNumber = cardNumber;
			}
			dispatch('submit', creditCard);
		}
	});

	function handleExpiryKeyup(evt) {
		let fe = formatExpiry(evt);
		evt.target.value = fe;
	}

	function handleCCNumberKeyup(evt) {
		if (evt.key === 'Backspace' && evt.target.value.includes('*')) {
			evt.target.value = '';
		} else {
			let cc = formatCardNumber(evt);
			evt.target.value = cc.formatted;
		}
	}
</script>

<span class="mb-4 flex text-lg font-bold">{CreditCardInformation}</span>

<form on:submit={handleSubmit} data-testid="credit-card-summary-form">
	<div class="flex flex-row flex-wrap gap-y-2">
		<div class="flex w-full flex-row px-1 sm:w-1/2">
			<div bind:clientWidth={cardNumberWidth} class="w-full grow">
				<FloatingLabelInput
					style="outlined"
					label={CardNumber}
					inputmode="numeric"
					autoComplete="billing cc-number"
					id="cardNumber"
					bind:value={$form.cardNumber}
					on:change={handleChange}
					on:keydown={validateCreditCard}
					on:keyup={handleCCNumberKeyup}
					placeholder={CardNumber}
					maxlength="19"
					data-testid="card-number-input"
				>
					{#if showCardIcon && cardNumberWidth > 170}
						<span class="absolute right-2 z-30 self-center px-3 pr-0.5 sm:pl-1"
							><svelte:component this={cardComponent} /></span
						>
					{/if}
				</FloatingLabelInput>
				{#if $errors.cardNumber}
					<Helper data-testid="cardNumberError" color="red" class="p-1">{$errors.cardNumber}</Helper
					>
				{/if}
			</div>
		</div>
		<div class="w-1/2 px-1 sm:w-1/4">
			<FloatingLabelInput
				style="outlined"
				label={ExpiryDate}
				type="tel"
				inputmode="numeric"
				autoComplete="billing cc-exp"
				id="expiryDate"
				bind:value={$form.expiryDate}
				on:change={handleChange}
				on:keydown={validateExpiryDate}
				on:keyup={handleExpiryKeyup}
				placeholder={ExpiryDate}
				maxlength="6"
			/>
			{#if $errors.expiryDate}
				<Helper data-testid="expiryDateError" color="red" class="p-1">{$errors.expiryDate}</Helper>
			{/if}
		</div>
		<div class="w-1/2 px-1 sm:w-1/4">
			<FloatingLabelInput
				style="outlined"
				label={CVC}
				type="password"
				inputmode="numeric"
				autoComplete="billing cc-csc"
				id="cvc"
				bind:value={$form.cvc}
				on:change={handleChange}
				on:keydown={validateCVC}
				placeholder={CVC}
				maxlength="4"
			/>
			{#if $errors.cvc}
				<Helper data-testid="cvcError" color="red" class="p-1">{$errors.cvc}</Helper>
			{/if}
		</div>
		<div class="w-full px-1">
			<FloatingLabelInput
				style="outlined"
				id="cardName"
				name="cardName"
				label={CardName}
				autocomplete="name given-name"
				type="text"
				inputmode="text"
				on:change={handleChange}
				bind:value={$form.cardName}
				data-testid="card-name-input"
			/>
			{#if $errors.cardName}
				<Helper data-testid="cardNameError" color="red" class="p-1">{$errors.cardName}</Helper>
			{/if}
		</div>
	</div>

	<div class="m-3 flex items-end justify-end">
		<button
			type="submit"
			class="text-normal w-full items-center justify-center rounded-3xl bg-[#4c7cec] px-5 py-2 text-center font-semibold text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none sm:w-1/3"
			data-testid="save-continue-button"
		>
			Save & Continue
		</button>
	</div>
</form>
