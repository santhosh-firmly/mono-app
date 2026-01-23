<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ShippingAddressForm from './shipping-address-form.svelte';
	import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

	const { Story } = defineMeta({
		title: 'Checkout/Shipping/Address/Form',
		component: ShippingAddressForm,
		parameters: {
			layout: 'centered'
		},
		args: {
			onSelectAddressCompletion: fn(),
			onInputAddressCompletion: fn()
		}
	});

	const mockAddress = {
		first_name: 'John',
		last_name: 'Smith',
		phone: '2065550123',
		address1: '123 Main Street',
		address2: 'Apt 4B',
		city: 'Seattle',
		state_or_province: 'WA',
		postal_code: '98101'
	};

	const mockCompletions = [
		{ id: '1', value: '123 Main Street, Seattle, WA' },
		{ id: '2', value: '123 Market Street, San Francisco, CA' },
		{ id: '3', value: '123 Mission Street, Los Angeles, CA' }
	];
</script>

<script>
	function createEmptyForm() {
		return useCheckoutForm({});
	}

	function createPartialForm() {
		return useCheckoutForm({ address1: '123 Main' });
	}

	function createFilledForm() {
		return useCheckoutForm(mockAddress);
	}

	function createFormWithAllErrors() {
		const form = useCheckoutForm({});
		form.name.validate('');
		form.address.validate('');
		form.city.validate('');
		form.stateOrProvince.validate('');
		form.zipCode.validate('');
		form.phoneNumber.validate('123');
		return form;
	}

	function createFormWithPartialErrors() {
		const form = useCheckoutForm({
			first_name: 'John',
			last_name: 'Doe',
			address1: '123 Main St'
		});
		form.city.validate('');
		form.zipCode.validate('abc');
		return form;
	}
</script>

<!-- Default - Autocomplete Mode (closed fields) -->
{#snippet defaultTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm form={createEmptyForm()} {...args} />
	</div>
{/snippet}

<Story name="Default" template={defaultTemplate} />

<!-- Loading Autocomplete (spinner visible) -->
{#snippet loadingTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm form={createPartialForm()} isAutocompleteLoading={true} {...args} />
	</div>
{/snippet}

<Story name="Loading Autocomplete" template={loadingTemplate} />

<!-- With Autocomplete Suggestions -->
{#snippet autocompleteTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm
			form={createPartialForm()}
			addressCompletions={mockCompletions}
			{...args}
		/>
	</div>
{/snippet}

<Story name="With Autocomplete List" template={autocompleteTemplate} />

<!-- Manual Mode (All Fields Visible) -->
{#snippet manualTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm form={createEmptyForm()} forceManualMode={true} {...args} />
	</div>
{/snippet}

<Story name="Manual Mode" template={manualTemplate} />

<!-- Filled Form -->
{#snippet filledTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm form={createFilledForm()} forceManualMode={true} {...args} />
	</div>
{/snippet}

<Story name="Filled" template={filledTemplate} />

<!-- As Billing Address (shows "Billing Address" title) -->
{#snippet billingTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm
			form={createEmptyForm()}
			useToBilling={true}
			forceManualMode={true}
			{...args}
		/>
	</div>
{/snippet}

<Story name="As Billing" template={billingTemplate} />

<!-- With External/Backend Error -->
{#snippet errorTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm
			form={createFilledForm()}
			forceManualMode={true}
			externalError="Unable to validate address. Please check and try again."
			{...args}
		/>
	</div>
{/snippet}

<Story name="With Backend Error" template={errorTemplate} />

<!-- With All Field Validation Errors -->
{#snippet allErrorsTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm form={createFormWithAllErrors()} forceManualMode={true} {...args} />
	</div>
{/snippet}

<Story name="With All Field Errors" template={allErrorsTemplate} />

<!-- With Partial Field Validation Errors -->
{#snippet partialErrorsTemplate(args)}
	<div class="w-96 p-4">
		<ShippingAddressForm
			form={createFormWithPartialErrors()}
			forceManualMode={true}
			{...args}
		/>
	</div>
{/snippet}

<Story name="With Partial Field Errors" template={partialErrorsTemplate} />
