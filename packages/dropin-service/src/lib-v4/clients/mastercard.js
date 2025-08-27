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
						description: error?.message || error?.reason || 'OTP validation failed'
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
			let withCardResponse = previuslyWithCardResponse;

			if (!cvv || !withCardResponse) {
				const iframe = document.createElement('iframe');
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

			const walletResponse = await window.firmly.paymentC2PTokenize(
				cardId,
				cvv,
				null,
				withCardResponse.checkoutResponse,
				mastercardPayload
			);

			if (walletResponse.data?.cvv_required) {
				previuslyWithCardResponse = withCardResponse;

				return {
					status: 200,
					data: walletResponse.data
				};
			}

			return {
				status: 200,
				data: walletResponse.data
			};
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
 * Signs out the user from Click to Pay service.
 * This method disassociates a recognized Consumer Application/Device from the Consumer's Profile.
 * Used when a user clicks "Not your cards?" on the card list.
 *
 * @param {Object} options - The options for signing out.
 * @param {string} [options.recognitionToken] - Optional JWT containing the recognition token previously stored.
 * @returns {Promise<Object>} An object with 'recognized' status and potentially a list of cards if logout was unsuccessful.
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
				return {
					status: 400,
					data: {
						description:
							error?.message ||
							error?.reason ||
							'Failed to sign out from Click to Pay',
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
