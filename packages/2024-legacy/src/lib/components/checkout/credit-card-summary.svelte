<script lang="ts">
	// @ts-nocheck
	import {
		CardName,
		CardNumber,
		CreditCardInformation,
		CVC,
		ExpiryDate
	} from '$lib/browser/localization.js';
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
	} from '$lib/browser/credit-card-helper.js';
	import FloatingLabelInput from '$lib/components/vendor/floating-label-input.svelte';
	import { createForm } from 'svelte-forms-lib';
	import { CreditCardSchema } from '$lib/browser/schema.js';
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

<span class="flex mb-4 font-bold text-lg">{CreditCardInformation}</span>

<form on:submit={handleSubmit}>
	<div class="flex flex-row flex-wrap gap-y-2">
		<div class="px-1 w-full sm:w-1/2 flex flex-row">
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
				>
					{#if showCardIcon && cardNumberWidth > 170}
						<span class="self-center sm:pl-1 pr-0.5 absolute px-3 right-2 z-30"
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
		<div class="px-1 w-1/2 sm:w-1/4">
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
		<div class="px-1 w-1/2 sm:w-1/4">
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
		<div class="px-1 w-full">
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
			/>
			{#if $errors.cardName}
				<Helper data-testid="cardNameError" color="red" class="p-1">{$errors.cardName}</Helper>
			{/if}
		</div>
	</div>

	<div class="flex items-end justify-end m-3">
		<button
			type="submit"
			class="w-full sm:w-1/3 text-center focus:ring-4 focus:outline-none items-center justify-center px-5 py-2 text-white focus:ring-blue-300 rounded-3xl hover:bg-blue-800 font-semibold text-normal bg-[#4c7cec]"
		>
			Save & Continue
		</button>
	</div>
</form>
