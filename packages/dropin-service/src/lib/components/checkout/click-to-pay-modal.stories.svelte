<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ClickToPayModal from './click-to-pay-modal.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Click To Pay/OTP Modal',
		component: ClickToPayModal,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			show: true,
			otpDestination: {
				emails: ['samuelsmith@testing.com'],
				phones: ['(•••) •••-•875']
			},
			network: 'mastercard',
			onSubmit: fn(),
			onClose: fn(),
			onResendOtp: fn(),
			isLoading: false,
			error: '',
			showRememberMe: true,
			rememberMe: true
		}
	});
</script>

{#snippet template(args)}
	<ClickToPayModal {...args} />
{/snippet}

<Story name="Default" {template} />

<Story
	name="Email Only"
	{template}
	args={{
		otpDestination: {
			emails: ['john.doe@example.com'],
			phones: []
		}
	}}
/>

<Story
	name="Phone Only"
	{template}
	args={{
		otpDestination: {
			emails: [],
			phones: ['(•••) •••-•998']
		}
	}}
/>

<Story
	name="Validating"
	{template}
	args={{
		isLoading: true
	}}
/>

<Story
	name="With Error"
	{template}
	args={{
		error: 'The code you entered is incorrect. Please try again.'
	}}
/>

<Story
	name="Without Remember Me"
	{template}
	args={{
		showRememberMe: false
	}}
/>
