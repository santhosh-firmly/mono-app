<script>
	// @ts-nocheck
	import { CVCSchema } from '$lib-v4/browser/schema.js';
	import FormField from '$lib-v4/components/common/form-field.svelte';
	import { CVC } from '$lib-v4/browser/localization.js';

	import { setContext } from 'svelte';
	import { createForm } from 'svelte-forms-lib';
	import { validateCVC } from '$lib-v4/browser/credit-card-helper.js';

	export let onCVVPlaceOrder = () => {};
	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: { cvc: '' },
		validationSchema: CVCSchema,
		onSubmit: async (values) => {
			if (onCVVPlaceOrder) {
				onCVVPlaceOrder(values);
			}
		}
	});

	export const onSubmitClick = (event) => {
		handleSubmit(event);
	};

	const key = Symbol('paymentCVV');
	setContext(key, { form, errors, handleChange });
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-y-2 px-4" data-testid="payment-cvv-form">
	<FormField
		{key}
		id="cvc"
		label={CVC}
		type="password"
		inputmode="numeric"
		autoComplete="billing cc-csc"
		required
		placeholder={CVC}
		maxlength="4"
		on:change={handleChange}
		on:keydown={validateCVC}
		data-testid="cvv-input"
	/>
</form>
