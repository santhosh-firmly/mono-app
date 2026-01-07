<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import OtpInput from './otp-input.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   email?: string,
	 *   title?: string,
	 *   submitLabel?: string,
	 *   error?: string,
	 *   isVerifying?: boolean,
	 *   isResending?: boolean,
	 *   onverify?: (code: string) => void,
	 *   onresend?: () => void,
	 *   onback?: () => void
	 * }}
	 */
	let {
		email = '',
		title = 'Enter Verification Code',
		submitLabel = 'Sign In',
		error = $bindable(''),
		isVerifying = false,
		isResending = false,
		onverify,
		onresend,
		onback
	} = $props();

	let otp = $state(['', '', '', '', '', '']);
	let hasAutoVerified = $state(false);

	let otpValue = $derived(otp.join(''));
	let isComplete = $derived(otpValue.length === 6);

	// Auto-verify when all digits are filled
	$effect(() => {
		if (isComplete && !isVerifying && !hasAutoVerified) {
			hasAutoVerified = true;
			handleVerify();
		}
	});

	// Reset auto-verify flag when OTP is cleared
	$effect(() => {
		if (!isComplete) {
			hasAutoVerified = false;
		}
	});

	function handleVerify() {
		if (!isComplete) {
			error = 'Please enter the complete 6-digit code';
			return;
		}
		onverify?.(otpValue);
	}

	function handleResend() {
		otp = ['', '', '', '', '', ''];
		onresend?.();
	}
</script>

<Card.Root class="w-full max-w-md mx-auto shadow-2xl" style="background-color: white;">
	<Card.Header>
		<FirmlyLogo class="pb-6" />
		<Card.Title class="text-2xl">{title}</Card.Title>
		<Card.Description>
			We've sent a 6-digit code to <b>{email}</b>
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="pt-3">
			<OtpInput bind:value={otp} {error} disabled={isVerifying} />
		</div>

		<div class="space-y-2 pt-4">
			<BrandedButton
				variant="primary"
				onclick={handleVerify}
				disabled={!isComplete || isVerifying}
			>
				{isVerifying ? 'Verifying...' : submitLabel}
			</BrandedButton>

			<BrandedButton variant="secondary" onclick={handleResend} disabled={isResending}>
				{isResending ? 'Sending...' : 'Resend Code'}
			</BrandedButton>

			{#if onback}
				<BrandedButton variant="tertiary" onclick={onback}>Back</BrandedButton>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
