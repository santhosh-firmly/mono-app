<script>
	import OTPValidation from './otp-validation.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Meta title="Checkout V4/Common/OTP Validation" component={OTPValidation} tags={['autodocs']} />

<Template let:args>
	<OTPValidation {...args} on:alternativeTextClicked on:otpCompleted />
</Template>

<Story
	name="Default"
	args={{
		alternativeMethodText: 'Send a code by e-mail'
	}}
/>

<Story name="Without Alternative Text" args={{}} />
