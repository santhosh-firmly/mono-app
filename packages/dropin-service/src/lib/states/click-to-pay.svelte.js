import { getCheckout } from './checkout/index.svelte.js';
import { initializeMastercardC2P, validateEmail, verifyOtp } from '$lib/services/mastercard-c2p.js';

const OTP_RESEND_COOLDOWN_MS = 30000;

/**
 * @typedef {Object} OtpDestination
 * @property {Array<string>} emails - Available email destinations for OTP
 * @property {Array<string>} phones - Available phone destinations for OTP
 */

/**
 * @typedef {Object} C2PCard
 * @property {string} id - Card identifier
 * @property {string} brand - Card brand
 * @property {string} last4 - Last 4 digits
 * @property {string} expiry - Card expiration date
 */

/**
 * Click to Pay state managing Mastercard C2P authentication flow,
 * OTP verification, and card retrieval after successful login.
 */
class ClickToPay {
	initialized = $state(false);
	otpDestination = $state(null);
	network = $state('');
	showModal = $state(false);
	cards = $state([]);
	userLoggedIn = $state(false);
	error = $state('');

	isValidatingEmail = $state(false);
	isVerifyingOtp = $state(false);
	userEmail = $state('');
	lastOtpRequestTime = $state(0);

	canResendOtp = $derived(Date.now() - this.lastOtpRequestTime >= OTP_RESEND_COOLDOWN_MS);
	hasEmailOption = $derived(this.otpDestination?.emails?.length > 0);
	hasPhoneOption = $derived(this.otpDestination?.phones?.length > 0);

	async initialize(data) {
		try {
			const result = await initializeMastercardC2P({
				srcDpaId: data.PUBLIC_unified_c2p_dpa_id,
				presentationName: data.PUBLIC_unified_c2p_dpa_presentation_name,
				sandbox: data.PUBLIC_unified_c2p_sandbox,
				dpaLocale: 'en_US'
			});
			this.initialized = result.status === 'success';
		} catch {
			this.initialized = false;
		}
	}

	async validateEmail(email, channel = 'EMAIL') {
		if (!email || this.isValidatingEmail) return false;
		if (this.lastOtpRequestTime > 0 && !this.canResendOtp) return false;
		this.userEmail = email;

		return this.#withLoading(
			(v) => (this.isValidatingEmail = v),
			'Email validation failed',
			async () => {
				const result = await validateEmail(email, channel);

				if (result?.status === 200 && result.data?.otp_destination) {
					const { otp_destination, network } = result.data;

					if (otp_destination.emails?.length > 0 || otp_destination.phones?.length > 0) {
						this.otpDestination = otp_destination;
						this.network = network;
						this.showModal = true;
						this.lastOtpRequestTime = Date.now();
						return true;
					}
				}
				return false;
			}
		);
	}

	async verifyOtp(code) {
		if (!code) return false;

		return this.#withLoading(
			(v) => (this.isVerifyingOtp = v),
			'Verification failed',
			async () => {
				const result = await verifyOtp(code);

				if (result?.status === 200 && result.data?.payment_method_options) {
					this.userLoggedIn = true;
					this.cards = result.data.payment_method_options;
					this.showModal = false;
					getCheckout().addC2PCards(result.data.payment_method_options);
					return true;
				}

				this.error = result.data?.description || 'Invalid code';
				return false;
			}
		);
	}

	async resendOtp(channel = 'EMAIL') {
		if (!this.userEmail) return false;
		return this.validateEmail(this.userEmail, channel);
	}

	closeModal() {
		this.showModal = false;
	}

	reset() {
		this.otpDestination = null;
		this.network = '';
		this.showModal = false;
		this.cards = [];
		this.userLoggedIn = false;
		this.error = '';
		this.isValidatingEmail = false;
		this.isVerifyingOtp = false;
		this.userEmail = '';
		this.lastOtpRequestTime = 0;
	}

	async #withLoading(setLoading, errorMessage, operation) {
		setLoading(true);
		this.error = '';
		try {
			return await operation();
		} catch {
			this.error = errorMessage;
			return false;
		} finally {
			setLoading(false);
		}
	}
}

let instance = null;

export function initializeClickToPay() {
	instance = new ClickToPay();
	return instance;
}

export function getClickToPay() {
	if (!instance) throw new Error('ClickToPay not initialized');
	return instance;
}

export function resetClickToPay() {
	instance = null;
}
