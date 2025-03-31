<script>
	// @ts-nocheck
	import Checkbox from '$lib-v4/components/vendor/checkbox.svelte';
	import { PaymentInfoSchema } from '$lib-v4/browser/schema.js';
	import FormField from '$lib-v4/components/common/form-field.svelte';
	import {
		Address1,
		Address2,
		City,
		SameAsShippingAddress,
		State,
		Zip
	} from '$lib-v4/browser/localization.js';

	import { onMount, setContext } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import FormCreditCard from '$lib-v4/components/common/form-credit-card.svelte';
	import { getCardTypeByValue } from '$lib-v4/browser/credit-card-helper.js';
	import {
		cartCompleteOrder,
		cartUpdatePayment,
		paymentCompleteOrder,
		sCart,
		sPaymentInfo
	} from '$lib-v4/browser/api-manager.js';
	import { wizardNext } from '$lib-v4/browser/wizard.js';

	export let onPlaceOrder = async (values) => {
		if ($sCart.shop_properties && $sCart.shop_properties.place_order_vault) {
			let ret = await paymentCompleteOrder(values);
			if (ret && !ret.notice) {
				wizardNext();
			}
		} else {
			let payHandle = await cartUpdatePayment(values);
			if (payHandle) {
				let ret = await cartCompleteOrder();
				if (ret && !ret.notice) {
					wizardNext();
				}
			}
		}
	};

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: $sPaymentInfo,
		validationSchema: PaymentInfoSchema,
		onSubmit: async (values) => {
			values.cardType = getCardTypeByValue(values.cardNumber).type;
			sPaymentInfo.set(values);
			if (onPlaceOrder) {
				onPlaceOrder(values);
			}
		}
	});

	export const onSubmitClick = (event) => {
		handleSubmit(event);
	};

	function updateBillingInfo() {
		if ($form.sameAsShipping) {
			form.update((old) => {
				old.address1 = $sCart.shipping_info.address1;
				old.address2 = $sCart.shipping_info.address2;
				old.city = $sCart.shipping_info.city;
				old.state_or_province = $sCart.shipping_info.state_or_province;
				old.postal_code = $sCart.shipping_info.postal_code;
				old.country = $sCart.shipping_info.country;
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

	onMount(() => {
		updateBillingInfo();
	});

	const key = Symbol('paymentCreditCard');
	setContext(key, { form, errors, handleChange });
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-y-2" data-testid="payment-credit-card-form">
	<FormCreditCard {key} />

	<Checkbox
		bind:checked={$form.sameAsShipping}
		on:change={onCheckChange}
		data-testid="same-as-shipping-checkbox"
	>
		{SameAsShippingAddress}
	</Checkbox>

	{#if !$form.sameAsShipping}
		<div class="flex flex-col gap-2 sm:flex-row">
			<FormField
				{key}
				id="address1"
				label={Address1}
				autocomplete="shipping billing address-line1"
				type="text"
				required
				data-testid="billing-address1"
			/>
			<FormField
				{key}
				id="address2"
				label={Address2}
				autocomplete="shipping billing address-line2"
				type="text"
				data-testid="billing-address2"
			/>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row">
			<FormField
				{key}
				id="postal_code"
				label={Zip}
				autocomplete="shipping billing postal-code"
				type="tel"
				required
				data-testid="billing-postal-code"
			/>

			<FormField
				{key}
				id="city"
				label={City}
				autocomplete="shipping billing address-level2"
				type="text"
				required
				data-testid="billing-city"
			/>
			<FormField
				{key}
				id="state_or_province"
				label={State}
				autocomplete="shipping billing address-level1"
				type="text"
				required
				data-testid="billing-state"
			/>
		</div>
	{/if}
</form>
