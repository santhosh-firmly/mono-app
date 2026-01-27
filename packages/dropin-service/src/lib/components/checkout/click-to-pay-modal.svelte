<script>
	import Modal from '$lib/components/ui/modal.svelte';
	import UiCheckbox from '$lib/components/ui/checkbox.svelte';
	import UiSpinner from '$lib/components/ui/spinner.svelte';
	import OtpInput from '$lib/components/ui/otp.svelte';
	import IconC2p from '$lib/components/ui/icons/icon-c2p.svelte';
	import IconMastercard from '$lib/components/ui/icons/icon-mastercard.svelte';
	import IconVisa from '$lib/components/ui/icons/icon-visa.svelte';
	import IconAmex from '$lib/components/ui/icons/icon-amex.svelte';
	import IconDiscover from '$lib/components/ui/icons/icon-discover.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} OtpDestination
	 * @property {string[]} emails - Available email destinations (unmasked)
	 * @property {string[]} phones - Available phone destinations (masked like (•••) •••-•875)
	 */

	/**
	 * @typedef {Object} ClickToPayModalProps
	 * @property {boolean} show - Modal visibility
	 * @property {OtpDestination} otpDestination - OTP destination options
	 * @property {string} network - Card network ('mastercard' | 'visa')
	 * @property {Function} onSubmit - Called with OTP code when submitted
	 * @property {Function} onClose - Called when modal is closed
	 * @property {Function} onResendOtp - Called with channel ('EMAIL' | 'SMS')
	 * @property {boolean} isLoading - Loading state (shows validating spinner)
	 * @property {string} error - Error message to display
	 * @property {boolean} showRememberMe - Whether to show remember me checkbox
	 * @property {boolean} rememberMe - Remember me checkbox value (bindable)
	 * @property {boolean} useAbsolutePosition - Use absolute positioning (for configurator)
	 */

	/** @type {ClickToPayModalProps} */
	let {
		show = false,
		otpDestination = { emails: [], phones: [] },
		network = 'mastercard',
		onSubmit = () => {},
		onClose = () => {},
		onResendOtp = () => {},
		isLoading = false,
		error = '',
		showRememberMe = true,
		rememberMe = $bindable(true),
		useAbsolutePosition = false
	} = $props();

	const OTP_LENGTH = 6;
	const MAX_COUNTDOWN_SECONDS = 60;

	let otpValue = $state('');
	let countdown = $state(0);
	let countdownTimer = null;

	let emailDestination = $derived(otpDestination?.emails?.[0] || '');
	let phoneDestination = $derived(otpDestination?.phones?.[0] || '');
	let primaryDestination = $derived(emailDestination || phoneDestination);
	let isResendDisabled = $derived(countdown > 0 || isLoading);

	let resendOptions = $derived([
		{
			channel: 'EMAIL',
			label: m.c2p_resend_email(),
			disabled: !otpDestination?.emails?.length
		},
		{
			channel: 'SMS',
			label: m.c2p_resend_phone(),
			disabled: !otpDestination?.phones?.length
		}
	]);

	function handleOtpComplete(code) {
		if (!isLoading) {
			onSubmit(code);
		}
	}

	function clearOtpError() {
		// Error is controlled by parent, this is just for clearing visual state
	}

	function startCountdown() {
		countdown = MAX_COUNTDOWN_SECONDS;
		if (countdownTimer) clearInterval(countdownTimer);
		countdownTimer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownTimer);
				countdownTimer = null;
			}
		}, 1000);
	}

	async function handleResendOtp(channel) {
		if (isResendDisabled) return;
		startCountdown();
		await onResendOtp(channel);
	}

	function handleNotYou() {
		if (countdownTimer) clearInterval(countdownTimer);
		onClose();
	}

	$effect(() => {
		if (error) {
			otpValue = '';
		}
	});

	$effect(() => {
		return () => {
			if (countdownTimer) clearInterval(countdownTimer);
		};
	});
</script>

<Modal
	{show}
	{onClose}
	loading={isLoading}
	{useAbsolutePosition}
	ariaLabelledby="otp-modal-title"
	class="w-90 max-w-full border-[#e0e0e0]"
>
	<!-- Header: Credit/Debit with card network logos -->
	<div class="flex w-full flex-row items-center justify-between gap-2 p-4">
		<div class="flex items-center gap-2">
			<IconC2p width={32} height={17} />
			<span class="text-sm font-semibold text-gray-800">
				{m.c2p_credit_debit()}
			</span>
		</div>
		<div class="flex items-center gap-0.5">
			<IconMastercard width={24} height={15} />
			<IconVisa width={24} height={15} />
			<IconAmex width={24} height={15} />
			<IconDiscover width={24} height={15} />
		</div>
	</div>

	<hr class="mx-4 border-gray-200" />

	<!-- Email/Phone info with Not you? button -->
	<div class="flex items-center justify-between px-4 py-3">
		<div class="flex flex-col text-sm text-gray-600">
			{#if emailDestination}
				<span class="font-medium">{emailDestination}</span>
			{/if}
			{#if phoneDestination}
				<span class="text-gray-500">{phoneDestination}</span>
			{/if}
		</div>
		<button
			type="button"
			class="text-sm text-gray-500 underline hover:text-gray-700 {isLoading
				? 'cursor-not-allowed opacity-50'
				: 'cursor-pointer'}"
			onclick={handleNotYou}
			disabled={isLoading}
			data-testid="not-you-button"
		>
			{m.c2p_not_you()}
		</button>
	</div>

	<hr class="mx-4 border-gray-200" />

	<div class="px-4 pb-4">
		{#if isLoading}
			<!-- Validating state with spinner -->
			<div class="flex min-h-70 flex-col items-center justify-center">
				<UiSpinner width={48} height={48} class="text-blue-500" />
				<p class="mt-4 text-sm text-blue-500">{m.c2p_validating_code()}</p>
			</div>
		{:else}
			<!-- Title -->
			<p id="otp-modal-title" class="pt-3 text-center text-sm font-bold text-[#5e5e5e]">
				{m.c2p_found_cards()}
			</p>

			<!-- Confirm subtitle -->
			<p class="pt-1 text-center text-sm text-[#5e5e5e]">
				{m.c2p_confirm_its_you()}
			</p>

			<!-- OTP Description with network and destination -->
			<div class="pt-2 text-center text-sm font-medium text-gray-700">
				{m.c2p_enter_code()}
				{#if network}
					<span class="capitalize">{network}</span>
				{/if}
				{m.c2p_sent_to()}
				<strong>{primaryDestination}</strong>
				{m.c2p_use_saved_info()}
			</div>

			<!-- OTP Input Fields -->
			<form class="flex flex-col gap-2 py-3" onsubmit={(e) => e.preventDefault()}>
				<OtpInput
					length={OTP_LENGTH}
					bind:value={otpValue}
					{error}
					disabled={isLoading}
					onComplete={handleOtpComplete}
					onClearError={clearOtpError}
				/>
			</form>

			<!-- Remember Me Checkbox -->
			{#if showRememberMe}
				<div class="mb-3">
					<UiCheckbox
						bind:isChecked={rememberMe}
						disabled={isLoading}
						title={m.c2p_remember_me()}
						subtitle={m.c2p_remember_me_description()}
					/>
				</div>
			{/if}

			<!-- Resend Code Section -->
			<div class="flex w-full items-center justify-center">
				<div class="h-px grow bg-gray-200"></div>
				<span class="px-3 text-xs text-gray-400">
					{countdown > 0
						? m.c2p_resend_code_countdown({ seconds: countdown })
						: m.c2p_resend_code()}
				</span>
				<div class="h-px grow bg-gray-200"></div>
			</div>

			<!-- Email/Phone Resend Buttons -->
			<div class="mt-2 flex flex-row items-center justify-center">
				{#each resendOptions as { channel, label, disabled }, i (channel)}
					<button
						type="button"
						class="w-full py-2 text-sm font-semibold text-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
						onclick={() => handleResendOtp(channel)}
						disabled={isResendDisabled || disabled}
						data-testid="send-otp-to-{channel.toLowerCase()}"
					>
						{label}
					</button>
					{#if i === 0}
						<div class="h-6 w-px bg-gray-200"></div>
					{/if}
				{/each}
			</div>

			<!-- OR Divider -->
			<div class="mt-3 flex w-full items-center justify-center">
				<div class="h-px grow bg-gray-200"></div>
				<span class="px-3 text-xs text-gray-400">{m.c2p_or()}</span>
				<div class="h-px grow bg-gray-200"></div>
			</div>

			<!-- Enter Card Manually Button -->
			<div class="mt-2 flex justify-center">
				<button
					type="button"
					class="text-sm text-gray-500 underline hover:text-gray-700 {isLoading
						? 'cursor-not-allowed opacity-50'
						: 'cursor-pointer'}"
					onclick={handleNotYou}
					disabled={isLoading}
					data-testid="enter-card-manually-button"
				>
					{m.c2p_enter_card_manually()}
				</button>
			</div>
		{/if}
	</div>
</Modal>
