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
	sandbox = true,
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

	await window.mcCheckoutService.init({
		srcDpaId,
		dpaTransactionOptions: {
			dpaLocale,
			dpaBillingPreference: 'FULL',
			consumerNameRequested: true,
			consumerEmailAddressRequested: true,
			consumerPhoneNumberRequested: true
		},
		dpaData: { dpaName: presentationName },
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
	const { consumerPresent } = await window.mcCheckoutService.idLookup({ email });

	if (!consumerPresent) {
		console.warn(
			'[Mastercard Unified]: No consumer present for the provided email. Please ensure the email is registered with Mastercard.'
		);
		return;
	}

	const validation = await window.mcCheckoutService.initiateValidation();

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
