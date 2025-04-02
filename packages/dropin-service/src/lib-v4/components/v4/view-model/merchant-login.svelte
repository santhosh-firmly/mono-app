<script>
	// @ts-nocheck
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants';
	import { createEventDispatcher } from 'svelte';

	import BaseLogin from '../base-login.svelte';
	import Modal from '../modal.svelte';
	import LogoDisplay from '../logo-display.svelte';
	import { postSignIn } from '$lib-v4/browser/cross';

	const dispatch = createEventDispatcher();

	/**
	 * Whether or not the Merchant Login pop up is open
	 */
	export let isModalOpen = false;

	/**
	 * Merchant brand name
	 */
	export let merchantName = '';

	/**
	 * Merchant logo
	 */
	export let merchantLogo = '';

	/**
	 * Link to merchant's terms of service
	 */
	export let termsOfServiceLink = '';

	/**
	 * Link to merchant's privacy policy
	 */
	export let privacyPolicyLink = '';

	/**
	 * Login step
	 */
	export let currentStep = BASE_LOGIN_STEPS.WAITING_EMAIL;

	/**
	 * Customer email
	 */
	export let email;

	export let canCloseModal = true;

	let otpError;
	let emailError;
	let alternativeMethodText = 'Resend code';
	let otpAlternativeTextDisabled = false;

	async function resendCode() {
		alternativeMethodText = 'Code sent';
		otpAlternativeTextDisabled = true;

		await createOtp();

		setTimeout(function () {
			alternativeMethodText = 'Resend code';
			otpAlternativeTextDisabled = false;
		}, 60000);
	}

	async function createOtp() {
		const createOtpResponse = await window.firmly.sessionCreateOtp(email);

		if (createOtpResponse.status === 200) {
			currentStep = BASE_LOGIN_STEPS.WAITING_OTP;
		} else {
			emailError = createOtpResponse.data?.description || createOtpResponse.data;
			currentStep = BASE_LOGIN_STEPS.WAITING_EMAIL;
		}
	}

	async function onLoginEmailSet(event) {
		email = event.detail.email;
		await createOtp();
	}

	async function merchantValidateOtp(event) {
		currentStep = BASE_LOGIN_STEPS.PROCESSING_OTP;
		const otpValue = event.detail.otpValue;

		const validateOtpResponse = await window.firmly.sessionValidateOtp(email, otpValue);
		if (validateOtpResponse.status === 200) {
			otpError = '';
			postSignIn(validateOtpResponse.data.session.cookies);
			dispatch('login-successful', Object.assign({ email }, validateOtpResponse.data));
		} else {
			otpError = validateOtpResponse.data?.description || validateOtpResponse.data;
			currentStep = BASE_LOGIN_STEPS.WAITING_OTP;
		}
	}

	$: {
		if (!isModalOpen) {
			currentStep = BASE_LOGIN_STEPS.WAITING_EMAIL;
		}
	}
</script>

<Modal bind:isModalOpen on:modalClosed bind:canCloseModal>
	<BaseLogin
		loginProviderName={merchantName}
		{termsOfServiceLink}
		{privacyPolicyLink}
		bind:email
		bind:otpError
		bind:currentStep
		bind:otpAlternativeMethodText={alternativeMethodText}
		bind:otpAlternativeTextDisabled
		bind:emailError
		otpDevice="phone and email"
		on:emailSet={onLoginEmailSet}
		on:otpCompleted={merchantValidateOtp}
		on:alternativeTextClicked={resendCode}
		buttonClasses="bg-fy-primary text-white"
	>
		<div slot="logo">
			<LogoDisplay {merchantLogo} {merchantName} />
		</div>
		<div slot="button-logo" class="p-1 font-bold">
			{merchantName}
		</div>
	</BaseLogin>
</Modal>
