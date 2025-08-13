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
	export let cart;
	export let checkboxTitle = 'Skip verification next time';
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

	export async function c2pUnlockStart(email) {
		const parentContext = trackUXEvent('mastercard_c2p_unlock_start', {
			email: email?.replace(/(.{3}).*(@.*)/, '$1***$2')
		});
		isC2PInProgress = true;
		EmailC2P = email;
		const res = await unlockStart(email);
		if (res.status === 200 && res.data.otp_destination) {
			c2pOTPDestination = res.data.otp_destination;
			otpEmailInfo = otpPhoneInfo = null;
			if (c2pOTPDestination?.emails) {
				otpEmailInfo = c2pOTPDestination.emails[0];
			}
			if (c2pOTPDestination?.phones) {
				otpPhoneInfo = c2pOTPDestination.phones[0];
			}
			otpDevice = 'Phone or Email';
			popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
			showC2pCheckbox = true;
			isModalOpen = true;
		} else if (res.status === 200 && res.data.recognized) {
			dispatch('login-c2p-successful', Object.assign(res.data));
		}
		isC2PInProgress = false;
	}
	async function C2PValidateOtp(event) {
		const parentContext = trackUXEvent('mastercard_c2p_validate_otp', {
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
		const parentContext = trackUXEvent('mastercard_c2p_tokenize', {
			cardId: selectedCard.id,
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
	async function resendCode() {
		alternativeMethodText = 'Code sent';
		otpAlternativeTextDisabled = true;
		if (popupStep === BASE_LOGIN_STEPS.WAITING_OTP) {
			await c2pUnlockStart(EmailC2P);
		} else if (popupStep === BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP) {
			await handleContinueWithC2P(selectedAuthenticationMethod);
		}
		setTimeout(function () {
			alternativeMethodText = 'Resend code';
			otpAlternativeTextDisabled = false;
		}, 60000);
	}
</script>

<Modal bind:isModalOpen on:modalClosed>
	<BaseLogin
		loginProviderName="Click to Pay"
		subtitle="Click to Pay"
		secondSubTitle="Bank Verification"
		buttonClasses="bg-[#1F3F9A] hover:bg-blue-700 text-white"
		textClasses="text-blue-500"
		termsOfServiceLink="https://usa.visa.com/legal/checkout/terms-of-service.html"
		privacyPolicyLink="https://usa.visa.com/legal/global-privacy-notice.html"
		otpAlternativeMethodText={alternativeMethodText}
		hideChangeButton={true}
		{otpDevice}
		{c2pMaskedCard}
		{otpReference}
		{otpAlternativeTextDisabled}
		{contentHeaderText}
		{isWaitingStepupOtp}
		bind:phone={otpPhoneInfo}
		bind:clickToPayEmail={otpEmailInfo}
		bind:currentStep={popupStep}
		on:otpCompleted={C2PValidateOtp}
		on:otpMethodSelected={handleContinueWithC2P}
		on:alternativeTextClicked={resendCode}
		bind:emailError
		bind:otpError
	>
		<C2pLogo slot="logo" width={16} height={16} />
		<div slot="under-otp" class="flex flex-col justify-start" class:hidden={!showC2pCheckbox}>
			<Checkbox title={checkboxTitle} subtitle={InfoC2PRememberMeLong} bind:isChecked />
		</div>
		<div
			slot="second-under-otp-slot"
			class="flex flex-col justify-start"
			class:hidden={!showSecondSlot}
		>
			<div class="text-fy-on-surface items-center justify-center text-sm font-bold">
				<button
					data-testid="alternative-text-button"
					class="w-full p-2 text-blue-500 hover:text-[#1F3F9A]
					 {otpAlternativeTextDisabled
						? 'cursor-default'
						: 'cursor-pointer hover:underline hover:underline-offset-4'}"
					on:click={() => {
						resendCode();
					}}
					disabled={otpAlternativeTextDisabled}
				>
					{alternativeMethodText}
				</button>
			</div>
		</div>
	</BaseLogin>
</Modal>
