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
}

export async function isRecognized() {
	const maskedCards = await window.mcCheckoutService.getCards();

	if (!maskedCards.length) {
		return null;
	}

	return fromMaskedCards(maskedCards);
}

export async function unlockStart(email) {
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
		requestedValidationChannelId: 'EMAIL'
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
		const [email, phone] = email.split(',');
		emails.push(email);
		phones.push(phone);
	}

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
}

export async function unlockComplete(otpCode) {
	const maskedCards = await window.mcCheckoutService.validate({
		value: otpCode
	});

	return fromMaskedCards(maskedCards);
}

let previuslyWithCardResponse = null;

export async function checkoutWithCard({
	cardId,
	windowRef = window,
	rememberMe = false,
	cvv,
	additionalData = {}
} = {}) {
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

	// Prepare wallet data for complete-order
	const walletData = {
		wallet: 'mastercard',
		credit_card_id: String(cardId),
		access_token: sessionStorage.getItem('FWC2P'),
		...mastercardPayload
	};
	
	if (cvv) {
		walletData.verification_value = await window.firmly.paymentRsaEncrypt(cvv);
	}
	
	if (withCardResponse.checkoutResponse) {
		walletData.jws = withCardResponse.checkoutResponse;
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
		status: 200,
		data: walletResponse.data
	};
}
