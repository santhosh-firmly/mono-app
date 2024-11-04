<script>
	// @ts-nocheck

	import BaseLogin from './base-login.svelte';
	import AdoremeLogoLarge from '../common/svg/adoreme-logo-large.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.scss';
	import { userEvent, within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';
	import { BASE_LOGIN_STEPS } from '$lib/constants.js';
</script>

<Meta title="Checkout V4/Common/Base Login" component={BaseLogin} tags={['autodocs']} />

<Template let:args>
	<div class="adoreme-dark">
		<BaseLogin {...args} on:emailSet on:otpCompleted>
			<AdoremeLogoLarge width={null} height={16} />
		</BaseLogin>
	</div>
</Template>

<Story
	name="Insert email"
	args={{
		loginProviderName: 'Adore Me',
		termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
		privacyPolicyLink: 'https://www.adoreme.com/privacy-policy'
	}}
/>

<Story
	name="Invalid Email"
	args={{
		loginProviderName: 'Adore Me',
		termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
		privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
		email: 'not-a-valid-email'
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Verify phone flag', async () => {
			await userEvent.click(canvas.getByRole('button'));
			await expect(canvas.getByTestId('email-error')).toBeInTheDocument();
		});
	}}
/>

<Story
	name="Processing Email"
	args={{
		loginProviderName: 'Adore Me',
		termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
		privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
		phone: '(---) --- 3570',
		currentStep: BASE_LOGIN_STEPS.PROCESSING_EMAIL
	}}
/>

<Story
	name="Insert OTP"
	args={{
		loginProviderName: 'Adore Me',
		termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
		privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
		phone: '(---) --- 3570',
		currentStep: BASE_LOGIN_STEPS.WAITING_OTP
	}}
/>

<Story
	name="Invalid OTP"
	args={{
		loginProviderName: 'Adore Me',
		termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
		privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
		currentStep: BASE_LOGIN_STEPS.WAITING_OTP,
		phone: '(---) --- 3570',
		otpError: 'OTP is invalid'
	}}
/>

<Story
	name="Processing OTP"
	args={{
		loginProviderName: 'Adore Me',
		termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
		privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
		phone: '(---) --- 3570',
		currentStep: BASE_LOGIN_STEPS.PROCESSING_OTP
	}}
/>
