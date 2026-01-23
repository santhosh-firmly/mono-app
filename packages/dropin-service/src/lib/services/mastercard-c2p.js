/**
 * Mastercard Click to Pay (C2P) Service - V5 Clean Implementation
 *
 * This service handles Mastercard C2P SDK initialization and operations
 * without relying on global window.firmly object.
 */

/**
 * Initialize Mastercard Click to Pay SDK
 *
 * @param {Object} config - Configuration object
 * @param {string} config.srcDpaId - Mastercard DPA ID
 * @param {string} config.presentationName - Merchant presentation name
 * @param {boolean} config.sandbox - Whether to use sandbox environment
 * @param {string} config.dpaLocale - Locale for DPA
 * @returns {Promise<{status: string, error?: Error}>}
 */
export async function initializeMastercardC2P({
	srcDpaId,
	presentationName = 'Firmly, Inc.',
	sandbox = false,
	dpaLocale = 'en_US'
}) {
	try {
		// Skip if no DPA ID configured
		if (!srcDpaId) {
			console.log('[Mastercard C2P]: No DPA ID configured, skipping initialization');
			return { status: 'skipped', error: 'No DPA ID configured' };
		}

		// Check if already initialized
		if (window.mcCheckoutService) {
			console.log('[Mastercard C2P]: SDK already initialized');
			return { status: 'success' };
		}

		console.log('[Mastercard C2P]: Initializing SDK...', {
			sandbox,
			dpaLocale,
			srcDpaId: srcDpaId.substring(0, 8) + '...'
		});

		// Load Mastercard SDK script
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
			const timeout = setTimeout(() => {
				reject(new Error('Mastercard SDK load timeout'));
			}, 30000); // 30 second timeout

			script.onload = () => {
				clearTimeout(timeout);
				resolve();
			};
			script.onerror = (error) => {
				clearTimeout(timeout);
				reject(
					new Error(`Failed to load Mastercard SDK: ${error.message || 'Network error'}`)
				);
			};

			document.head.appendChild(script);
		});

		// Check if MastercardCheckoutServices is available
		if (!window.MastercardCheckoutServices) {
			throw new Error('MastercardCheckoutServices not available after script load');
		}

		// Initialize Mastercard Checkout Service
		window.mcCheckoutService = new window.MastercardCheckoutServices();

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
			dpaData: {
				dpaName: presentationName,
				applicationType: 'WEB_BROWSER'
			},
			cardBrands: ['mastercard', 'maestro', 'visa', 'amex', 'discover']
		});

		console.log('[Mastercard C2P]: ✅ SDK initialized successfully');
		return { status: 'success' };
	} catch (error) {
		console.warn(
			'[Mastercard C2P]: ⚠️ Initialization failed (checkout will continue without C2P)',
			error.message
		);
		return { status: 'error', error };
	}
}

/**
 * Validate email and start OTP flow
 *
 * @param {string} email - User email to validate
 * @param {string} requestedValidationChannelId - Channel for OTP (EMAIL or SMS)
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function validateEmail(email, requestedValidationChannelId = 'EMAIL') {
	try {
		if (!window.mcCheckoutService) {
			throw new Error('Mastercard SDK not initialized');
		}

		console.log(
			'[Mastercard C2P]: Validating email...',
			email.replace(/(.{3}).*(@.*)/, '$1***$2')
		);

		// Check if consumer is recognized
		const idLookupResult = await window.mcCheckoutService.idLookup({ email });

		console.log('[Mastercard C2P]: idLookup result:', {
			consumerPresent: idLookupResult.consumerPresent,
			fullResult: idLookupResult
		});

		if (!idLookupResult.consumerPresent) {
			console.log('[Mastercard C2P]: Consumer not recognized - returning early');
			return {
				status: 200,
				data: { recognized: false }
			};
		}

		console.log('[Mastercard C2P]: Consumer recognized, initiating validation...');

		// Initiate validation (send OTP)
		const validation = await window.mcCheckoutService.initiateValidation({
			requestedValidationChannelId
		});

		console.log('[Mastercard C2P]: Validation response:', validation);

		const network = validation.network?.toLowerCase();
		let emails = [];
		let phones = [];

		// Parse validation channels based on network type
		if (network === 'visa' && validation.maskedValidationChannel) {
			// Visa: comma-separated string like "khe**@mastercard.com,********0998"
			const channels = validation.maskedValidationChannel.split(',');
			channels.forEach((channel) => {
				const trimmed = channel.trim();
				if (trimmed.includes('@')) {
					emails.push(trimmed);
				} else if (/\d/.test(trimmed)) {
					phones.push(trimmed);
				}
			});
		} else if (validation.supportedValidationChannels?.length) {
			// Mastercard/Discover: array of objects with identityType
			validation.supportedValidationChannels.forEach((channel) => {
				if (channel.identityType === 'EMAIL') {
					emails.push(channel.maskedValidationChannel);
				} else if (channel.identityType === 'SMS') {
					phones.push(channel.maskedValidationChannel);
				}
			});
		}

		console.log('[Mastercard C2P]: OTP sent successfully', {
			network,
			emails: emails.length,
			phones: phones.length
		});

		return {
			status: 200,
			data: {
				network: validation.network,
				otp_destination: {
					emails,
					phones
				}
			}
		};
	} catch (error) {
		console.error('[Mastercard C2P]: Email validation failed', error);
		return {
			status: 500,
			data: { error: error.message }
		};
	}
}

/**
 * Get user-friendly error message based on Mastercard SDK error reason
 * @param {Error} error - Error from Mastercard SDK
 * @returns {string} User-friendly error message
 */
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

/**
 * Get card brand name from payment card descriptor
 * @param {string} descriptor - Payment card descriptor (e.g., "mastercard", "visa")
 * @returns {string} Formatted brand name
 */
function getCardBrand(descriptor) {
	const brandMap = {
		mastercard: 'Mastercard',
		visa: 'Visa',
		amex: 'American Express',
		'american-express': 'American Express',
		discover: 'Discover',
		maestro: 'Maestro',
		diners: 'Diners Club',
		jcb: 'JCB',
		unionpay: 'UnionPay'
	};
	const lower = descriptor?.toLowerCase() || '';
	return brandMap[lower] || descriptor || 'Card';
}

/**
 * Convert Mastercard masked cards to our card format
 * @param {Array} maskedCards - Cards from Mastercard SDK
 * @returns {{status: number, data: Object}}
 */
function fromMaskedCards(maskedCards) {
	return {
		status: 200,
		data: {
			recognized: true,
			payment_method_options: maskedCards.map((card) => {
				const descriptor = card.paymentCardDescriptor?.toLowerCase() || 'mastercard';
				return {
					expired: card.digitalCardData?.status !== 'ACTIVE',
					type: 'CreditCard',
					wallet: 'c2p',
					provider: descriptor,
					brand: getCardBrand(descriptor),
					art: card.digitalCardData?.artUri,
					id: card.srcDigitalCardId,
					last4: card.panLastFour,
					last_four: card.panLastFour,
					first4: card.panBin?.substring(0, 4) || null,
					month: card.panExpirationMonth,
					year: card.panExpirationYear,
					card_type: (card.paymentCardType || 'credit').toUpperCase(),
					billing_info: {
						first_name: null,
						last_name: null,
						address1: card.maskedBillingAddress?.line1,
						address2: card.maskedBillingAddress?.line2,
						city: card.maskedBillingAddress?.city,
						state_or_province: card.maskedBillingAddress?.state,
						postal_code: card.maskedBillingAddress?.zip,
						country:
							card.maskedBillingAddress?.countryCode === 'US'
								? 'United States'
								: card.maskedBillingAddress?.countryCode,
						email: null
					}
				};
			})
		}
	};
}

/**
 * Complete OTP validation
 *
 * @param {string} otpCode - OTP code entered by user
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function verifyOtp(otpCode) {
	if (!window.mcCheckoutService) {
		return {
			status: 400,
			data: {
				description: 'Mastercard SDK not initialized',
				error_code: 'SDK_NOT_INITIALIZED'
			}
		};
	}

	console.log('[Mastercard C2P]: Verifying OTP...');

	try {
		const maskedCards = await window.mcCheckoutService.validate({
			value: otpCode
		});

		console.log('[Mastercard C2P]: OTP verified, cards retrieved:', maskedCards?.length || 0);

		return fromMaskedCards(maskedCards);
	} catch (error) {
		console.error('[Mastercard C2P]: OTP verification failed', error);
		return {
			status: 400,
			data: {
				description: getUnlockErrorMessage(error),
				error_code: error?.reason
			}
		};
	}
}

/**
 * Checkout with selected card
 *
 * @param {Object} params - Checkout parameters
 * @param {string} params.cardId - Card ID to use
 * @param {string} params.cvv - Card CVV (if required)
 * @param {boolean} params.rememberMe - Whether to remember the card
 * @param {Object} params.additionalData - Transaction data
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function checkoutWithCard({ cardId, cvv, rememberMe = false, additionalData }) {
	try {
		if (!window.mcCheckoutService) {
			throw new Error('Mastercard SDK not initialized');
		}

		console.log('[Mastercard C2P]: Checking out with card...');

		const checkoutResult = await window.mcCheckoutService.checkout({
			srcDigitalCardId: cardId,
			...(cvv && { cvv }),
			rememberMe,
			dpaTransactionOptions: {
				paymentOptions: [
					{
						dynamicDataType:
							additionalData?.dynamicDataType ||
							'CARD_APPLICATION_CRYPTOGRAM_LONG_FORM'
					}
				]
			}
		});

		console.log('[Mastercard C2P]: Checkout successful');

		return {
			status: 200,
			data: checkoutResult
		};
	} catch (error) {
		console.error('[Mastercard C2P]: Checkout failed', error);
		return {
			status: 500,
			data: { error: error.message }
		};
	}
}
