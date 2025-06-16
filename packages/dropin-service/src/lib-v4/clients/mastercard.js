/**
 * Loads the MasterCard Unified Solution SDK by appending a script tag to the document head.
 * For integration steps, see:
 * https://developer.mastercard.com/unified-checkout-solutions/tutorial/integrate_apis/step2/
 *
 * @param {string} scriptSrc - The source URL of the MasterCard Unified Solution script (Sandbox or Production).
 * @returns {Promise<void>} Resolves when the SDK is loaded and initialized.
 */
export async function startMasterCardUnifiedSolution(scriptSrc = '') {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = scriptSrc;
		script.onload = () => {
			window.mcCheckoutService = new MastercardCheckoutServices();
			resolve();
		};
		script.onerror = (e) =>
			reject(new Error(`[Mastercard Unified]: failed to load ${scriptSrc}`));
		document.head.appendChild(script);
	});
}

/**
 * Determines if the MasterCard Unified Solution is recognized and initialized for the current user.
 * If the user has previously used the service, it will return their masked cards.
 * @see https://developer.mastercard.com/unified-checkout-solutions/documentation/sdk-reference/parameters/#masked-card
 * @param {Object} params - Parameters for initialization.
 * @param {string} params.srcDpaId - The DPA ID required by the MasterCard SDK.
 * @returns {Promise<{recognized: boolean, maskedCards: Array}>} An object indicating recognition status and any masked cards.
 */
export async function isRecognized(params) {
	await window.mcCheckoutService.init({
		srcDpaId: params.srcDpaId,
		dpaData: { dpaName: 'Firmly' },
		cardBrands: ['mastercard', 'maestro', 'visa', 'amex', 'discover']
	});

	const maskedCards = await window.mcCheckoutService.getCards();

	if (maskedCards.length) {
		return {
			recognized: true,
			maskedCards: maskedCards
		};
	}

	return {
		recognized: false,
		maskedCards: []
	};
}

/**
 * Starts the OTP process by checking if the consumer exists for the given email,
 * and, if so, initiates validation and returns OTP channel details.
 *
 * @param {string} email - The email address of the consumer to look up.
 * @link https://developer.mastercard.com/unified-checkout-solutions/documentation/sdk-reference/id-lookup
 * @returns {Promise<undefined|{channel: string, maskedValidationChannel: string, network: string}>}
 *   An object containing the validation channel ID (or 'EMAIL' as default), the masked validation channel,
 *   and the network, or undefined if the consumer is not present.
 */
export async function unlockStart(email) {
	const { consumerPresent } = window.mcCheckoutService.idLookup({ email });

	if (!consumerPresent) return;

	const { maskedValidationChannel, network, supportedValidationChannels } =
		await window.mcCheckoutService.initiateValidation();

	const channel = supportedValidationChannels?.find(
		(channel) => channel.maskedValidationChannel === maskedValidationChannel
	);

	return {
		channel: channel?.validationChannelId || 'EMAIL',
		maskedValidationChannel,
		network
	};
}

/**
 * Completes the OTP validation process and retrieves masked cards.
 *
 * @param {string} otpCode - The OTP code entered by the user.
 * @returns {Promise<{maskedCards: Array}>} An object containing the masked cards.
 */
export async function unlockComplete(otpCode) {
	const maskedCards = await window.mcCheckoutService.validate({
		value: otpCode
	});

	return {
		maskedCards: maskedCards
	};
}
