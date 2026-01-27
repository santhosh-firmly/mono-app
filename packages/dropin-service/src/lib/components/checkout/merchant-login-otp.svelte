<script>
	import OtpInput from '$lib/components/ui/otp.svelte';
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} MerchantLoginOtpProps
	 * @property {string} email - The email the code was sent to
	 * @property {string} error - Error message to display
	 * @property {boolean} loading - Whether the form is validating
	 * @property {Function} onSubmit - Called when OTP is complete
	 * @property {Function} onResend - Called when user requests resend
	 * @property {Function} onChangeEmail - Called when user wants to change email
	 */

	/**
	 * @type {MerchantLoginOtpProps}
	 */
	let {
		email = '',
		error = '',
		loading = false,
		onSubmit = () => {},
		onResend = () => {},
		onChangeEmail = () => {}
	} = $props();

	const OTP_LENGTH = 6;
	const RESEND_COOLDOWN_SECONDS = 30;

	let otpValue = $state('');
	let resendCooldown = $state(0);
	let cooldownInterval = $state(null);

	function handleOtpComplete(value) {
		otpValue = value;
		onSubmit(value);
	}

	function clearError() {
		// Parent should clear error through props
	}

	function startResendCooldown() {
		resendCooldown = RESEND_COOLDOWN_SECONDS;

		if (cooldownInterval) {
			clearInterval(cooldownInterval);
		}

		cooldownInterval = setInterval(() => {
			resendCooldown--;
			if (resendCooldown <= 0) {
				clearInterval(cooldownInterval);
				cooldownInterval = null;
			}
		}, 1000);
	}

	async function handleResend() {
		if (resendCooldown > 0 || loading) return;

		otpValue = '';
		startResendCooldown();
		await onResend();
	}

	let canResend = $derived(resendCooldown === 0 && !loading);
	let resendButtonText = $derived(
		resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'
	);
</script>

<div class="flex flex-col gap-4">
	<div class="text-center">
		<h3 class="text-lg font-semibold">Enter verification code</h3>
		<p class="text-muted mt-1 text-sm">
			We sent a code to <strong>{email}</strong>
		</p>
	</div>

	{#if loading}
		<div class="flex flex-col items-center gap-2 py-8">
			<Icon icon="svg-spinners:ring-resize" class="text-3xl text-blue-500" />
			<span class="text-muted text-sm">Verifying...</span>
		</div>
	{:else}
		<div class="py-2">
			<OtpInput
				length={OTP_LENGTH}
				bind:value={otpValue}
				{error}
				disabled={loading}
				onComplete={handleOtpComplete}
				onClearError={clearError}
			/>
		</div>

		<!-- Resend section -->
		<div class="flex flex-col items-center gap-2">
			<button
				type="button"
				onclick={handleResend}
				disabled={!canResend}
				class="text-sm text-blue-500 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
			>
				{resendButtonText}
			</button>

			<button
				type="button"
				onclick={onChangeEmail}
				disabled={loading}
				class="text-muted text-xs hover:underline disabled:cursor-not-allowed disabled:opacity-50"
			>
				Use a different email
			</button>
		</div>
	{/if}
</div>
