<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OtpVerificationCard from '$lib/components/auth/otp-verification-card.svelte';
	import VerificationStatusCard from '$lib/components/auth/verification-status-card.svelte';

	const { Story } = defineMeta({
		title: 'Flows/Auth/Error States',
		component: OtpVerificationCard,
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="Invalid OTP">
	{#snippet template()}
		<div class="w-[400px]">
			<OtpVerificationCard
				email="john@acme.com"
				isVerifying={false}
				error="Invalid verification code. Please try again."
				onverify={(code) => console.log('OTP:', code)}
				onresend={() => console.log('Resend')}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Expired Link">
	{#snippet template()}
		<div class="w-[400px]">
			<VerificationStatusCard
				status="expired"
				message="This verification link has expired. Please request a new one."
				redirectUrl="/login"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Verification Failed">
	{#snippet template()}
		<div class="w-[400px]">
			<VerificationStatusCard
				status="error"
				message="Something went wrong. Please try again."
			/>
		</div>
	{/snippet}
</Story>
