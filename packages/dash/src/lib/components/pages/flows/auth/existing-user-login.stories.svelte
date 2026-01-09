<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { linkTo } from '@storybook/addon-links';
	import LoginCard from '$lib/components/auth/login-card.svelte';
	import EmailSentCard from '$lib/components/auth/email-sent-card.svelte';
	import OtpVerificationCard from '$lib/components/auth/otp-verification-card.svelte';
	import VerificationStatusCard from '$lib/components/auth/verification-status-card.svelte';

	const { Story } = defineMeta({
		title: 'Flows/Auth/Existing User Login',
		component: LoginCard,
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script>
	// State for interactive flows
	let isLoadingOtp = $state(false);
	let isLoadingMagicLink = $state(false);
	let isVerifying = $state(false);

	// Navigate to next story after simulated delay
	async function simulateAndNavigate(storyTitle, storyName, delay = 1000) {
		await new Promise((r) => setTimeout(r, delay));
		linkTo(storyTitle, storyName)();
	}
</script>

<Story name="Step 1 - Login">
	{#snippet template()}
		<div class="w-[400px]">
			<LoginCard
				{isLoadingMagicLink}
				{isLoadingOtp}
				error=""
				onotp={async () => {
					isLoadingOtp = true;
					await simulateAndNavigate(
						'Flows/Auth/Existing User Login',
						'Step 2 - Email Sent',
						1000
					);
					isLoadingOtp = false;
				}}
				onmagiclink={async () => {
					isLoadingMagicLink = true;
					await simulateAndNavigate(
						'Flows/Auth/Existing User Login',
						'Step 2 - Email Sent',
						1000
					);
					isLoadingMagicLink = false;
				}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Step 2 - Email Sent">
	{#snippet template()}
		<div class="w-[400px]">
			<EmailSentCard
				email="john@acme.com"
				method="otp"
				onreset={() => linkTo('Flows/Auth/Existing User Login', 'Step 1 - Login')()}
			/>
		</div>
		<div class="mt-4 text-center">
			<button
				class="text-sm text-muted-foreground underline hover:text-foreground"
				onclick={() =>
					linkTo('Flows/Auth/Existing User Login', 'Step 3 - OTP Verification')()}
			>
				Continue to next step (demo)
			</button>
		</div>
	{/snippet}
</Story>

<Story name="Step 3 - OTP Verification">
	{#snippet template()}
		<div class="w-[400px]">
			<OtpVerificationCard
				email="john@acme.com"
				{isVerifying}
				error=""
				onverify={async () => {
					isVerifying = true;
					await simulateAndNavigate(
						'Flows/Auth/Existing User Login',
						'Step 4 - Success',
						1500
					);
				}}
				onresend={async () => {
					await new Promise((r) => setTimeout(r, 1000));
				}}
				onback={() => linkTo('Flows/Auth/Existing User Login', 'Step 2 - Email Sent')()}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Step 4 - Success">
	{#snippet template()}
		<div class="w-[400px]">
			<VerificationStatusCard
				status="success"
				message="Welcome back! Redirecting to your dashboard..."
				redirectUrl="/merchant/acme.com"
			/>
		</div>
		<div class="mt-4 text-center">
			<button
				class="text-sm text-muted-foreground underline hover:text-foreground"
				onclick={() => linkTo('Flows/Auth/Existing User Login', 'Step 1 - Login')()}
			>
				Restart flow (demo)
			</button>
		</div>
	{/snippet}
</Story>
