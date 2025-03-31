<script context="module">
	// @ts-nocheck
	import { PUBLIC_uc2p_sdk_url } from '$lib-v4/env.js';

	// Generate a unique transaction ID for this instance of the SDK
	const uniqueTransactionId = crypto.randomUUID();
	const skdUrl = PUBLIC_uc2p_sdk_url;
	let Vsb;

	const dpaTransactionOptions = {
		dpaLocale: 'en_US',
		dpaAcceptedBillingCountries: ['US', 'CA'],
		dpaAcceptedShippingCountries: ['US', 'CA'],
		dpaBillingPreference: 'FULL',
		dpaShippingPreference: 'FULL',
		consumerNameRequested: true,
		consumerEmailAddressRequested: true,
		consumerPhoneNumberRequested: true,
		paymentOptions: [
			{
				dpaDynamicDataTtlMinutes: 2,
				dynamicDataType: 'DYNAMIC_CARD_SECURITY_CODE',
				dpaPanRequested: false
			}
		],
		reviewAction: 'continue',
		transactionType: 'PURCHASE',
		payloadTypeIndicator: 'FULL',
		threeDsPreference: 'NONE',
		threeDsInputData: {
			requestorId: 'requestorId',
			acquirerId: 'acquirerId',
			acquirerMid: 'acquirerMid'
		}
	};

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
			if (window.VSDK) {
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
			window.firmly.telemetryVisaApiPerformance?.(
				durationMs,
				apiName,
				response,
				uniqueTransactionId,
				additionalData
			);
		}
	}

	function sendVisaErrorToTelemetry(response) {
		window.firmly?.telemetryVisaErrors?.(response);
	}

	const onSDKLoaded = async () => {
		if (Vsb) {
			return;
		}

		// If this function is called too fast, there is a chance
		// Visa SDK is not fully loaded yet.
		// Wait for the script to be loaded.
		await waitScriptLoaded();

		Vsb = window.VSDK;

		await performanceObserver(() => Vsb.initialize({ dpaTransactionOptions }), 'initialize');
	};

	export async function initiateIdentityValidation() {
		const { maskedValidationChannel } = await performanceObserver(
			() => Vsb.initiateIdentityValidation(),
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

	export async function isRecognized(email, validationData) {
		if (!Vsb) {
			await onSDKLoaded();
		}

		const getCardsPayload = {
			consumerIdentity: {
				identityProvider: 'SRC',
				identityValue: email,
				identityType: 'EMAIL_ADDRESS'
			}
		};

		if (validationData) {
			getCardsPayload.validationData = validationData;
		}

		// TODO: How to know that the recognized one matches the input email?

		const response = await performanceObserver(() => Vsb.getCards(getCardsPayload), 'getCards');
		const { actionCode, profiles } = response;

		if (actionCode === 'SUCCESS') {
			const { maskedCards } = profiles[0];
			const { maskedConsumer } = profiles[1];

			return {
				status: 200,
				data: {
					recognized: true,
					shipping_info_options: [],
					payment_method_options: maskedCards.map((e) => ({
						expired: e.cardError === 'card_expired',
						type: 'CreditCard',
						wallet: 'c2p',
						provider: e.paymentCardDescriptor ?? 'visa', // HOW DO WE GET THIS?,
						art: e.digitalCardData.artUri,
						id: e.srcDigitalCardId,
						last_four: e.panLastFour,
						month: e.panExpirationMonth,
						year: e.panExpirationYear,
						card_type: e.paymentCardDescriptor ?? 'VISA', // HOW DO WE GET THIS? SHOULDN'T BE CREDIT OR DEBIT?,
						billing_info: {
							address1: e.maskedBillingAddress.line1,
							address2: e.maskedBillingAddress.line2,
							city: e.maskedBillingAddress.city,
							state_or_province: e.maskedBillingAddress.state,
							postal_code: e.maskedBillingAddress.zip,
							country:
								e.maskedBillingAddress.countryCode === 'US'
									? 'United States'
									: e.maskedBillingAddress.countryCode,
							email: maskedConsumer.maskedEmailAddress
						}
					}))
				}
			};
		} else if (actionCode === 'PENDING_CONSUMER_IDV') {
			const { maskedValidationChannel } = response;
			const [m, p] = maskedValidationChannel.split(',');
			return {
				status: 200,
				data: {
					otp_destination: {
						emails: [m],
						phones: [p]
					}
				}
			};
		}
	}

	export async function unlockStart(email, validationData) {
		if (!Vsb) {
			await onSDKLoaded();
		}

		try {
			const isRecognizedResponse = await isRecognized(email, validationData);
			if (isRecognizedResponse) {
				return isRecognizedResponse;
			}

			const res = await performanceObserver(
				() => initiateIdentityValidation(email),
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

	async function visaCheckout(cardId, rememberMe, additionalData) {
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
				Vsb.checkout({
					...dpaTransactionOptions,
					...(rememberMe ? rememberMeOptions : {}),
					...(additionalData?.verificationData ? { assuranceData: additionalData } : {}),
					srcDigitalCardId: cardId
				}),
			'checkout'
		);

		return resp;
	}

	let jwsCache = {};
	export async function getVisaCardToken(cardId, cvv, rememberMe, additionalData) {
		try {
			let visaCheckoutResponse;
			let jws;
			if (cvv) {
				jws = jwsCache[cardId];
			} else {
				visaCheckoutResponse = await visaCheckout(cardId, rememberMe, additionalData);

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

			const res = await performanceObserver(
				() => window.firmly.paymentC2PTokenize(cardId, cvv, null, jws),
				'paymentC2PTokenize'
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
</script>

<svelte:head>
	<script src={skdUrl} on:load={onSDKLoaded} async></script>
</svelte:head>
