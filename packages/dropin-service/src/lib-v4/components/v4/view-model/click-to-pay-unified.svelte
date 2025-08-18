<script>
	// @ts-nocheck
	import BaseLogin from '../base-login.svelte';
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import Modal from '../modal.svelte';
	import C2pLogo from '$lib-v4/components/common/c2p-logo.svelte';
	import Checkbox from '../checkbox.svelte';
	import { InfoC2PRememberMeLong } from '$lib-v4/browser/localization';
	import {
		isRecognized,
		unlockComplete,
		unlockStart,
		checkoutWithCard
	} from '$lib-v4/clients/mastercard';
	import { trackUXEvent } from '$lib-v4/browser/telemetry.js';

	const dispatch = createEventDispatcher();

	/**
	 * Maximum countdown seconds for the resend code button
	 */
	const MAX_COUNTDOWN_SECONDS = 30;

	/**
	 * Whether or not the Visa pop up is open
	 */
	export let isModalOpen = false;
	/**
	 * Destinations to which device the OTP should be send
	 */
	export let c2pOTPDestination;
	/**
	 * Message to be displayed as the header of the main context
	 */
	export let contentHeaderText = 'Welcome back to Click to Pay';
	/**
	 * Whether or not will show the "Remember me" checkbox
	 */
	export let showC2pCheckbox = false;
	/**
	 * Selected step-up method
	 */
	export let selectedAuthenticationMethod;
	/**
	 * Destinations to which device the C2P step-up OTP should be send
	 */
	export let otpReference = '';
	/**
	 * Set the default value of the "Remember me" checkbox as checked
	 */
	let isChecked = true;
	/**
	 * Countdown timer for the resend code button
	 */
	let countdown = MAX_COUNTDOWN_SECONDS;
	/**
	 * Countdown timer for the resend code button
	 */
	let countDownTimer;

	export let cart;
	export let checkboxTitle = 'Remember me in this browser';
	export let isUserLoggedInC2p = false;
	export let isC2PInProgress = false;
	export let showSecondSlot = false;
	export let popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
	export let isWaitingStepupOtp = false;
	export let otpEmailInfo = '';
	export let otpPhoneInfo = '';
	let c2pMaskedCard;
	let otpError;
	let emailError;
	let otpDevice;
	let otpAlternativeTextDisabled = false;
	let alternativeMethodText = 'Resend code';
	let EmailC2P;

	export async function c2pUnlockStart(email, requestedChannelId = null) {
		const parentContext = trackUXEvent('c2p_unlock_start', {
			email: email?.replace(/(.{3}).*(@.*)/, '$1***$2'),
			channelId: requestedChannelId
		});
		isC2PInProgress = true;
		EmailC2P = email;
		const res = await unlockStart(email, requestedChannelId || 'EMAIL');
		if (res.status === 200 && res.data.otp_destination) {
			c2pOTPDestination = res.data.otp_destination;
			otpEmailInfo = otpPhoneInfo = null;
			if (c2pOTPDestination?.emails) {
				otpEmailInfo = c2pOTPDestination.emails[0];
			}
			if (c2pOTPDestination?.phones) {
				otpPhoneInfo = c2pOTPDestination.phones[0];
			}

			// Set otpReference based on requested channel
			if (requestedChannelId === 'EMAIL' && c2pOTPDestination?.emails) {
				otpReference = c2pOTPDestination.emails[0];
				otpDevice = 'Email';
			} else if (requestedChannelId === 'SMS' && c2pOTPDestination?.phones) {
				otpReference = c2pOTPDestination.phones[0];
				otpDevice = 'Phone';
			} else {
				otpReference = '';
				otpDevice = 'Phone or Email';
			}

			popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
			showC2pCheckbox = true;
			isModalOpen = true;
		} else if (res.status === 200 && res.data.recognized) {
			dispatch('login-c2p-successful', Object.assign(res.data));
		}
		isC2PInProgress = false;
	}
	async function C2PValidateOtp(event) {
		const parentContext = trackUXEvent('c2p_validate_otp', {
			hasOtpReference: !!otpReference,
			otpLength: event.detail.otpValue?.length
		});
		let res;
		if (!otpReference) {
			popupStep = BASE_LOGIN_STEPS.PROCESSING_OTP;
			res = await unlockComplete(event.detail.otpValue);
		} else {
			const cloneAuthenticationMethod = structuredClone(selectedAuthenticationMethod);
			cloneAuthenticationMethod.methodAttributes.otpValue = event.detail.otpValue;
			res = await window.firmly.visa.visaAuthenticate(cloneAuthenticationMethod);
		}
		if (res.status === 200 && res.data.payment_method_options) {
			otpError = '';
			isUserLoggedInC2p = true;
			isModalOpen = false;
			dispatch('login-c2p-successful', Object.assign(res.data));
		} else if (res.status === 200 && res.data.assuranceData) {
			otpError = '';
			isModalOpen = false;
			dispatch('authenticate-c2p-successful', Object.assign(res.data));
		} else {
			otpError = res.data?.description || res.data;
			popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
		}
	}
	async function handleContinueWithC2P(event) {
		showC2pCheckbox = false;
		if (event?.detail?.selectedAuthenticationMethod) {
			popupStep = BASE_LOGIN_STEPS.PROCESSING_C2P_OTP_STEPUP;
			selectedAuthenticationMethod = event.detail.selectedAuthenticationMethod;
		} else if (event.authenticationMethodType) {
			selectedAuthenticationMethod = event;
		}
		const res = await window.firmly.visa.visaAuthenticate(selectedAuthenticationMethod);
		if (res.status === 200) {
			contentHeaderText = "Confirm it's you";
			showSecondSlot = true;
			popupStep = BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP;
			isWaitingStepupOtp = true;
			otpReference = selectedAuthenticationMethod.authenticationCredentialReference;
			return;
		} else {
			popupStep = BASE_LOGIN_STEPS.SELECTING_C2P_STEPUP;
		}
	}
	export async function tokenizeC2P(selectedCard, additionalData, cvv) {
		const parentContext = trackUXEvent('c2p_tokenize', {
			rememberMe: isChecked,
			hasCvv: !!cvv,
			cartValue: cart.total.value,
			currency: cart.total.currency
		});
		const tokenizeResponse = await checkoutWithCard({
			cardId: selectedCard.id,
			rememberMe: isChecked,
			cvv,
			additionalData: {
				value: cart.total.value,
				currency: cart.total.currency
			}
		});

		if (tokenizeResponse.status !== 200) {
			const place_order_error = tokenizeResponse.data.description || tokenizeResponse.data;
			return { place_order_error };
		} else if (tokenizeResponse.data?.digitalCardData?.status === 'PENDING') {
			c2pMaskedCard = tokenizeResponse.data;
			popupStep = BASE_LOGIN_STEPS.SELECTING_C2P_STEPUP;
			isModalOpen = true;
		}

		return tokenizeResponse.data;
	}

	/**
	 * Unified function to handle sending or resending OTP to a channel,
	 * including countdown logic for resend button.
	 * @param {'email'|'phone'} [channelType] - Optional channel type to send OTP to.
	 */
	async function handleOtpSend(channelType = null) {
		// If called as a resend, start countdown and disable button
		if (channelType === null) {
			countdown = MAX_COUNTDOWN_SECONDS;
			alternativeMethodText = `Resend code (${countdown} seconds)`;
			otpAlternativeTextDisabled = true;

			countDownTimer = setInterval(function () {
				alternativeMethodText = `Resend code (${countdown--} seconds)`;
				if (countdown < 0) {
					clearTimeout(countDownTimer);
					alternativeMethodText = 'Resend code';
					otpAlternativeTextDisabled = false;
				}
			}, 1000);

			if (popupStep === BASE_LOGIN_STEPS.WAITING_OTP) {
				// If otpReference is set (channel selected), resend to same channel
				// Otherwise, restart the flow to show channel selection
				if (otpReference) {
					const channelId = c2pOTPDestination?.emails?.includes(otpReference)
						? 'EMAIL'
						: 'SMS';
					await c2pUnlockStart(EmailC2P, channelId);
				} else {
					await c2pUnlockStart(EmailC2P);
				}
			} else if (popupStep === BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP) {
				await handleContinueWithC2P(selectedAuthenticationMethod);
			}
		} else {
			const channelId = channelType === 'email' ? 'EMAIL' : 'SMS';
			const hasChannel =
				channelType === 'email' ? c2pOTPDestination?.emails : c2pOTPDestination?.phones;

			if (hasChannel) {
				trackUXEvent(`sendOtpTo${channelType === 'email' ? 'Email' : 'Phone'}`);
				await c2pUnlockStart(EmailC2P, channelId);
			}
		}
	}
</script>

<Modal bind:isModalOpen on:modalClosed>
	<BaseLogin
		loginProviderName="Click to Pay"
		subtitle=""
		buttonClasses="bg-[#1F3F9A] hover:bg-blue-700 text-white"
		textClasses="text-blue-500"
		termsOfServiceLink="https://usa.visa.com/legal/checkout/terms-of-service.html"
		privacyPolicyLink="https://usa.visa.com/legal/global-privacy-notice.html"
		hideChangeButton={true}
		{otpDevice}
		{c2pMaskedCard}
		{otpReference}
		{contentHeaderText}
		{isWaitingStepupOtp}
		bind:phone={otpPhoneInfo}
		bind:clickToPayEmail={otpEmailInfo}
		bind:currentStep={popupStep}
		on:otpCompleted={C2PValidateOtp}
		on:otpMethodSelected={handleContinueWithC2P}
		bind:emailError
		bind:otpError
		on:clearError={() => {
			otpError = '';
		}}
	>
		<C2pLogo slot="logo" width={16} height={16} />
		<div slot="under-otp" class="flex flex-col justify-start" class:hidden={!showC2pCheckbox}>
			<Checkbox title={checkboxTitle} subtitle={InfoC2PRememberMeLong} bind:isChecked />
		</div>
		<div slot="second-under-otp-slot" class="flex flex-col justify-start">
			<hr class="mt-4" />
			<span class="text-fy-on-surface-subtle mt-2 text-center text-sm"
				>{alternativeMethodText}</span
			>
			<div
				class="text-fy-on-surface mt-2 flex flex-row items-center justify-center gap-2 divide-x-2 divide-gray-100 text-sm font-bold"
			>
				{#each [{ channel: 'email', testId: 'send-otp-to-email', label: 'Email' }, { channel: 'phone', testId: 'send-otp-to-phone', label: 'Phone' }] as { channel, testId, label }}
					<button
						type="button"
						data-testid={testId}
						class:text-gray-500={otpAlternativeTextDisabled}
						class:cursor-pointer={!otpAlternativeTextDisabled}
						class:cursor-auto={otpAlternativeTextDisabled}
						class="w-full p-2
							 {otpAlternativeTextDisabled
							? ''
							: 'text-blue-500 hover:text-[#1F3F9A] hover:underline hover:underline-offset-4'}"
						on:click={() => handleOtpSend(channel)}
						disabled={otpAlternativeTextDisabled}
					>
						{label}
					</button>
				{/each}
			</div>
		</div>
	</BaseLogin>
</Modal>
