<script>
	import { fade } from 'svelte/transition';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import MerchantLoginEmail from './merchant-login-email.svelte';
	import MerchantLoginOtp from './merchant-login-otp.svelte';

	/**
	 * @typedef {'email' | 'otp'} LoginStep
	 */

	/**
	 * @typedef {Object} MerchantLoginModalProps
	 * @property {boolean} isOpen - Whether the modal is open
	 * @property {LoginStep} step - Current step ('email' or 'otp')
	 * @property {string} email - Email value
	 * @property {string} error - Error message
	 * @property {boolean} loading - Whether form is loading
	 * @property {boolean} canClose - Whether modal can be closed
	 * @property {Function} onClose - Called when modal is closed
	 * @property {Function} onEmailSubmit - Called when email is submitted
	 * @property {Function} onOtpSubmit - Called when OTP is submitted
	 * @property {Function} onResendOtp - Called when OTP resend is requested
	 * @property {Function} onChangeEmail - Called when user wants to change email
	 */

	/**
	 * @type {MerchantLoginModalProps}
	 */
	let {
		isOpen = false,
		step = 'email',
		email = '',
		error = '',
		loading = false,
		canClose = true,
		onClose = () => {},
		onEmailSubmit = () => {},
		onOtpSubmit = () => {},
		onResendOtp = () => {},
		onChangeEmail = () => {}
	} = $props();

	let emailValue = $derived.by(() => email);

	function handleEmailChange(value) {
		emailValue = value;
	}

	function handleEmailSubmit(value) {
		emailValue = value;
		onEmailSubmit(value);
	}

	function handleKeyDown(event) {
		if (isOpen && event.key === 'Escape' && canClose) {
			onClose();
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') {
			if (isOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = 'auto';
			}
		}
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-999 flex items-center justify-center overflow-y-auto backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="merchant-login-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			aria-label="Close Modal"
			onclick={() => canClose && onClose()}
			class="fixed inset-0 cursor-default bg-black/20"
			disabled={!canClose}
		></button>

		<!-- Modal content -->
		<div
			class="relative z-1000 m-4 w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
			transition:fade={{ duration: 150 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
				<h2 id="merchant-login-title" class="text-base font-semibold">
					{step === 'email' ? 'Sign In' : 'Verify Email'}
				</h2>
				{#if canClose}
					<button
						type="button"
						onclick={onClose}
						class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						aria-label="Close"
					>
						<Icon icon="mdi:close" class="text-xl" />
					</button>
				{/if}
			</div>

			<!-- Body -->
			<div class="p-4">
				{#if step === 'email'}
					<MerchantLoginEmail
						email={emailValue}
						{error}
						{loading}
						onEmailChange={handleEmailChange}
						onSubmit={handleEmailSubmit}
					/>
				{:else if step === 'otp'}
					<MerchantLoginOtp
						email={emailValue}
						{error}
						{loading}
						onSubmit={onOtpSubmit}
						onResend={onResendOtp}
						{onChangeEmail}
					/>
				{/if}
			</div>
		</div>
	</div>
{/if}
