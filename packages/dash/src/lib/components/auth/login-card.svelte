<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   email?: string,
	 *   error?: string,
	 *   isLoadingMagicLink?: boolean,
	 *   isLoadingOtp?: boolean,
	 *   signupUrl?: string,
	 *   onmagiclink?: (email: string) => void,
	 *   onotp?: (email: string) => void
	 * }}
	 */
	let {
		email = $bindable(''),
		error = $bindable(''),
		isLoadingMagicLink = false,
		isLoadingOtp = false,
		signupUrl = '/signup/verify-domain',
		onmagiclink,
		onotp
	} = $props();

	function validateEmail() {
		if (!email.trim()) {
			error = 'Please enter your email';
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			return false;
		}

		return true;
	}

	function handleMagicLink(e) {
		e?.preventDefault();
		error = '';

		if (!validateEmail()) return;
		onmagiclink?.(email);
	}

	function handleOtp() {
		error = '';

		if (!validateEmail()) return;
		onotp?.(email);
	}
</script>

<Card.Root class="w-full max-w-md shadow-2xl" style="background-color: white;">
	<Card.Header>
		<FirmlyLogo class="pb-6" />
		<Card.Title class="text-2xl">Merchant Login</Card.Title>
		<Card.Description>Enter your email to sign in</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleMagicLink} class="space-y-8">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					bind:value={email}
					oninput={() => (error = '')}
				/>
				{#if error}
					<p class="text-sm text-red-500">{error}</p>
				{/if}
			</div>

			<div class="flex gap-3">
				<BrandedButton
					variant="secondary"
					disabled={isLoadingMagicLink || isLoadingOtp}
					onclick={handleOtp}
				>
					{isLoadingOtp ? 'Sending...' : 'One-Time Code'}
				</BrandedButton>

				<BrandedButton
					type="submit"
					variant="primary"
					disabled={isLoadingMagicLink || isLoadingOtp}
				>
					{isLoadingMagicLink ? 'Sending...' : 'Magic Link'}
				</BrandedButton>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex flex-col gap-4">
		<div class="text-center text-sm text-muted-foreground">
			Don't have an account?
			<a
				href={signupUrl}
				class="font-medium underline-offset-4 hover:underline"
				style="color: #7979ff;"
			>
				Sign up
			</a>
		</div>
	</Card.Footer>
</Card.Root>
