<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import OtpField from './otp-field.svelte';

	export let device = 'phone';
	export let otpReference = '';
	export let alternativeMethodText = '';
	export let otpLength = 6;
	export let textClasses = '';
	export let error = '';
	export let disabled = false;
	export let alternativeTextDisabled = false;
	export let contentHeaderText = "Confirm it's you";
	export let isWaitingStepupOtp;
	export let otpNetwork = '';

	const dispatch = createEventDispatcher();
	function onOTPComplete(otpValue = '') {
		dispatch('otpCompleted', { otpValue });
	}

	function alternativeTextClicked() {
		dispatch('alternativeTextClicked', {});
	}
</script>

<div class="p-4">
	<div class="text-center text-sm font-bold text-[#5e5e5e]">{contentHeaderText}</div>
	{#if otpReference}
		<div class="pt-2 text-center text-sm font-medium">
			Enter the code <span class="capitalize">{otpNetwork}</span> sent to
			<b>{otpReference}</b> to use your saved information
		</div>
	{:else}
		<div class="pt-2 text-center text-sm font-medium">
			Enter the code sent to your {device} to use your saved information
		</div>
	{/if}
	<OtpField {error} {otpLength} {onOTPComplete} {disabled} />

	<slot name="under-otp" />
	<slot name="second-under-otp-slot" />

	{#if alternativeMethodText}
		<hr class="my-3" />
		<div class="text-fy-on-surface items-center justify-center text-sm font-bold">
			<button
				data-testid="alternative-text-button"
				class:blue-button={isWaitingStepupOtp}
				class="w-full p-2 {textClasses}
				 {alternativeTextDisabled
					? 'cursor-default'
					: 'cursor-pointer hover:underline hover:underline-offset-4'}"
				on:click={() => alternativeTextClicked()}
				disabled={alternativeTextDisabled}
			>
				{isWaitingStepupOtp ? 'Confirm Order' : alternativeMethodText}
			</button>
		</div>
	{/if}
</div>

<style>
	.blue-button {
		background-color: #1f3f9a;
		color: white;
		font-size: 0.875rem;
		line-height: 1.5rem;
		font-weight: 500;
		border-radius: 0.25rem;
	}

	.blue-button:hover {
		background-color: rgb(29 78 216);
		text-decoration: none;
	}
</style>
