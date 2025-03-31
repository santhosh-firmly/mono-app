<script lang="ts">
	// @ts-nocheck
	import {
		Address1,
		Address2,
		CardName,
		CardNumber,
		City,
		CreditCardInformation,
		CVC,
		ExpiryDate,
		PlaceOrder,
		SameAsShippingAddress,
		ShippingAddressSearch,
		State,
		Zip
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
	import { PaymentInfoSchema } from '$lib-v4/browser/schema.js';
	import Helper from '../vendor/helper.svelte';
	import ApiProgressIcon_2 from '../common/svg/api-progress-icon-2.svelte';
	import Checkbox from '../vendor/checkbox.svelte';
	import ValidatedFloatingLabelInput from '../common/validated-floating-label-input.svelte';
	import AutoComplete from '../vendor/auto-complete.svelte';
	import { getAddress, searchAddress } from '$lib-v4/browser/api-manager';

	/**
	 * Controls if the placed order button is enabled
	 */
	export let canPlaceOrder = true;

	/**
	 * Controls if the element if not enabled for actions
	 */
	export let disabled = false;

	/**
	 * Controls when the element will show a spinner icon
	 */
	export let showSpinner = false;

	/**
	 * Controls if the card badge should be shown as part of the input element
	 */
	export let showCardIcon = true;

	/**
	 * Credit card number
	 */
	export let cardNumber: string = '';

	/**
	 * Credit card expiration date
	 */
	export let expiryDate: string = '';

	/**
	 * Name on Credit Card
	 */
	export let cardName: string = '';
	/**
	 * Credit card CVV
	 */
	export let cvc: string = '';

	export let cart;
	export let cartsAndOrders;

	let cardNumberWidth;
	let currentCardType;
	let cardComponent = EmptyCardInfo.component;
	let billingInfo;

	$: {
		if (!$form.cardNumber.includes('*')) {
			let t = getCardTypeByValue($form.cardNumber);
			if (cardComponent !== t.component) {
				cardComponent = t.component;
				currentCardType = t.type;
			}
		}

		if (cart?.shipping_info) {
			updateBillingInfo();
		}
	}

	function redactCardNumber(number) {
		let t = getCardTypeByValue(number);
		if (cardComponent !== t.component) {
			cardComponent = t.component;
			currentCardType = t.type;
		}

		return formatCardNumberRaw(number.replaceAll(/\d(?=.{4})/g, '*')).formatted;
	}

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: {
			cardNumber: redactCardNumber(cardNumber),
			expiryDate,
			cardName,
			cvc,
			billingInfo
		},
		// We need our own validation in order to process asterisks on the credit card
		validate: async (values) => {
			const errors = {};
			for (const field in PaymentInfoSchema.fields) {
				try {
					if (field === 'cardNumber' && values.cardNumber.includes('*')) {
						await PaymentInfoSchema.validateAt(field, {
							// Validate the input card number instead since the customer didn't touch it
							cardNumber
						});
					} else {
						await PaymentInfoSchema.validateAt(field, values);
					}
				} catch (validationErrors) {
					errors[field] = validationErrors.message;
				}
			}

			return errors;
		},
		validationSchema: PaymentInfoSchema,
		onSubmit: async (paymentInfo) => {
			// If the number is redacted, use the original input number in the submission
			const creditCard = {
				cardNumber: paymentInfo.cardNumber,
				cardName: paymentInfo.cardName,
				cardType: paymentInfo.cardType,
				expiryDate: paymentInfo.expiryDate,
				cvc: paymentInfo.cvc
			};

			const billingInfo = {
				address1: paymentInfo.address1,
				address2: paymentInfo.address2,
				city: paymentInfo.city,
				country: paymentInfo.country,
				postal_code: paymentInfo.postal_code,
				state_or_province: paymentInfo.state_or_province
			};

			if (creditCard.cardNumber.includes('*')) {
				creditCard.cardNumber = cardNumber;
			}
			creditCard.cardType = currentCardType;
			dispatch('submit', { creditCard, billingInfo });
		}
	});

	$form.sameAsShipping = true;

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

	async function onAddressChange(item) {
		if (item) {
			const ret = await getAddress(item.id, cartsAndOrders[0]?.shop_id);
			if (ret) {
				if (ret.address2) {
					$form.address2 = ret.address2;
				}
				$form.city = ret.city;
				$form.country = ret.country;
				$form.postal_code = ret.postal_code;
				$form.state_name = ret.state_name;
				$form.state_or_province = ret.state_or_province;
			}
		}
	}

	function updateBillingInfo() {
		if ($form.sameAsShipping) {
			form.update((old) => {
				old.address1 = cart?.shipping_info.address1;
				old.address2 = cart?.shipping_info.address2;
				old.city = cart?.shipping_info.city;
				old.state_or_province = cart?.shipping_info.state_or_province;
				old.postal_code = cart?.shipping_info.postal_code;
				old.country = cart?.shipping_info.country;
				return old;
			});
		}
	}

	function clearBillingInfo() {
		form.update((old) => {
			old.address1 = '';
			old.address2 = '';
			old.city = '';
			old.state_or_province = '';
			old.postal_code = '';
			return old;
		});
	}

	function onCheckChange(event) {
		handleChange(event);
		const target = event.target;
		if (target) {
			if (target.checked) {
				updateBillingInfo();
			} else {
				clearBillingInfo();
			}
		}
	}
</script>

<span class="mb-4 flex text-lg font-bold">{CreditCardInformation}</span>

<form on:submit={handleSubmit} data-testid="credit-card-form">
	<div class="flex flex-row flex-wrap gap-y-2">
		<div class="flex w-full flex-row px-1 sm:w-1/2">
			<div bind:clientWidth={cardNumberWidth} class="w-full grow">
				<FloatingLabelInput
					id="cardNumber"
					style="outlined"
					label={CardNumber}
					{disabled}
					inputmode="numeric"
					autoComplete="billing cc-number"
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
				{disabled}
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
				{disabled}
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
				{disabled}
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
	<div class="m-1.5 my-6 flex flex-col">
		<div>
			<Checkbox bind:checked={$form.sameAsShipping} on:change={onCheckChange}
				>{SameAsShippingAddress}</Checkbox
			>
		</div>
		{#if !$form.sameAsShipping}
			<div>
				<form on:submit={handleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
					<div class="mt-3 flex h-10 flex-row text-lg font-bold">Billing Address</div>

					<div class="flex flex-col gap-2">
						<!-- TODO: Wrap this component -->
						<!--
							This component has an onChange, which is custom-built by AutoComplete to return the clicked result.
							However, we must also listen to the native on:change to perform schema validation using svelte-forms-lib
						-->
						<AutoComplete
							id="address1"
							name="address1"
							label={Address1}
							type="text"
							bind:text={$form.address1}
							searchFunction={() => searchAddress($form.address1, cartsAndOrders[0]?.shop_id)}
							labelFieldName="address"
							valueFieldName="address1"
							localFiltering={false}
							delay={250}
							minCharactersToSearch={3}
							placeholder={ShippingAddressSearch}
							onChange={onAddressChange}
							on:change={handleChange}
						/>
						{#if $errors.address1}
							<Helper
								color="red"
								helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-end pr-2"
								>{$errors.address1}</Helper
							>
						{/if}

						<ValidatedFloatingLabelInput
							id="address2"
							style="outlined"
							label={Address2}
							autocomplete="shipping address-line2"
							on:change={handleChange}
							bind:value={$form.address2}
							errorMessage={$errors.address2}
						/>
					</div>
					<div class="flex flex-col gap-2 sm:flex-row">
						<div class="w-1/3">
							<ValidatedFloatingLabelInput
								id="postal_code"
								style="outlined"
								label={Zip}
								autocomplete="shipping postal-code"
								on:change={handleChange}
								bind:value={$form.postal_code}
								errorMessage={$errors.postal_code}
							/>
						</div>
						<div class="w-1/3">
							<ValidatedFloatingLabelInput
								id="city"
								style="outlined"
								label={City}
								autocomplete="shipping address-level2"
								on:change={handleChange}
								bind:value={$form.city}
								errorMessage={$errors.city}
							/>
						</div>

						<div class="w-1/3">
							<ValidatedFloatingLabelInput
								id="state_or_province"
								style="outlined"
								label={State}
								autocomplete="shipping address-level1"
								on:change={handleChange}
								bind:value={$form.state_or_province}
								errorMessage={$errors.state_or_province}
							/>
						</div>
					</div>
				</form>
			</div>
		{/if}
	</div>

	<div class="m-3 my-6 flex items-end justify-end">
		<button
			type="submit"
			disabled={disabled || !canPlaceOrder || showSpinner}
			class="text-normal flex w-full flex-row items-center justify-center rounded-3xl bg-[#4c7cec] px-5 py-2 text-center font-semibold text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:bg-gray-400"
			data-testid="place-order-button"
		>
			{#if showSpinner}
				<ApiProgressIcon_2 />
			{:else}
				{PlaceOrder}
			{/if}
		</button>
	</div>
</form>
