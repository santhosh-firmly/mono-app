<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import CheckoutShippingEmailForm from '$lib/components/checkout/checkout-shipping-email-form.svelte';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Shipping/Email Form',
		component: CheckoutShippingEmailForm,
		parameters: {
			layout: 'centered'
		},
		args: {
			form: {
				email: ''
			},
			termsUrl: '',
			onAcceptTerms: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-full max-w-md p-4">
		<CheckoutShippingEmailForm {...args} />
	</div>
{/snippet}

<Story
	name="With Email"
	children={template}
	args={{
		form: {
			email: 'customer@example.com'
		}
	}}
/>

<Story
	name="Invalid Email"
	children={template}
	args={{
		form: {
			email: 'invalid-email'
		}
	}}
/>

<Story
	name="With Terms and Conditions"
	children={template}
	args={{
		termsUrl: '/privacy-policy'
	}}
/>
