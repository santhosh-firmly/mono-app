import { mockC2PCards } from './mock-data.js';

let configuratorInstance = null;
let mockEnabled = false;

export function setConfiguratorForC2PMock(configurator) {
	configuratorInstance = configurator;
}

export function enableC2PMock() {
	if (mockEnabled) return;
	mockEnabled = true;
	setupMockCheckoutService();
}

export function disableC2PMock() {
	mockEnabled = false;
	if (typeof window !== 'undefined') {
		delete window.mcCheckoutService;
	}
}

function maskEmail(email) {
	if (!email) return '';
	const [localPart, domain] = email.split('@');
	return localPart.charAt(0) + '***@' + domain;
}

async function trackRequest(name, method = 'POST') {
	if (!configuratorInstance) return;

	try {
		await configuratorInstance.addRequest(name, {
			url: `c2p://${name.toLowerCase().replace(/\s+/g, '-')}`,
			method
		});
	} catch {
		throw new Error('Request rejected');
	}
}

function setupMockCheckoutService() {
	if (typeof window === 'undefined') return;

	let lastEmail = '';

	window.mcCheckoutService = {
		init: async () => {
			await trackRequest('C2P Initialize');
			return { status: 'success' };
		},

		idLookup: async ({ email }) => {
			lastEmail = email;
			await trackRequest('C2P Lookup Email');
			return { consumerPresent: true };
		},

		initiateValidation: async () => {
			await trackRequest('C2P Send OTP');
			const maskedEmail = maskEmail(lastEmail);
			return {
				network: 'mastercard',
				supportedValidationChannels: [
					{ identityType: 'EMAIL', maskedValidationChannel: maskedEmail },
					{ identityType: 'SMS', maskedValidationChannel: '(***) ***-1234' }
				]
			};
		},

		validate: async ({ value }) => {
			if (!/^\d{6}$/.test(value)) {
				const error = new Error('Invalid OTP');
				error.reason = 'CODE_INVALID';
				throw error;
			}

			await trackRequest('C2P Verify OTP');

			return mockC2PCards.map((card) => ({
				srcDigitalCardId: card.id,
				panLastFour: card.last4,
				panBin: card.first4 + '00',
				panExpirationMonth: card.month,
				panExpirationYear: card.year,
				paymentCardDescriptor: card.provider,
				paymentCardType: card.card_type.toLowerCase(),
				digitalCardData: {
					status: 'ACTIVE',
					artUri: card.art
				},
				maskedBillingAddress: {
					line1: card.billing_info.address1,
					line2: card.billing_info.address2,
					city: card.billing_info.city,
					state: card.billing_info.state_or_province,
					zip: card.billing_info.postal_code,
					countryCode:
						card.billing_info.country === 'United States'
							? 'US'
							: card.billing_info.country
				}
			}));
		},

		checkout: async () => {
			await trackRequest('C2P Checkout');
			return { status: 'success' };
		}
	};
}
