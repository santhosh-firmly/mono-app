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
	export let contentHeaderText = 'Click to Pay has found your linked cards';
	/**
	 * Whether or not will show the "Remember me" checkbox
	 */
	export let showC2pCheckbox = false;
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
	/**
	 * Network used to start the validation flow
	 */
	let network;

	export let cart;
	export let checkboxTitle = 'Remember me in this browser';
	export let isUserLoggedInC2p = false;
	export let isC2PInProgress = false;
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

	$: resendButtonOptions = [
		{
			channel: 'EMAIL',
			testId: 'send-otp-to-email',
			label: 'Email',
			disabled: !otpEmailInfo
		},
		{
			channel: 'SMS',
			testId: 'send-otp-to-phone',
			label: 'Phone',
			disabled: !otpPhoneInfo
		}
	];

	$: otpAlternativeTextDisabled = popupStep === BASE_LOGIN_STEPS.PROCESSING_OTP;

	/**
	 * Determines the OTP reference and device based on network type and available channels
	 * @param {string} network - The card network (visa, mastercard, discover)
	 * @param {string} requestedChannelId - The requested validation channel (EMAIL or SMS)
	 * @param {Object} otpDestination - Object containing emails and phones arrays
	 * @returns {{reference: string, device: string}} - The OTP reference text and device type
	 */
	function getOtpReferenceInfo(network, requestedChannelId, otpDestination) {
		const hasEmail = otpDestination?.emails?.length > 0;
		const hasPhone = otpDestination?.phones?.length > 0;
		const isVisa = network?.toLowerCase() === 'visa';

		// Priority 1: Visa with both email and phone (sent to both simultaneously)
		// Visa sends OTP to both channels at once, so we must show both
		if (isVisa && hasEmail && hasPhone) {
			return {
				reference: `${otpDestination.emails[0]}, ${otpDestination.phones[0]}`,
				device: 'Email and Phone'
			};
		}

		// Priority 2: User requested specific channel (for Mastercard/Discover)
		if (requestedChannelId === 'EMAIL' && hasEmail) {
			return {
				reference: otpDestination.emails[0],
				device: 'Email'
			};
		}

		if (requestedChannelId === 'SMS' && hasPhone) {
			return {
				reference: otpDestination.phones[0],
				device: 'Phone'
			};
		}

		// Priority 3: Fallback to any available channel if the requested one is not available
		if (hasEmail) {
			return {
				reference: otpDestination.emails[0],
				device: 'Email'
			};
		}

		if (hasPhone) {
			return {
				reference: otpDestination.phones[0],
				device: 'Phone'
			};
		}

		// Priority 4: Fallback to generic message
		return {
			reference: '',
			device: 'Phone or Email'
		};
	}

	export async function c2pUnlockStart(email, requestedChannelId) {
		const parentContext = trackUXEvent('c2p_unlock_start', {
			email: email?.replace(/(.{3}).*(@.*)/, '$1***$2')
		});

		isC2PInProgress = true;
		EmailC2P = email;

		try {
			const res = await unlockStart(email, requestedChannelId);

			if (res.status === 200 && res.data.otp_destination) {
				// Store OTP destination data
				c2pOTPDestination = res.data.otp_destination;
				network = res.data.network;

				// Set individual channel info for alternative send options
				otpEmailInfo = c2pOTPDestination?.emails?.[0] || null;
				otpPhoneInfo = c2pOTPDestination?.phones?.[0] || null;

				// Determine OTP reference and device display using helper function
				const otpInfo = getOtpReferenceInfo(network, requestedChannelId, c2pOTPDestination);
				otpReference = otpInfo.reference;
				otpDevice = otpInfo.device;

				// Update UI state
				popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
				showC2pCheckbox = true;
				isModalOpen = true;
			} else if (res.status === 200 && res.data.recognized) {
				dispatch('login-c2p-successful', Object.assign(res.data));
			}
		} catch (error) {
			console.error('C2P unlock start failed:', error);
		} finally {
			isC2PInProgress = false;
		}
	}

	async function C2PValidateOtp(event) {
		const parentContext = trackUXEvent('c2p_validate_otp');

		let res;

		// Set to processing state immediately to show spinner
		popupStep = BASE_LOGIN_STEPS.PROCESSING_OTP;

		res = await unlockComplete(event.detail.otpValue);

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
			if (res.data?.error_code === 'RETRIES_EXCEEDED') {
				isModalOpen = false;
				dispatch('retries-exceeded', {
					message: res.data?.description
				});
			} else {
				otpError = res.data?.description || res.data;
				popupStep = BASE_LOGIN_STEPS.WAITING_OTP;
			}
		}
	}

	export async function processC2PCheckout(selectedCard, additionalData, cvv) {
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
			},
			cardBrand: selectedCard.provider,
			cardArt: selectedCard.art
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
	async function handleOtpSend(channelType) {
		if (!channelType) return;

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

		await c2pUnlockStart(EmailC2P, channelType);
	}

	/**
	 * Handle "Not you?" button click - close modal and focus on address
	 */
	function handleClose() {
		isModalOpen = false;
		dispatch('not-you-clicked');
	}
</script>

<Modal
	bind:isModalOpen
	on:modalClosed={() => {
		trackUXEvent('c2p_modal_dismissed', {
			modalStep: popupStep
		});
	}}
>
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
		otpNetwork={network}
		bind:phone={otpPhoneInfo}
		bind:clickToPayEmail={otpEmailInfo}
		bind:currentStep={popupStep}
		on:otpCompleted={C2PValidateOtp}
		bind:emailError
		bind:otpError
		on:clearError={() => {
			otpError = '';
		}}
	>
		<C2pLogo slot="logo" width={16} height={16} />
		<button
			slot="email-phone-actions"
			type="button"
			class="rounded-full p-3 text-xs font-bold text-gray-500 underline {popupStep ===
			BASE_LOGIN_STEPS.PROCESSING_OTP
				? 'cursor-not-allowed opacity-50'
				: 'cursor-pointer'}"
			on:click={handleClose}
			data-testid="not-you-button"
			disabled={popupStep === BASE_LOGIN_STEPS.PROCESSING_OTP}
		>
			Not you?
		</button>
		<div slot="under-otp" class="flex flex-col justify-start" class:hidden={!showC2pCheckbox}>
			<Checkbox
				disabled={otpAlternativeTextDisabled ||
					popupStep === BASE_LOGIN_STEPS.PROCESSING_OTP}
				title={checkboxTitle}
				subtitle={InfoC2PRememberMeLong}
				bind:isChecked
			/>
		</div>
		<div slot="second-under-otp-slot" class="flex flex-col justify-start">
			<div class="mt-4 flex w-full items-center justify-center">
				<div class="h-px flex-grow bg-gray-300"></div>
				<span class="px-3 text-xs font-medium text-gray-500">{alternativeMethodText}</span>
				<div class="h-px flex-grow bg-gray-300"></div>
			</div>
			<div
				class="text-fy-on-surface mt-2 flex flex-row items-center justify-center text-sm font-bold"
			>
				{#each resendButtonOptions as { channel, testId, label, disabled }, i}
					<button
						type="button"
						data-testid={testId}
						class="w-full p-2 text-blue-500 hover:text-[#1F3F9A] hover:underline hover:underline-offset-4 disabled:cursor-not-allowed disabled:text-gray-500 disabled:no-underline"
						on:click={() => handleOtpSend(channel)}
						disabled={otpAlternativeTextDisabled ||
							disabled ||
							popupStep === BASE_LOGIN_STEPS.PROCESSING_OTP}
					>
						{label}
					</button>
					{#if i === 0}
						<div class="h-10 w-[3px] bg-gray-200"></div>
					{/if}
				{/each}
			</div>
			<div class="mt-2 flex w-full items-center justify-center">
				<div class="h-px flex-grow bg-gray-300"></div>
				<span class="px-3 text-xs font-medium text-gray-500">OR</span>
				<div class="h-px flex-grow bg-gray-300"></div>
			</div>
			<div class="flex justify-center">
				<button
					type="button"
					class="rounded-full p-3 text-xs font-bold text-gray-500 underline {popupStep ===
					BASE_LOGIN_STEPS.PROCESSING_OTP
						? 'cursor-not-allowed opacity-50'
						: 'cursor-pointer'}"
					on:click={handleClose}
					data-testid="not-you-button"
					disabled={popupStep === BASE_LOGIN_STEPS.PROCESSING_OTP}
				>
					Enter card manually
				</button>
			</div>
		</div>
	</BaseLogin>
</Modal>
