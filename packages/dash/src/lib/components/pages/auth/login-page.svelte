<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import AnimatedBackground from '$lib/components/merchant/animated-background.svelte';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   email: string,
	 *   error: string,
	 *   isLoading: boolean,
	 *   isLoadingOtp: boolean,
	 *   emailSent: boolean,
	 *   sentMethod: 'magic' | 'otp' | '',
	 *   signupUrl: string,
	 *   onEmailChange: (email: string) => void,
	 *   onMagicLink: () => Promise<void>,
	 *   onOtpLogin: () => Promise<void>,
	 *   onReset: () => void
	 * }}
	 */
	let {
		email = '',
		error = '',
		isLoading = false,
		isLoadingOtp = false,
		emailSent = false,
		sentMethod = '',
		signupUrl = '/signup/verify-domain',
		onEmailChange = () => {},
		onMagicLink = async () => {},
		onOtpLogin = async () => {},
		onReset = () => {}
	} = $props();

	function handleSubmit(e) {
		e?.preventDefault();
		onMagicLink();
	}
</script>

<AnimatedBackground background="starry-night" layout="diagonal" />

<div class="card-container">
	<Card.Root class="w-full max-w-md shadow-2xl bg-card">
		<Card.Header>
			<FirmlyLogo class="pb-6" />
			{#if emailSent}
				<Card.Title class="text-2xl">Check Your Email</Card.Title>
				<Card.Description
					>We've sent a {sentMethod === 'magic' ? 'magic link' : 'verification code'} to
					<b>{email}</b></Card.Description
				>
			{:else}
				<Card.Title class="text-2xl">Merchant Login</Card.Title>
				<Card.Description>Enter your email to sign in</Card.Description>
			{/if}
		</Card.Header>
		<Card.Content>
			{#if emailSent}
				<div class="space-y-4">
					<div class="flex justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-16 w-16 text-primary"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<p class="text-center text-sm text-muted-foreground px-10">
						{#if sentMethod === 'magic'}
							Click the link in the email to sign in. The link will expire in 15
							minutes.
						{:else}
							Enter the 6-digit code to sign in. The code will expire in 5 minutes.
						{/if}
					</p>
					<BrandedButton variant="tertiary" onclick={onReset}>
						Use a different email
					</BrandedButton>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-8">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							oninput={(e) => onEmailChange(e.target.value)}
						/>
						{#if error}
							<p class="text-sm text-red-500 dark:text-red-400">{error}</p>
						{/if}
					</div>

					<div class="flex gap-3">
						<BrandedButton
							variant="secondary"
							disabled={isLoading || isLoadingOtp}
							onclick={onOtpLogin}
						>
							{isLoadingOtp ? 'Sending...' : 'One-Time Code'}
						</BrandedButton>

						<BrandedButton
							type="submit"
							variant="primary"
							disabled={isLoading || isLoadingOtp}
						>
							{isLoading ? 'Sending...' : 'Magic Link'}
						</BrandedButton>
					</div>
				</form>
			{/if}
		</Card.Content>
		<Card.Footer class="flex flex-col gap-4">
			<div class="text-center text-sm text-muted-foreground">
				Don't have an account?
				<a
					href={signupUrl}
					class="font-medium underline-offset-4 hover:underline text-primary"
				>
					Sign up
				</a>
			</div>
		</Card.Footer>
	</Card.Root>
</div>

<style>
	.card-container {
		position: relative;
		z-index: 10;
		display: flex;
		min-height: 100vh;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}
</style>
