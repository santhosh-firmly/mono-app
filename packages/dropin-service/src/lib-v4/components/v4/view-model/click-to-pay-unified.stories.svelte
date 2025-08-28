<script>
	/* @ts-nocheck */

	import ClickToPayUnified from './click-to-pay-unified.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import FlowSinglePage from '../flow-single-page.svelte';

	import '../theme.css';
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants';
</script>

<Meta
	title="Checkout V4/View Models/Click to Pay Unified"
	component={ClickToPayUnified}
	tags={['autodocs']}
	parameters={{
		fullscreen: true
	}}
/>

<Template let:args>
	<div class="h-screen w-full bg-zinc-200">
		<FlowSinglePage />
		<ClickToPayUnified {...args} />
	</div>
</Template>

<Story
	name="Default"
	args={{
		isModalOpen: true,
		otpEmailInfo: 'samuelsmith@testing.com',
		otpPhoneInfo: '(•••) •••-•875',
		showC2pCheckbox: true
	}}
/>

<Story
	name="OTP Processing State"
	parameters={{
		docs: {
			description: 'Shows the full-screen loading state when OTP is being validated'
		}
	}}
	args={{
		isModalOpen: true,
		otpEmailInfo: 'samuelsmith@testing.com',
		otpPhoneInfo: '(•••) •••-•875',
		showC2pCheckbox: true,
		popupStep: BASE_LOGIN_STEPS.PROCESSING_OTP,
		otpReference: 'samuelsmith@testing.com',
		contentHeaderText: ''
	}}
/>

<Story
	name="OTP Input Form"
	parameters={{
		docs: {
			description:
				'Shows the OTP input form when waiting for user to enter the verification code'
		}
	}}
	args={{
		isModalOpen: true,
		otpEmailInfo: 'samuelsmith@testing.com',
		otpPhoneInfo: '(•••) •••-•875',
		showC2pCheckbox: true,
		popupStep: BASE_LOGIN_STEPS.WAITING_OTP,
		otpReference: 'samuelsmith@testing.com'
	}}
/>

<Story
	name="OTP Error"
	args={{
		isModalOpen: true,
		otpEmailInfo: 'samuelsmith@testing.com',
		otpPhoneInfo: '(•••) •••-•875',
		showC2pCheckbox: true,
		popupStep: BASE_LOGIN_STEPS.WAITING_OTP,
		otpError: 'Incorrect code. Please try again.'
	}}
/>

<Story
	name="Countdown State"
	parameters={{
		docs: {
			description:
				'Shows the state when OTP has been sent and the resend button is in countdown mode'
		}
	}}
	args={{
		isModalOpen: true,
		otpEmailInfo: 'samuelsmith@testing.com',
		otpPhoneInfo: '(•••) •••-•875',
		showC2pCheckbox: true,
		popupStep: BASE_LOGIN_STEPS.WAITING_OTP,
		otpReference: 'samuelsmith@testing.com',
		otpAlternativeTextDisabled: true,
		alternativeMethodText: 'Resend code (25 seconds)'
	}}
/>

<Story
	name="Waiting OTP Stepup"
	args={{
		isModalOpen: true,
		popupStep: BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP,
		isWaitingStepupOtp: true,
		otpReference: '******8080',
		contentHeaderText: "Confirm it's you"
	}}
/>
