<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OtpVerificationCard from './otp-verification-card.svelte';

	const { Story } = defineMeta({
		title: 'Authentication/OTP Verification Card',
		component: OtpVerificationCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			email: { control: 'text', description: 'Email address the code was sent to' },
			title: { control: 'text', description: 'Card title' },
			submitLabel: { control: 'text', description: 'Submit button label' },
			error: { control: 'text', description: 'Error message to display' },
			isVerifying: { control: 'boolean', description: 'Whether verification is in progress' },
			isResending: { control: 'boolean', description: 'Whether resend is in progress' }
		}
	});
</script>

{#snippet template(args)}
	<OtpVerificationCard {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		email: 'john@example.com'
	}}
	{template}
/>

<Story
	name="Login Flow"
	args={{
		email: 'john@example.com',
		title: 'Enter Verification Code',
		submitLabel: 'Sign In'
	}}
	{template}
/>

<Story
	name="Signup Flow"
	args={{
		email: 'john@merchant.com',
		title: 'Verify Your Email',
		submitLabel: 'Verify Email'
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		email: 'john@example.com',
		error: 'Invalid code. Please try again.'
	}}
	{template}
/>

<Story
	name="Verifying"
	args={{
		email: 'john@example.com',
		isVerifying: true
	}}
	{template}
/>

<Story
	name="Resending"
	args={{
		email: 'john@example.com',
		isResending: true
	}}
	{template}
/>
