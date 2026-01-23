<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ShippingEmail from './shipping-email.svelte';
	import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

	const { Story } = defineMeta({
		title: 'Checkout/Shipping/Email',
		component: ShippingEmail,
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			isValidating: {
				control: 'boolean',
				description: 'Whether C2P lookup is in progress'
			},
			c2pInitialized: {
				control: 'boolean',
				description: 'Whether C2P SDK is loaded'
			}
		}
	});
</script>

<script>
	function createForm(email = '') {
		return useCheckoutForm({ email });
	}

	function createFormWithError() {
		const form = useCheckoutForm({ email: 'invalid' });
		form.email.validate('invalid');
		return form;
	}
</script>

<!-- Default -->
{#snippet defaultTemplate(args)}
	<div class="w-80 p-4">
		<ShippingEmail form={createForm()} onBlur={fn()} {...args} />
	</div>
{/snippet}

<Story name="Default" template={defaultTemplate} />

<!-- With Email -->
{#snippet withEmailTemplate(args)}
	<div class="w-80 p-4">
		<ShippingEmail form={createForm('customer@example.com')} onBlur={fn()} {...args} />
	</div>
{/snippet}

<Story name="With Email" template={withEmailTemplate} />

<!-- With Error -->
{#snippet withErrorTemplate(args)}
	<div class="w-80 p-4">
		<ShippingEmail form={createFormWithError()} onBlur={fn()} {...args} />
	</div>
{/snippet}

<Story name="With Error" template={withErrorTemplate} />

<!-- Validating -->
{#snippet validatingTemplate(args)}
	<div class="w-80 p-4">
		<ShippingEmail
			form={createForm('customer@example.com')}
			isValidating={true}
			onBlur={fn()}
			{...args}
		/>
	</div>
{/snippet}

<Story name="Validating" template={validatingTemplate} />

<!-- With C2P Message -->
{#snippet withC2pTemplate(args)}
	<div class="w-80 p-4">
		<ShippingEmail
			form={createForm('customer@example.com')}
			c2pInitialized={true}
			onBlur={fn()}
			{...args}
		/>
	</div>
{/snippet}

<Story name="With C2P Message" template={withC2pTemplate} />
