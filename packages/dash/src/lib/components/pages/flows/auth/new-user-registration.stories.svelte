<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { linkTo } from '@storybook/addon-links';
	import EmailSentCard from '$lib/components/auth/email-sent-card.svelte';
	import OtpVerificationCard from '$lib/components/auth/otp-verification-card.svelte';
	import VerificationStatusCard from '$lib/components/auth/verification-status-card.svelte';
	import SignUp from '$lib/components/merchant/sign-up.svelte';

	const { Story } = defineMeta({
		title: 'Flows/Auth/New User Registration',
		component: SignUp,
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script>
	// State for interactive flows
	let isVerifying = $state(false);

	// Navigate to next story after simulated delay
	async function simulateAndNavigate(storyTitle, storyName, delay = 1000) {
		await new Promise((r) => setTimeout(r, delay));
		linkTo(storyTitle, storyName)();
	}
</script>

<Story name="Step 1 - Sign Up">
	{#snippet template()}
		<div class="w-[450px]">
			<SignUp />
		</div>
		<div class="mt-4 text-center">
			<button
				class="text-sm text-muted-foreground underline hover:text-foreground"
				onclick={() => linkTo('Flows/Auth/New User Registration', 'Step 2 - Email Sent')()}
			>
				Continue to next step (demo)
			</button>
		</div>
	{/snippet}
</Story>

<Story name="Step 2 - Email Sent">
	{#snippet template()}
		<div class="w-[400px]">
			<EmailSentCard
				email="newuser@merchant.com"
				method="otp"
				onreset={() => linkTo('Flows/Auth/New User Registration', 'Step 1 - Sign Up')()}
			/>
		</div>
		<div class="mt-4 text-center">
			<button
				class="text-sm text-muted-foreground underline hover:text-foreground"
				onclick={() =>
					linkTo('Flows/Auth/New User Registration', 'Step 3 - OTP Verification')()}
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
				email="newuser@merchant.com"
				{isVerifying}
				error=""
				onverify={async () => {
					isVerifying = true;
					await simulateAndNavigate(
						'Flows/Auth/New User Registration',
						'Step 4 - Success',
						1500
					);
				}}
				onresend={async () => {
					await new Promise((r) => setTimeout(r, 1000));
				}}
				onback={() => linkTo('Flows/Auth/New User Registration', 'Step 2 - Email Sent')()}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Step 4 - Success">
	{#snippet template()}
		<div class="w-[400px]">
			<VerificationStatusCard
				status="success"
				message="Your email has been verified successfully! Welcome to Firmly."
				redirectUrl="/merchant/merchant.com"
			/>
		</div>
		<div class="mt-4 text-center">
			<button
				class="text-sm text-muted-foreground underline hover:text-foreground"
				onclick={() => linkTo('Flows/Auth/New User Registration', 'Step 1 - Sign Up')()}
			>
				Restart flow (demo)
			</button>
		</div>
	{/snippet}
</Story>
