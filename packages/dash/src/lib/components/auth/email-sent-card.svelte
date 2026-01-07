<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   email?: string,
	 *   method?: 'magic' | 'otp',
	 *   onreset?: () => void
	 * }}
	 */
	let { email = '', method = 'magic', onreset } = $props();

	const methodLabel = method === 'magic' ? 'magic link' : 'verification code';
	const expiryMessage =
		method === 'magic'
			? 'Click the link in the email to sign in. The link will expire in 15 minutes.'
			: 'Enter the 6-digit code to sign in. The code will expire in 5 minutes.';
</script>

<Card.Root class="w-full max-w-md shadow-2xl" style="background-color: white;">
	<Card.Header>
		<FirmlyLogo class="pb-6" />
		<Card.Title class="text-2xl">Check Your Email</Card.Title>
		<Card.Description>
			We've sent a {methodLabel} to <b>{email}</b>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<div class="flex justify-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-16 w-16"
					style="color: #7979ff;"
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
				{expiryMessage}
			</p>
			<BrandedButton variant="tertiary" onclick={onreset}>Use a different email</BrandedButton
			>
		</div>
	</Card.Content>
</Card.Root>
