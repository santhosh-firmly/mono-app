<script>
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { goto } from '$app/navigation';
	import AnimatedBackground from '$lib/components/merchant/animated-background.svelte';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	let email = $derived($page.url.searchParams.get('email') || '');
	let domain = $derived($page.url.searchParams.get('domain') || '');

	let otp = $state(['', '', '', '', '', '']);
	let error = $state('');
	let isVerifying = $state(false);
	let isResending = $state(false);

	let otpValue = $derived(otp.join(''));
	let isComplete = $derived(otpValue.length === 6);

	function handleInput(index, event) {
		const value = event.target.value;

		// Only allow digits
		if (value && !/^\d$/.test(value)) {
			event.target.value = otp[index];
			return;
		}

		otp[index] = value;
		error = '';

		// Auto-focus next input
		if (value && index < 5) {
			const nextInput = document.getElementById(`otp-${index + 1}`);
			if (nextInput) nextInput.focus();
		}
	}

	function handleKeydown(index, event) {
		// Handle backspace to go to previous input
		if (event.key === 'Backspace' && !otp[index] && index > 0) {
			const prevInput = document.getElementById(`otp-${index - 1}`);
			if (prevInput) prevInput.focus();
		}
	}

	function handlePaste(event) {
		event.preventDefault();
		const pastedData = event.clipboardData.getData('text').slice(0, 6);

		if (!/^\d+$/.test(pastedData)) return;

		const digits = pastedData.split('');
		otp = [...digits, ...Array(6 - digits.length).fill('')];
		error = '';

		// Focus the next empty input or the last one
		const nextEmptyIndex = otp.findIndex((d) => !d);
		const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
		const input = document.getElementById(`otp-${focusIndex}`);
		if (input) input.focus();
	}

	async function handleVerify() {
		if (!isComplete) {
			error = 'Please enter the complete 6-digit code';
			return;
		}

		isVerifying = true;
		error = '';

		try {
			const response = await fetch('/api/otp/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: otpValue })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Invalid code. Please try again.';
				isVerifying = false;
				return;
			}

			// Redirect to dashboard
			goto(data.redirectTo || '/');
		} catch {
			error = 'Verification failed. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	async function handleResend() {
		isResending = true;
		error = '';

		try {
			const response = await fetch('/api/otp/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, domain })
			});

			if (!response.ok) {
				const data = await response.json();
				error = data.error || 'Failed to resend code';
			} else {
				otp = ['', '', '', '', '', ''];
				// Focus first input
				const input = document.getElementById('otp-0');
				if (input) input.focus();
			}
		} catch {
			error = 'Failed to resend code. Please try again.';
		} finally {
			isResending = false;
		}
	}

	function handleBack() {
		goto('signup/verify-domain');
	}
</script>

<AnimatedBackground background="starry-night" layout="diagonal" />

<div class="card-container">
	<Card.Root class="w-full max-w-md mx-auto shadow-2xl" style="background-color: white;">
		<Card.Header>
			<FirmlyLogo class="pb-6" />
			<Card.Title class="text-2xl">Verify Your Email</Card.Title>
			<Card.Description>
				We've sent a 6-digit code to <b>{email}</b>
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex justify-center gap-2">
				{#each otp as digit, index (index)}
					<Input
						id="otp-{index}"
						type="text"
						inputmode="numeric"
						maxlength="1"
						value={digit}
						oninput={(e) => handleInput(index, e)}
						onkeydown={(e) => handleKeydown(index, e)}
						onpaste={handlePaste}
						class="h-12 w-12 text-center text-lg font-mono"
					/>
				{/each}
			</div>

			{#if error}
				<p class="text-sm text-red-500 text-center">{error}</p>
			{/if}

			<div class="space-y-2">
				<BrandedButton
					variant="primary"
					onclick={handleVerify}
					disabled={!isComplete || isVerifying}
				>
					{isVerifying ? 'Verifying...' : 'Verify Email'}
				</BrandedButton>

				<BrandedButton variant="secondary" onclick={handleResend} disabled={isResending}>
					{isResending ? 'Sending...' : 'Resend Code'}
				</BrandedButton>

				<BrandedButton variant="tertiary" onclick={handleBack}>Back</BrandedButton>
			</div>
		</Card.Content>
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
