<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import MerchantLoginModal from './merchant-login-modal.svelte';

	const { Story } = defineMeta({
		title: 'Work in Progress/Merchant Login/Modal',
		component: MerchantLoginModal,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			isOpen: true,
			step: 'email',
			email: '',
			error: '',
			loading: false,
			canClose: true,
			onClose: fn(),
			onEmailSubmit: fn(),
			onOtpSubmit: fn(),
			onResendOtp: fn(),
			onChangeEmail: fn()
		}
	});
</script>

{#snippet template(args)}
	<MerchantLoginModal {...args} />
{/snippet}

<Story name="Email Step" {template} />

<Story name="Email Step With Value" args={{ email: 'john@example.com' }} {template} />

<Story name="Email Step Loading" args={{ email: 'john@example.com', loading: true }} {template} />

<Story
	name="Email Step With Error"
	args={{ email: 'invalid', error: 'Please enter a valid email' }}
	{template}
/>

<Story name="OTP Step" args={{ step: 'otp', email: 'john@example.com' }} {template} />

<Story
	name="OTP Step Loading"
	args={{ step: 'otp', email: 'john@example.com', loading: true }}
	{template}
/>

<Story
	name="OTP Step With Error"
	args={{ step: 'otp', email: 'john@example.com', error: 'Invalid code' }}
	{template}
/>

<Story name="Cannot Close" args={{ canClose: false }} {template} />
