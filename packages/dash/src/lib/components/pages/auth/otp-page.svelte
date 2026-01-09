<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import AnimatedBackground from '$lib/components/merchant/animated-background.svelte';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   email: string,
	 *   otp: string[],
	 *   error: string,
	 *   isVerifying: boolean,
	 *   isResending: boolean,
	 *   onOtpChange: (otp: string[]) => void,
	 *   onVerify: () => Promise<void>,
	 *   onResend: () => Promise<void>,
	 *   onBack: () => void
	 * }}
	 */
	let {
		email = '',
		otp = ['', '', '', '', '', ''],
		error = '',
		isVerifying = false,
		isResending = false,
		onOtpChange = () => {},
		onVerify = async () => {},
		onResend = async () => {},
		onBack = () => {}
	} = $props();

	let otpValue = $derived(otp.join(''));
	let isComplete = $derived(otpValue.length === 6);

	function handleInput(index, event) {
		const value = event.target.value;

		// Only allow digits
		if (value && !/^\d$/.test(value)) {
			event.target.value = otp[index];
			return;
		}

		const newOtp = [...otp];
		newOtp[index] = value;
		onOtpChange(newOtp);

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
		const newOtp = [...digits, ...Array(6 - digits.length).fill('')];
		onOtpChange(newOtp);

		// Focus the next empty input or the last one
		const nextEmptyIndex = newOtp.findIndex((d) => !d);
		const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
		const input = document.getElementById(`otp-${focusIndex}`);
		if (input) input.focus();
	}
</script>

<AnimatedBackground background="starry-night" layout="diagonal" />

<div class="card-container">
	<Card.Root class="w-full max-w-md mx-auto shadow-2xl bg-card">
		<Card.Header>
			<FirmlyLogo class="pb-6" />
			<Card.Title class="text-2xl">Enter Verification Code</Card.Title>
			<Card.Description>
				We've sent a 6-digit code to <b>{email}</b>
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex justify-center gap-2 pt-3">
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
				<p class="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
			{/if}

			<div class="space-y-2 pt-4">
				<BrandedButton
					variant="primary"
					onclick={onVerify}
					disabled={!isComplete || isVerifying}
				>
					{isVerifying ? 'Verifying...' : 'Sign In'}
				</BrandedButton>

				<BrandedButton variant="secondary" onclick={onResend} disabled={isResending}>
					{isResending ? 'Sending...' : 'Resend Code'}
				</BrandedButton>

				<BrandedButton variant="tertiary" onclick={onBack}>Back</BrandedButton>
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
