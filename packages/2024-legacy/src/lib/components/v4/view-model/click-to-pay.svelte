<script>
	// @ts-nocheck

	import BaseLogin from '../base-login.svelte';
	import { BASE_LOGIN_STEPS } from '$lib/constants.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import Modal from '../modal.svelte';
	import C2pLogo from '$lib/components/common/c2p-logo.svelte';
	import {
		getVisaCardToken,
		isRecognized,
		unlockComplete,
		unlockStart,
		visaAuthenticate
	} from '$lib/clients/visa.svelte';
	import Checkbox from '../checkbox.svelte';
	import { InfoC2PRememberMeLong } from '$lib/browser/localization';

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

	function sendVisaEventToTelemetry(name) {
		window.firmly?.telemetryVisaEvent?.(name);
	}

	export async function c2pUnlockStart(email) {
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
			sendVisaEventToTelemetry('openC2pOTPModal');
			popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
			showC2pCheckbox = true;
			isModalOpen = true;
		} else if (res.status === 200 && res.data.recognized) {
			sendVisaEventToTelemetry('login-c2p-successful');
			dispatch('login-c2p-successful', Object.assign(res.data));
		}
		isC2PInProgress = false;
	}

	async function C2PValidateOtp(event) {
		let res;
		if (!otpReference) {
			popupStep = BASE_LOGIN_STEPS.PROCESSING_OTP;
			res = await unlockComplete(event.detail.otpValue);
		} else {
			const cloneAuthenticationMethod = structuredClone(selectedAuthenticationMethod);
			cloneAuthenticationMethod.methodAttributes.otpValue = event.detail.otpValue;
			res = await visaAuthenticate(cloneAuthenticationMethod);
		}
		if (res.status === 200 && res.data.payment_method_options) {
			sendVisaEventToTelemetry('C2pOTPSucceeded');
			otpError = '';
			isUserLoggedInC2p = true;
			isModalOpen = false;
			dispatch('login-c2p-successful', Object.assign(res.data));
		} else if (res.status === 200 && res.data.assuranceData) {
			sendVisaEventToTelemetry('C2pStepupOTPSucceeded');
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

		const res = await visaAuthenticate(selectedAuthenticationMethod);

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

	export async function tokenizeC2P(selectedCard, additionalData = {}) {
		const tokenizeResponse = await getVisaCardToken(
			selectedCard.id,
			null,
			isChecked,
			additionalData
		);
		if (tokenizeResponse.status !== 200) {
			const place_order_error = tokenizeResponse.data.description || tokenizeResponse.data;
			return { place_order_error };
		} else if (tokenizeResponse.data?.digitalCardData?.status === 'PENDING') {
			sendVisaEventToTelemetry('openC2pStepUpModal');
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
			sendVisaEventToTelemetry('resendCodeC2pOTP');
			await c2pUnlockStart(EmailC2P);
		} else if (popupStep === BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP) {
			sendVisaEventToTelemetry('resendCodeC2pStepupOTP');
			await handleContinueWithC2P(selectedAuthenticationMethod);
		}

		setTimeout(function () {
			alternativeMethodText = 'Resend code';
			otpAlternativeTextDisabled = false;
		}, 60000);
	}

	onMount(async () => {
		try {
			const res = await isRecognized();
			if (res?.status === 200 && res?.data.recognized) {
				sendVisaEventToTelemetry('login-c2p-successful');
				dispatch('login-c2p-successful', Object.assign(res.data));
			}
		} catch (ex) {
		}
	});
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
		<div slot="under-otp" class="flex justify-start flex-col" class:hidden={!showC2pCheckbox}>
			<Checkbox title={checkboxTitle} subtitle={InfoC2PRememberMeLong} bind:isChecked />
		</div>
		<div
			slot="second-under-otp-slot"
			class="flex justify-start flex-col"
			class:hidden={!showSecondSlot}
		>
			<div class="text-sm text-fy-on-surface font-bold items-center justify-center">
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
