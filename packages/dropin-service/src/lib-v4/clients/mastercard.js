import { trackAPIEvent, trackError, trackPerformance } from '../browser/telemetry.js';

function fromMaskedCards(maskedCards) {
	return {
		status: 200,
		data: {
			recognized: true,
			payment_method_options: maskedCards.map((e) => ({
				expired: e.digitalCardData?.status !== 'ACTIVE',
				type: 'CreditCard',
				wallet: 'c2p',
				provider: e.paymentCardDescriptor?.toLowerCase() || 'mastercard',
				art: e.digitalCardData?.artUri,
				id: e.srcDigitalCardId,
				last_four: e.panLastFour,
				month: e.panExpirationMonth,
				year: e.panExpirationYear,
				card_type: (e.paymentCardType || 'credit').toUpperCase(),
				billing_info: {
					first_name: null,
					last_name: null,
					address1: e.maskedBillingAddress?.line1,
					address2: e.maskedBillingAddress?.line2,
					city: e.maskedBillingAddress?.city,
					state_or_province: e.maskedBillingAddress?.state,
					postal_code: e.maskedBillingAddress?.zip,
					country:
						e.maskedBillingAddress?.countryCode === 'US'
							? 'United States'
							: e.maskedBillingAddress?.countryCode,
					email: null
				}
			})),
			shipping_info_options: []
		}
	};
}

export async function startMasterCardUnifiedSolution({
	sandbox = false,
	dpaLocale = 'en_US',
	srcDpaId,
	presentationName = 'Firmly, Inc.'
} = {}) {
	return await trackPerformance(
		async () => {
			const baseUrl = sandbox
				? 'https://sandbox.src.mastercard.com/srci/integration/2/lib.js'
				: 'https://src.mastercard.com/srci/integration/2/lib.js';

			const queryParams = new URLSearchParams({
				srcDpaId,
				locale: dpaLocale
			}).toString();

			const scriptSrc = `${baseUrl}?${queryParams}`;

			const script = document.createElement('script');
			script.src = scriptSrc;

			await new Promise((resolve, reject) => {
				script.onload = resolve;
				script.onerror = (e) =>
					reject(new Error(`[Mastercard Unified]: failed to load ${scriptSrc}`));
				document.head.appendChild(script);
			});

			window.mcCheckoutService = new MastercardCheckoutServices();
			window.firmly.changeC2PProvider();

			await window.mcCheckoutService.init({
				srcDpaId,
				dpaTransactionOptions: {
					dpaLocale,
					dpaBillingPreference: 'FULL',
					consumerNameRequested: true,
					consumerEmailAddressRequested: true,
					consumerPhoneNumberRequested: true,
					confirmPayment: false,
					paymentOptions: [{ dynamicDataType: 'NONE' }]
				},
				checkoutExperience: 'PAYMENT_SETTINGS',
				dpaData: { dpaName: presentationName, applicationType: 'WEB_BROWSER' },
				cardBrands: ['mastercard', 'maestro', 'visa', 'amex', 'discover']
			});

			return { status: 'success' };
		},
		'mastercard_unified_init',
		{ sandbox, dpaLocale, srcDpaId },
		trackAPIEvent
	);
}

export async function isRecognized() {
	return await trackPerformance(
		async () => {
			const maskedCards = await window.mcCheckoutService.getCards();

			if (!maskedCards.length) {
				return null;
			}

			return fromMaskedCards(maskedCards);
		},
		'mastercard_unified_is_recognized',
		undefined,
		trackAPIEvent
	);
}

export async function unlockStart(email, requestedValidationChannelId = 'EMAIL') {
	requestedValidationChannelId = requestedValidationChannelId?.toUpperCase();

	return await trackPerformance(
		async () => {
			const recognizedData = await isRecognized();

			if (recognizedData) {
				console.warn('[Mastercard Unified]: Recognized cards found, no need to unlock.');
				return recognizedData;
			}

			const { consumerPresent } = await window.mcCheckoutService.idLookup({ email });

			if (!consumerPresent) {
				console.warn(
					'[Mastercard Unified]: No consumer present for the provided email. Please ensure the email is registered with Mastercard.'
				);
				return;
			}

			const validation = await window.mcCheckoutService.initiateValidation({
				requestedValidationChannelId
			});

			let emails = [];
			let phones = [];

			if (validation.supportedValidationChannels?.length) {
				for (const channel of validation.supportedValidationChannels) {
					if (channel.identityType === 'EMAIL') {
						emails.push(channel.maskedValidationChannel);
					}
					if (channel.identityType === 'SMS') {
						phones.push(channel.maskedValidationChannel);
					}
				}
			} else {
				const [emailAddr, phone] = email.split(',');
				emails.push(emailAddr);
				phones.push(phone);
			}

			emails = emails.filter((email) => email);
			phones = phones.filter((phone) => phone);

			console.warn(
				`[Mastercard Unified]: OTP channels available: ${emails.length} emails, ${phones.length} phones.`
			);

			return {
				status: 200,
				data: {
					otp_destination: {
						emails,
						phones
					}
				}
			};
		},
		'mastercard_unified_unlock_start',
		{},
		trackAPIEvent
	);
}

function getUnlockErrorMessage(error) {
	const errorStatus = error?.reason;

	switch (errorStatus) {
		case 'CODE_INVALID':
			return "That's not the right code. Confirm and try again.";
		case 'CODE_EXPIRED':
			return 'The code has expired. Please request a new one.';
		case 'ACCT_INACCESSIBLE':
			return 'The account exists but is not currently accessible due to multiple incorrect OTP attempts.';
		case 'RETRIES_EXCEEDED':
			return 'You have exceeded the maximum number of attempts for Click to Pay, you can continue with guest checkout.';
		default:
			return error?.message || 'OTP validation failed';
	}
}

export async function unlockComplete(otpCode) {
	return await trackPerformance(
		async () => {
			try {
				const maskedCards = await window.mcCheckoutService.validate({
					value: otpCode
				});

				return fromMaskedCards(maskedCards);
			} catch (error) {
				return {
					status: 400,
					data: {
						description: getUnlockErrorMessage(error),
						error_code: error?.reason
					}
				};
			}
		},
		'mastercard_unified_unlock_complete',
		{ hasOtp: !!otpCode },
		trackAPIEvent
	);
}

let previuslyWithCardResponse = null;

export async function checkoutWithCard({
	cardId,
	windowRef = window,
	rememberMe = false,
	cvv,
	additionalData = {}
} = {}) {
	return await trackPerformance(
		async () => {
			let iframe;

			try {
				let withCardResponse = previuslyWithCardResponse;

				if (!cvv || !withCardResponse) {
					iframe = document.createElement('iframe');
					iframe.style.position = 'fixed';
					iframe.style.top = '0';
					iframe.style.left = '0';
					iframe.style.width = '100vw';
					iframe.style.height = '100vh';
					iframe.style.border = 'none';
					iframe.style.zIndex = '2147483647';
					iframe.allow = 'payment *; clipboard-write;';

					document.body.appendChild(iframe);

					withCardResponse = await window.mcCheckoutService.checkoutWithCard({
						srcDigitalCardId: cardId,
						windowRef: iframe.contentWindow,
						rememberMe
					});

					// Optionally, remove the iframe after checkout completes
					document.body.removeChild(iframe);
				}

				const mastercardPayload = {
					...additionalData,
					flowId: withCardResponse.headers['x-src-cx-flow-id'],
					merchantTransactionId: withCardResponse.headers['merchant-transaction-id'],
					correlationId: withCardResponse.checkoutResponseData.srcCorrelationId
				};

				// Prepare wallet data for complete-order
				const walletData = {
					wallet: 'mastercard-unified',
					credit_card_id: String(cardId),
					jws: withCardResponse.checkoutResponse,
					additional_data: mastercardPayload
				};

				// If CVV is provided (after cvv_required), encrypt and include it
				if (cvv) {
					try {
						walletData.verification_value = await window.firmly.paymentRsaEncrypt(cvv);
					} catch (e) {
						// proceed without CVV if encryption fails; backend will request again if necessary
					}
				}

				const domain = window.firmly.domain;
				const walletResponse = await window.firmly.completeWalletOrder(domain, walletData);

				if (walletResponse.data?.cvv_required) {
					previuslyWithCardResponse = withCardResponse;

					return {
						status: 200,
						data: walletResponse.data
					};
				}

				return {
					status: walletResponse.data.code,
					data: walletResponse.data
				};
			} catch (error) {
				trackError('mastercard_unified_checkout_error', error);
				document.body.removeChild(iframe);
				return {
					status: 400,
					data: {
						description:
							error?.message ||
							'Checkout with Click to pay failed, please try again or use a different payment method',
						error_code: error?.reason || 'CHECKOUT_ERROR'
					}
				};
			}
		},
		'mastercard_unified_checkout',
		{
			rememberMe,
			hasCvv: !!cvv,
			hasAdditionalData: Object.keys(additionalData).length > 0
		}
	);
}

/**
 * Signs out the user from Click to Pay service, disassociating their device from their profile.
 * Triggered when a user clicks "Not your cards?" on the card list.
 *
 * @param {Object} [options] - Sign out options
 * @param {string} [options.recognitionToken] - JWT recognition token (if previously stored)
 * @returns {Promise<Object>} Response with standard status and data fields
 */
export async function signOut({ recognitionToken } = {}) {
	return await trackPerformance(
		async () => {
			try {
				const response = await window.mcCheckoutService.signOut({ recognitionToken });

				if (!response.recognized) {
					return {
						status: 200,
						data: {
							recognized: false,
							payment_method_options: []
						}
					};
				} else {
					return fromMaskedCards(response.cards || []);
				}
			} catch (error) {
				trackError('mastercard_unified_signout_error', error);

				// Define specific error responses based on the error reason
				let errorDescription = 'Failed to sign out from Click to Pay';
				let errorStatus = 400;

				if (error?.reason === 'REQUEST_TIMEOUT') {
					errorDescription = 'Sign out request timed out. Please try again.';
				} else if (error?.reason === 'UNKNOWN_ERROR') {
					errorDescription = 'An unexpected error occurred during sign out.';
				} else if (error?.message) {
					errorDescription = error.message;
				}

				return {
					status: errorStatus,
					data: {
						description: errorDescription,
						error_code: error?.reason || 'SIGNOUT_ERROR',
						recognized: true
					}
				};
			}
		},
		'mastercard_unified_signout',
		{ hasRecognitionToken: !!recognitionToken },
		trackAPIEvent
	);
}
