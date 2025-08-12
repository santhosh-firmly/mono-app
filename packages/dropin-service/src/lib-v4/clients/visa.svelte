<script module>
	// @ts-nocheck
	import { trackAPIEvent, trackError } from '$lib-v4/browser/telemetry.js';

	/**
	 * Helper function to wait for another promise resolution
	 * @param ms wait time
	 */
	async function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	}

	/**
	 * Function to wait until Visa SDK is loaded asynchronously
	 */
	async function waitScriptLoaded() {
		// Arbitrary time to wait for Visa to load
		const waitTime = 30000;
		const waitUntil = Date.now() + waitTime;
		while (Date.now() < waitUntil) {
			if (window.vAdapters.VisaSRCI) {
				return;
			}
			await sleep(100);
		}

		throw new Error('Unable to load Visa script');
	}

	async function performanceObserver(func, apiName, additionalData) {
		const startTime = Date.now();
		let response;
		try {
			response = await func();
			return response;
		} finally {
			const endTime = Date.now();
			const durationMs = endTime - startTime;
			trackAPIEvent(apiName || 'visa sdk', {
				duration_ms: durationMs,
				status: response?.status,
				transaction_id: window.visaUniqueTransactionId,
				...(additionalData ? { additionalData } : {})
			});
		}
	}

	function sendVisaErrorToTelemetry(response) {
		trackError(new Error('error-c2p'), {
			status: response?.status,
			code: response?.code,
			description: response?.description,
			error: response?.error
		});
	}

	export async function visaUnlockStart(email, vSrc) {
		const { consumerPresent } = await performanceObserver(
			() =>
				vSrc.identityLookup({
					identityValue: email,
					type: 'EMAIL'
				}),
			'identityLookup'
		);

		if (consumerPresent) {
			const { maskedValidationChannel } = await performanceObserver(
				() => vSrc.initiateIdentityValidation(),
				'initiateIdentityValidation'
			);
			const [m, p] = maskedValidationChannel.split(',');
			return {
				otp_destination: {
					emails: [m],
					phones: [p]
				}
			};
		}
	}

	export async function isRecognized(vSrc, email) {
		const { recognized } = await performanceObserver(() => vSrc.isRecognized(), 'isRecognized');
		if (recognized) {
			const { profiles } = await performanceObserver(
				() => vSrc.getSrcProfile(),
				'getSrcProfile'
			);
			const { maskedConsumer, maskedCards } = profiles[0];
			return {
				status: 200,
				data: {
					recognized: true,
					payment_method_options: maskedCards.map((e) => ({
						expired: e.cardError === 'card_expired',
						type: 'CreditCard',
						wallet: 'c2p',
						provider: 'visa',
						art: e.digitalCardData.artUri,
						id: e.srcDigitalCardId,
						last_four: e.panLastFour,
						month: e.panExpirationMonth,
						year: e.panExpirationYear,
						card_type: 'VISA', // TODO: For now we will use only visa. Later, let's check with them how to get the card brand
						billing_info: {
							first_name: maskedConsumer.firstName,
							last_name: maskedConsumer.lastName,
							address1: e.maskedBillingAddress.line1,
							address2: e.maskedBillingAddress.line2,
							city: e.maskedBillingAddress.city,
							state_or_province: e.maskedBillingAddress.state,
							postal_code: e.maskedBillingAddress.zip,
							country:
								e.maskedBillingAddress.countryCode === 'US'
									? 'United States'
									: e.maskedBillingAddress.countryCode,
							email: maskedConsumer.emailAddress
						}
					})),
					shipping_info_options: []
				}
			};
		}
		return null;
	}

	export async function unlockStart(email, vSrc) {
		if (!email || !vSrc) {
			throw new Error('Email and vSrc are required parameters');
		}

		try {
			const isRecognizedResponse = await isRecognized(vSrc, email);
			if (isRecognizedResponse) {
				return isRecognizedResponse;
			}

			const res = await performanceObserver(
				() => visaUnlockStart(email, vSrc),
				'visaUnlockStart'
			);
			if (res) {
				return {
					status: 200,
					data: res
				};
			} else {
				throw new Error('User not found in C2P database');
			}
		} catch (e) {
			const error = {
				status: 409,
				data: {
					error: 'PaymentMethodNotAvailable',
					code: 409,
					description: e.toString()
				}
			};
			sendVisaErrorToTelemetry(error);
			return error;
		}
	}

	export async function visaUnlockComplete(otpValue, vSrc) {
		const resp = await performanceObserver(
			() =>
				vSrc.completeIdentityValidation({
					validationData: otpValue
				}),
			'completeIdentityValidation'
		);
		const { profiles } = await performanceObserver(
			() => vSrc.getSrcProfile(resp),
			'getSrcProfile'
		);
		const { maskedConsumer, maskedCards } = profiles[0];

		return {
			payment_method_options: maskedCards.map((e) => ({
				expired: e.cardError === 'card_expired',
				type: 'CreditCard',
				wallet: 'c2p',
				provider: 'visa',
				art: e.digitalCardData.artUri,
				id: e.srcDigitalCardId,
				last_four: e.panLastFour,
				month: e.panExpirationMonth,
				year: e.panExpirationYear,
				card_type: 'VISA', // TODO: For now we will use only visa. Later, let's check with them how to get the card brand
				billing_info: {
					first_name: maskedConsumer.firstName,
					last_name: maskedConsumer.lastName,
					address1: e.maskedBillingAddress.line1,
					address2: e.maskedBillingAddress.line2,
					city: e.maskedBillingAddress.city,
					state_or_province: e.maskedBillingAddress.state,
					postal_code: e.maskedBillingAddress.zip,
					country:
						e.maskedBillingAddress.countryCode === 'US'
							? 'United States'
							: e.maskedBillingAddress.countryCode,
					email: maskedConsumer.emailAddress
				}
			})),
			shipping_info_options: []
		};
	}

	function getOTPValidationError(e) {
		let error;
		if (e?.error?.reason === 'CODE_INVALID' || e?.error?.reason === 'VAL_DATA_INVALID') {
			error = {
				error: 'InvalidOtp',
				code: 401,
				description: 'The OTP is invalid.'
			};
		} else if (e?.error?.reason === 'CODE_EXPIRED') {
			// TODO: Automatically reissue the OTP.
			error = {
				error: 'InvalidOtp',
				code: 401,
				description: 'The OTP is expired.'
			};
		} else if (e?.error?.reason === 'RETRIES_EXCEEDED') {
			// TODO: Move the screen as if the customer is not found in C2P.
			error = {
				error: 'TooManyRetries',
				code: 429,
				description: 'Too many retries.'
			};
		} else if (e?.error?.reason === 'ACCT_INACCESSIBLE') {
			// TODO: Move the screen as if the customer is not found in C2P.
			error = {
				error: 'NotAccessible',
				code: 403,
				description: 'Your account is locked.'
			};
		} else if (e?.error?.reason === 'AUTHENTICATE_FAILURE') {
			// TODO: Move the screen as if the customer is not found in C2P.
			error = {
				error: 'InvalidStepUp',
				code: 400,
				description: 'Invalid Step Up Identifier'
			};
		} else {
			error = {
				error: 'UnexpectedError',
				code: 500,
				description: `Unexpected error: ${e?.error?.message || e?.error?.reason}`
			};
		}

		sendVisaErrorToTelemetry(error);
		return error;
	}

	export async function unlockComplete(otpValue, vSrc) {
		try {
			const res = await performanceObserver(
				() => visaUnlockComplete(otpValue, vSrc),
				'visaUnlockComplete'
			);
			return {
				status: 200,
				data: res
			};
		} catch (e) {
			console.error('Error validating OTP', e);
			const error = getOTPValidationError(e);
			return {
				status: error.code,
				data: error
			};
		}
	}

	async function visaCheckout(cardId, rememberMe, additionalData, vSrc, initOptions) {
		const rememberMeOptions = {
			complianceSettings: {
				complianceResources: [
					{
						complianceType: 'TERMS_AND_CONDITIONS',
						uri: 'usa.visa.com/legal/checkout/terms-of-service.html'
					},
					{
						complianceType: 'PRIVACY_POLICY',
						uri: 'usa.visa.com/legal/global-privacy-notice.html'
					},
					{
						complianceType: 'REMEMBER_ME',
						uri: 'visa.checkout.com/privacy'
					}
				]
			}
		};

		const resp = await performanceObserver(
			() =>
				vSrc.checkout({
					...initOptions,
					...(rememberMe ? rememberMeOptions : {}),
					...(additionalData?.verificationData ? { assuranceData: additionalData } : {}),
					srcDigitalCardId: cardId
				}),
			'checkout'
		);

		return resp;
	}

	// This is kept at module level because it needs to persist across component instances
	let jwsCache = {};

	export async function getVisaCardToken(
		cardId,
		cvv,
		rememberMe,
		additionalData,
		vSrc,
		initOptions
	) {
		try {
			let visaCheckoutResponse;
			let jws;
			if (cvv) {
				jws = jwsCache[cardId];
			} else {
				visaCheckoutResponse = await visaCheckout(
					cardId,
					rememberMe,
					additionalData,
					vSrc,
					initOptions
				);
				jws = visaCheckoutResponse.checkoutResponse;
				if (!jws) {
					// Customer cancelled the flow on Visa pop-up
					return;
				}

				if (visaCheckoutResponse.dcfActionCode === 'PENDING_AUTHENTICATION') {
					const [, payload] = jws.split('.');
					const payloadObj = JSON.parse(atob(payload));

					if (payloadObj.maskedCard.digitalCardData.status === 'PENDING') {
						jwsCache[cardId] = jws;
						return {
							status: 200,
							data: payloadObj.maskedCard
						};
					}
				}
			}

			// Prepare wallet data for complete-order
			const walletData = {
				wallet: 'visa',
				credit_card_id: String(cardId),
				access_token: sessionStorage.getItem('FWC2P')
			};
			
			if (cvv) {
				walletData.verification_value = await window.firmly.paymentRsaEncrypt(cvv);
			}
			
			if (jws) {
				walletData.jws = jws;
			}
			
			const domain = window.firmly.domain;
			const res = await performanceObserver(
				() => window.firmly.completeWalletOrder(domain, walletData),
				'completeWalletOrder'
			);
			if (res.status == 200) {
				if (res.data.cvv_required) {
					// Cache the JWS to perform the request again once the CVV is typed.
					jwsCache[cardId] = jws;
				} else {
					delete jwsCache[cardId];
				}
			}

			return res;
		} catch (e) {
			console.error('Error on C2P checkout', e);
			const error = {
				status: 409,
				data: {
					error: 'PaymentMethodNotAvailable',
					code: 409,
					description: e.error?.reason?.toString()
				}
			};
			sendVisaErrorToTelemetry(error);
			return error;
		}
	}

	export async function visaAuthenticate(authenticationMethod, vSrc) {
		try {
			const response = await performanceObserver(
				() =>
					vSrc.authenticate({
						authenticationMethod: authenticationMethod
					}),
				'authenticate',
				{
					authenticationMethodType: authenticationMethod.authenticationMethodType,
					hasOtp: !!authenticationMethod.methodAttributes?.otpValue
				}
			);

			return {
				status: 200,
				data: response
			};
		} catch (e) {
			console.error('Error validating OTP', e);
			const error = getOTPValidationError(e);
			return {
				status: error.code,
				data: error
			};
		}
	}
</script>

<script>
	import { onMount } from 'svelte';

	// Declare props with runes
	let { PUBLIC_c2p_sdk_url, PUBLIC_c2p_dpa_id, PUBLIC_c2p_initiator_id } = $props();

	let isScriptLoaded = $state(false);
	let vSrc = $state(null);
	let uniqueTransactionId;
	let initOptions;

	// Svelte action to load the SDK script
	function loadVisaScript(node) {
		// Only proceed if we have the SDK URL
		if (!PUBLIC_c2p_sdk_url) {
			console.error('Visa SDK URL is undefined');
			return;
		}

		// Generate a unique transaction ID at component level
		uniqueTransactionId = crypto.randomUUID();
		// Store it globally so performanceObserver can access it
		window.visaUniqueTransactionId = uniqueTransactionId;

		// Initialize options using props
		initOptions = {
			srciTransactionId: uniqueTransactionId,
			srciDpaId: PUBLIC_c2p_dpa_id,
			srcInitiatorId: PUBLIC_c2p_initiator_id,
			dpaTransactionOptions: {
				dpaLocale: 'US',
				dpaAcceptedBillingCountries: ['US', 'CA'],
				dpaAcceptedShippingCountries: ['US', 'CA'],
				dpaBillingPreference: 'FULL',
				dpaShippingPreference: 'FULL',
				consumerNameRequested: true,
				consumerEmailAddressRequested: true,
				consumerPhoneNumberRequested: true,
				paymentOptions: {
					dpaDynamicDataTtlMinutes: 2,
					dynamicDataType: 'DYNAMIC_CARD_SECURITY_CODE',
					dpaPanRequested: false
				},
				reviewAction: 'continue',
				transactionType: 'PURCHASE',
				payloadTypeIndicator: 'FULL',
				threeDsPreference: 'NONE',
				threeDsInputData: {
					requestorId: 'requestorId',
					acquirerId: 'acquirerId',
					acquirerMid: 'acquirerMid'
				},
				customInputData: {
					checkoutOrchestrator: 'merchant'
				}
			}
		};

		// Create and append the script element
		const script = document.createElement('script');
		script.src = PUBLIC_c2p_sdk_url;
		script.async = true;
		script.onload = onSDKLoaded;
		document.head.appendChild(script);
	}

	// Script load handler that initializes the SDK
	async function onSDKLoaded() {
		if (isScriptLoaded) {
			return;
		}

		try {
			await waitScriptLoaded();

			const vSrcAdapter = window.vAdapters.VisaSRCI;
			vSrc = new vSrcAdapter();
			await performanceObserver(() => vSrc.init(initOptions), 'init');

			isScriptLoaded = true;

			// Expose methods for the parent component to call
			window.firmly = window.firmly || {};
			window.firmly.visa = {
				unlockStart: (email) => unlockStart(email, vSrc),
				unlockComplete: (otpValue) => unlockComplete(otpValue, vSrc),
				isRecognized: (email) => isRecognized(vSrc, email),
				getVisaCardToken: (cardId, cvv, rememberMe, additionalData) =>
					getVisaCardToken(cardId, cvv, rememberMe, additionalData, vSrc, initOptions),
				visaAuthenticate: (authenticationMethod) =>
					visaAuthenticate(authenticationMethod, vSrc)
			};
		} catch (error) {
			console.error('Failed to initialize Visa SDK:', error);
		}
	}
</script>

<!-- Empty div with the action to load the Visa SDK -->
<!-- In Svelte, the use: directive is a way to apply a Svelte action to a DOM element. -->
<div use:loadVisaScript style="display: none;"></div>
