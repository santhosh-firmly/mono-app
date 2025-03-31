<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import OtpValidation from './otp-validation.svelte';
	import * as Yup from 'yup';
	import Helper from '../vendor/helper.svelte';
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants.js';
	import { isActionDark } from './theme-context.js';
	import VisaStepUpOptions from './visa-step-up-options.svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Classes to apply to the payment button
	 */
	export let buttonClasses = 'bg-fy-action text-fy-on-action';

	/**
	 * Classes to apply to the progress
	 */
	export let spinnerClasses = !$isActionDark
		? 'fill-fy-on-action text-gray-400'
		: 'fill-fy-on-action text-gray-fy-on-action-subtle';

	/**
	 * Classes to apply to the terms and privacy links
	 */
	export let textClasses = 'text-fy-primary';

	/**
	 * Name of the login provider
	 */
	export let loginProviderName = '';

	/**
	 * Sub title message
	 */
	export let subtitle = `${loginProviderName} login selected`;

	/**
	 * Second Sub title message
	 */
	export let secondSubTitle = '';

	/**
	 * Message to be displayed as the header of the main context
	 */
	export let contentHeaderText = "Confirm it's you";

	/**
	 * Link to merchant's terms of service
	 */
	export let termsOfServiceLink = '';

	/**
	 * Link to merchant's privacy policy
	 */
	export let privacyPolicyLink = '';

	/**
	 * OTP device
	 */
	export let otpDevice = 'phone';

	/**
	 * OTP alternative method text
	 */
	export let otpAlternativeMethodText = '';

	/**
	 * OTP length
	 */
	export let otpLength = 6;

	/**
	 * OTP Error
	 */
	export let otpError = '';

	/**
	 * Control if the OTP alternative text button is disabled
	 */
	export let otpAlternativeTextDisabled = false;

	/**
	 * Error shown during email validation or OTP issuing phase.
	 */
	export let emailError = '';

	/**
	 * Customer Email. Parent component is responsible for passing it truncated, if desired
	 */
	export let clickToPayEmail = '';

	/**
	 * Option to hide the button that changes the email. Parent component is responsible for passing it truncated, if desired
	 */
	export let hideChangeButton = false;

	export let otpReference = '';

	/**
	 * Customer phone. Parent component is responsible for passing it truncated, if desired
	 */
	export let phone = '';

	export let currentStep = BASE_LOGIN_STEPS.WAITING_EMAIL;

	export let c2pMaskedCard;

	export let isWaitingStepupOtp;
	const emailSchema = Yup.string().email().required('Required');

	/**
	 * Customer email
	 */
	export let email = '';

	async function onEmailSet(event) {
		try {
			event.preventDefault();
			await emailSchema.validate(email);
			emailError = '';
			currentStep = BASE_LOGIN_STEPS.PROCESSING_EMAIL;
			dispatch('emailSet', { email });
		} catch (e) {
			emailError = 'Email is invalid';
		}
	}

	function changeEmail() {
		currentStep = BASE_LOGIN_STEPS.WAITING_EMAIL;
	}

	function changeStepupMethod() {
		currentStep = BASE_LOGIN_STEPS.SELECTING_C2P_STEPUP;
	}
</script>

<div class="max-w-[360px] max-[300px]:max-w-[180px]">
	<div class="p-4 pb-1">
		<slot name="logo" />
		{#if secondSubTitle}
			<span class="text-xs font-medium"
				>{subtitle} <span class="text-gray-500">| {secondSubTitle}</span></span
			>
		{:else}
			<span class="text-xs font-medium"> {subtitle} </span>
		{/if}
	</div>
	<hr class="mx-4" />
	{#if currentStep === BASE_LOGIN_STEPS.WAITING_OTP || currentStep === BASE_LOGIN_STEPS.PROCESSING_OTP}
		<div class="flex items-center justify-between p-4 text-sm text-[#5e5e5e]">
			<div class="grow">
				<span class="flex font-bold">{email || clickToPayEmail}</span>
				<span class="flex">{phone}</span>
			</div>
			{#if !hideChangeButton}
				<button
					data-testid="change-email-button"
					class="p-3 text-xs font-bold {textClasses} cursor-pointer rounded-full hover:underline hover:underline-offset-4"
					on:click={() => changeEmail()}
				>
					Change
				</button>
			{/if}
		</div>
		<hr class="mx-4" />
	{/if}

	{#if currentStep === BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP}
		<div class="flex items-center justify-between p-4 text-sm text-[#5e5e5e]">
			<div class="grow">
				<span class="flex font-bold">{otpReference}</span>
			</div>

			<button
				class="p-3 text-xs font-bold {textClasses} cursor-pointer rounded-full hover:underline hover:underline-offset-4"
				on:click={() => changeStepupMethod()}
			>
				Change
			</button>
		</div>
		<hr class="mx-4" />
	{/if}

	{#if currentStep === BASE_LOGIN_STEPS.WAITING_EMAIL || currentStep === BASE_LOGIN_STEPS.PROCESSING_EMAIL}
		<form data-testid="email-form" class="mt-4 mr-4 ml-4" on:submit={onEmailSet}>
			<div class="flex items-center justify-center text-sm font-bold text-[#5e5e5e]">
				Log in or sign up
			</div>
			<div class="flex items-center justify-center text-sm font-medium text-[#5e5e5e]">
				Enter your email to login or sign up
			</div>
			<div class="mt-4 flex items-center justify-center">
				<input
					data-testid="email-input-base-login"
					type="text"
					class="h-[46px] w-full rounded-lg border border-[#e0e0e0] text-sm shadow-[0_2px_6px_0px_rgba(136,136,136,0.25)] {emailError
						? 'border-fy-alert border-1'
						: ''} "
					placeholder="Email"
					autocomplete="email"
					bind:value={email}
					disabled={currentStep === BASE_LOGIN_STEPS.PROCESSING_EMAIL}
				/>
			</div>
			{#if emailError}
				<div data-testid="email-error">
					<Helper
						color="red"
						helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-center"
					>
						{emailError}
					</Helper>
				</div>
			{/if}
			<slot name="additional-content" />
			<div class="mt-4 flex items-center justify-center">
				<button
					data-testid="continue-button"
					type="submit"
					class="relative flex w-full flex-row items-center rounded p-2 text-sm font-medium {buttonClasses}"
					disabled={currentStep === BASE_LOGIN_STEPS.PROCESSING_EMAIL}
				>
					<span class="flex w-full flex-row items-center justify-center leading-6"
						>Continue with <slot name="button-logo">
							<span class="font-bold"> &nbsp;{loginProviderName} </span>
						</slot>
					</span>
					{#if currentStep === BASE_LOGIN_STEPS.PROCESSING_EMAIL}
						<svg
							aria-hidden="true"
							class="absolute right-0 mr-2 h-6 w-6 animate-spin {spinnerClasses}"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
								fill="currentColor"
							/>
							<path
								d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
								fill="currentFill"
							/>
						</svg>
					{/if}
				</button>
			</div>
			<div class="my-3.5 flex pr-2 pl-2">
				<span class="text-center text-xs text-[#5e5e5e]"
					>By using {loginProviderName} login, you agree to the
					<a target="_blank" href={termsOfServiceLink} class="{textClasses} font-bold"
						>terms of service</a
					>
					and
					<a target="_blank" href={privacyPolicyLink} class="{textClasses} font-bold"
						>privacy policy</a
					>.</span
				>
			</div>
		</form>
	{/if}

	{#if currentStep === BASE_LOGIN_STEPS.SELECTING_C2P_STEPUP || currentStep === BASE_LOGIN_STEPS.PROCESSING_C2P_OTP_STEPUP}
		<VisaStepUpOptions
			{c2pMaskedCard}
			{currentStep}
			{buttonClasses}
			{spinnerClasses}
			{loginProviderName}
			on:otpMethodSelected
		></VisaStepUpOptions>
	{/if}

	{#if currentStep === BASE_LOGIN_STEPS.WAITING_OTP || currentStep === BASE_LOGIN_STEPS.PROCESSING_OTP || currentStep === BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP}
		<OtpValidation
			on:otpCompleted
			on:alternativeTextClicked
			alternativeTextDisabled={otpAlternativeTextDisabled}
			disabled={currentStep === BASE_LOGIN_STEPS.PROCESSING_OTP}
			device={otpDevice}
			alternativeMethodText={otpAlternativeMethodText}
			error={otpError}
			{otpReference}
			{textClasses}
			{otpLength}
			{contentHeaderText}
			{isWaitingStepupOtp}
		>
			<slot name="under-otp" slot="under-otp" />
			<slot name="second-under-otp-slot" slot="second-under-otp-slot" />
		</OtpValidation>
	{/if}
</div>
