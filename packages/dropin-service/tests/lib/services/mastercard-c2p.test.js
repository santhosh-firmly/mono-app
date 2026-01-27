import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	initializeMastercardC2P,
	validateEmail,
	verifyOtp,
	checkoutWithCard
} from '$lib/services/mastercard-c2p.js';

describe('mastercard-c2p service', () => {
	beforeEach(() => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (window.mcCheckoutService) {
			delete window.mcCheckoutService;
		}
		if (window.MastercardCheckoutServices) {
			delete window.MastercardCheckoutServices;
		}
	});

	describe('initializeMastercardC2P', () => {
		it('returns skipped status when no DPA ID provided', async () => {
			const result = await initializeMastercardC2P({});

			expect(result.status).toBe('skipped');
			expect(result.error).toBe('No DPA ID configured');
		});

		it('returns success when SDK is already initialized', async () => {
			window.mcCheckoutService = {};

			const result = await initializeMastercardC2P({ srcDpaId: 'test-dpa-id' });

			expect(result.status).toBe('success');
		});

		it('loads SDK script and initializes checkout service', async () => {
			const mockInit = vi.fn().mockResolvedValue({});
			window.MastercardCheckoutServices = vi.fn().mockImplementation(() => ({
				init: mockInit
			}));

			vi.spyOn(document, 'createElement');
			vi.spyOn(document.head, 'appendChild').mockImplementation((script) => {
				setTimeout(() => script.onload(), 10);
				return script;
			});

			const result = await initializeMastercardC2P({
				srcDpaId: 'test-dpa-id',
				presentationName: 'Test Merchant',
				sandbox: true,
				dpaLocale: 'en_US'
			});

			expect(result.status).toBe('success');
			expect(mockInit).toHaveBeenCalled();
		});

		it('uses sandbox URL when sandbox is true', async () => {
			window.MastercardCheckoutServices = vi.fn().mockImplementation(() => ({
				init: vi.fn().mockResolvedValue({})
			}));

			let capturedScript;
			vi.spyOn(document.head, 'appendChild').mockImplementation((script) => {
				capturedScript = script;
				setTimeout(() => script.onload(), 10);
				return script;
			});

			await initializeMastercardC2P({
				srcDpaId: 'test-dpa-id',
				sandbox: true
			});

			expect(capturedScript.src).toContain('sandbox.src.mastercard.com');
		});

		it('uses production URL when sandbox is false', async () => {
			window.MastercardCheckoutServices = vi.fn().mockImplementation(() => ({
				init: vi.fn().mockResolvedValue({})
			}));

			let capturedScript;
			vi.spyOn(document.head, 'appendChild').mockImplementation((script) => {
				capturedScript = script;
				setTimeout(() => script.onload(), 10);
				return script;
			});

			await initializeMastercardC2P({
				srcDpaId: 'test-dpa-id',
				sandbox: false
			});

			expect(capturedScript.src).toContain('src.mastercard.com');
			expect(capturedScript.src).not.toContain('sandbox');
		});

		it('returns error when script fails to load', async () => {
			vi.spyOn(document.head, 'appendChild').mockImplementation((script) => {
				setTimeout(() => script.onerror(new Error('Network error')), 10);
				return script;
			});

			const result = await initializeMastercardC2P({
				srcDpaId: 'test-dpa-id'
			});

			expect(result.status).toBe('error');
			expect(result.error).toBeDefined();
		});

		it('returns error when MastercardCheckoutServices not available after load', async () => {
			vi.spyOn(document.head, 'appendChild').mockImplementation((script) => {
				setTimeout(() => script.onload(), 10);
				return script;
			});

			const result = await initializeMastercardC2P({
				srcDpaId: 'test-dpa-id'
			});

			expect(result.status).toBe('error');
			expect(result.error.message).toContain('MastercardCheckoutServices not available');
		});
	});

	describe('validateEmail', () => {
		it('returns error when SDK not initialized', async () => {
			const result = await validateEmail('test@example.com');

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('Mastercard SDK not initialized');
		});

		it('returns not recognized when consumer not present', async () => {
			window.mcCheckoutService = {
				idLookup: vi.fn().mockResolvedValue({ consumerPresent: false })
			};

			const result = await validateEmail('test@example.com');

			expect(result.status).toBe(200);
			expect(result.data.recognized).toBe(false);
		});

		it('initiates validation when consumer is recognized', async () => {
			window.mcCheckoutService = {
				idLookup: vi.fn().mockResolvedValue({ consumerPresent: true }),
				initiateValidation: vi.fn().mockResolvedValue({
					network: 'mastercard',
					supportedValidationChannels: [
						{ identityType: 'EMAIL', maskedValidationChannel: 'te***@example.com' },
						{ identityType: 'SMS', maskedValidationChannel: '***1234' }
					]
				})
			};

			const result = await validateEmail('test@example.com');

			expect(result.status).toBe(200);
			expect(result.data.network).toBe('mastercard');
			expect(result.data.otp_destination.emails).toContain('te***@example.com');
			expect(result.data.otp_destination.phones).toContain('***1234');
		});

		it('parses Visa validation channels correctly', async () => {
			window.mcCheckoutService = {
				idLookup: vi.fn().mockResolvedValue({ consumerPresent: true }),
				initiateValidation: vi.fn().mockResolvedValue({
					network: 'visa',
					maskedValidationChannel: 'khe**@mastercard.com,********0998'
				})
			};

			const result = await validateEmail('test@example.com');

			expect(result.status).toBe(200);
			expect(result.data.otp_destination.emails).toContain('khe**@mastercard.com');
			expect(result.data.otp_destination.phones).toContain('********0998');
		});

		it('uses requested validation channel', async () => {
			const initiateValidation = vi.fn().mockResolvedValue({
				network: 'mastercard',
				supportedValidationChannels: []
			});

			window.mcCheckoutService = {
				idLookup: vi.fn().mockResolvedValue({ consumerPresent: true }),
				initiateValidation
			};

			await validateEmail('test@example.com', 'SMS');

			expect(initiateValidation).toHaveBeenCalledWith({
				requestedValidationChannelId: 'SMS'
			});
		});

		it('handles errors during validation', async () => {
			window.mcCheckoutService = {
				idLookup: vi.fn().mockRejectedValue(new Error('Validation failed'))
			};

			const result = await validateEmail('test@example.com');

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('Validation failed');
		});
	});

	describe('verifyOtp', () => {
		it('returns error when SDK not initialized', async () => {
			const result = await verifyOtp('123456');

			expect(result.status).toBe(400);
			expect(result.data.description).toBe('Mastercard SDK not initialized');
			expect(result.data.error_code).toBe('SDK_NOT_INITIALIZED');
		});

		it('returns empty cards array when no cards returned', async () => {
			window.mcCheckoutService = {
				validate: vi.fn().mockResolvedValue([])
			};

			const result = await verifyOtp('123456');

			expect(result.status).toBe(200);
			expect(result.data.recognized).toBe(true);
			expect(result.data.payment_method_options).toHaveLength(0);
		});

		it('returns cards on successful OTP verification', async () => {
			window.mcCheckoutService = {
				validate: vi.fn().mockResolvedValue([
					{
						srcDigitalCardId: 'card-123',
						paymentCardDescriptor: 'mastercard',
						panLastFour: '1234',
						panExpirationMonth: '12',
						panExpirationYear: '2025',
						digitalCardData: { status: 'ACTIVE' }
					}
				])
			};

			const result = await verifyOtp('123456');

			expect(result.status).toBe(200);
			expect(result.data.recognized).toBe(true);
			expect(result.data.payment_method_options).toHaveLength(1);
			expect(result.data.payment_method_options[0]).toMatchObject({
				id: 'card-123',
				provider: 'mastercard',
				last_four: '1234',
				month: '12',
				year: '2025'
			});
		});

		it('uses panLastFour for last_four field', async () => {
			window.mcCheckoutService = {
				validate: vi.fn().mockResolvedValue([
					{
						srcDigitalCardId: 'card-123',
						paymentCardDescriptor: 'visa',
						panLastFour: '5678',
						panExpirationMonth: '06',
						panExpirationYear: '2026',
						digitalCardData: { status: 'ACTIVE' }
					}
				])
			};

			const result = await verifyOtp('123456');

			expect(result.data.payment_method_options[0].last_four).toBe('5678');
		});

		it('handles OTP verification errors', async () => {
			window.mcCheckoutService = {
				validate: vi
					.fn()
					.mockRejectedValue({ reason: 'CODE_INVALID', message: 'Invalid OTP' })
			};

			const result = await verifyOtp('123456');

			expect(result.status).toBe(400);
			expect(result.data.error_code).toBe('CODE_INVALID');
			expect(result.data.description).toContain('not the right code');
		});

		it('handles CODE_EXPIRED error', async () => {
			window.mcCheckoutService = {
				validate: vi
					.fn()
					.mockRejectedValue({ reason: 'CODE_EXPIRED', message: 'Code expired' })
			};

			const result = await verifyOtp('123456');

			expect(result.status).toBe(400);
			expect(result.data.error_code).toBe('CODE_EXPIRED');
			expect(result.data.description).toContain('code has expired');
		});

		it('handles ACCT_INACCESSIBLE error', async () => {
			window.mcCheckoutService = {
				validate: vi
					.fn()
					.mockRejectedValue({ reason: 'ACCT_INACCESSIBLE', message: 'Account locked' })
			};

			const result = await verifyOtp('123456');

			expect(result.status).toBe(400);
			expect(result.data.error_code).toBe('ACCT_INACCESSIBLE');
			expect(result.data.description).toContain('not currently accessible');
		});

		it('handles RETRIES_EXCEEDED error', async () => {
			window.mcCheckoutService = {
				validate: vi
					.fn()
					.mockRejectedValue({ reason: 'RETRIES_EXCEEDED', message: 'Too many attempts' })
			};

			const result = await verifyOtp('123456');

			expect(result.status).toBe(400);
			expect(result.data.error_code).toBe('RETRIES_EXCEEDED');
			expect(result.data.description).toContain('exceeded the maximum number');
		});
	});

	describe('checkoutWithCard', () => {
		it('returns error when SDK not initialized', async () => {
			const result = await checkoutWithCard({ cardId: 'card-123' });

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('Mastercard SDK not initialized');
		});

		it('performs checkout with card', async () => {
			const checkoutMock = vi.fn().mockResolvedValue({ transactionId: 'txn-123' });
			window.mcCheckoutService = { checkout: checkoutMock };

			const result = await checkoutWithCard({
				cardId: 'card-123',
				rememberMe: true
			});

			expect(result.status).toBe(200);
			expect(result.data.transactionId).toBe('txn-123');
			expect(checkoutMock).toHaveBeenCalledWith(
				expect.objectContaining({
					srcDigitalCardId: 'card-123',
					rememberMe: true
				})
			);
		});

		it('includes CVV when provided', async () => {
			const checkoutMock = vi.fn().mockResolvedValue({});
			window.mcCheckoutService = { checkout: checkoutMock };

			await checkoutWithCard({
				cardId: 'card-123',
				cvv: '123'
			});

			expect(checkoutMock).toHaveBeenCalledWith(expect.objectContaining({ cvv: '123' }));
		});

		it('uses custom dynamic data type from additionalData', async () => {
			const checkoutMock = vi.fn().mockResolvedValue({});
			window.mcCheckoutService = { checkout: checkoutMock };

			await checkoutWithCard({
				cardId: 'card-123',
				additionalData: { dynamicDataType: 'CUSTOM_TYPE' }
			});

			expect(checkoutMock).toHaveBeenCalledWith(
				expect.objectContaining({
					dpaTransactionOptions: {
						paymentOptions: [{ dynamicDataType: 'CUSTOM_TYPE' }]
					}
				})
			);
		});

		it('handles checkout errors', async () => {
			window.mcCheckoutService = {
				checkout: vi.fn().mockRejectedValue(new Error('Checkout failed'))
			};

			const result = await checkoutWithCard({ cardId: 'card-123' });

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('Checkout failed');
		});
	});
});
