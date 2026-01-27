import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushSync } from 'svelte';
import { createMockCheckoutState, createMockMastercardC2P } from '../__mock__/mock-factories.js';

vi.mock('$lib/states/checkout/index.svelte.js', () => createMockCheckoutState());
vi.mock('$lib/services/mastercard-c2p.js', () => createMockMastercardC2P());

import {
	initializeClickToPay,
	getClickToPay,
	resetClickToPay
} from '$lib/states/click-to-pay.svelte.js';
import { getCheckout } from '$lib/states/checkout/index.svelte.js';
import { initializeMastercardC2P, validateEmail, verifyOtp } from '$lib/services/mastercard-c2p.js';

describe('click-to-pay state', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetClickToPay();
	});

	describe('initializeClickToPay', () => {
		it('creates a new ClickToPay instance', () => {
			const c2p = initializeClickToPay();
			expect(c2p).toBeDefined();
			expect(c2p.initialized).toBe(false);
		});
	});

	describe('getClickToPay', () => {
		it('throws error if not initialized', () => {
			expect(() => getClickToPay()).toThrow('ClickToPay not initialized');
		});

		it('returns the instance after initialization', () => {
			initializeClickToPay();
			const c2p = getClickToPay();
			expect(c2p).toBeDefined();
		});
	});

	describe('resetClickToPay', () => {
		it('resets the instance to null', () => {
			initializeClickToPay();
			resetClickToPay();
			expect(() => getClickToPay()).toThrow('ClickToPay not initialized');
		});
	});

	describe('ClickToPay class', () => {
		let c2p;

		beforeEach(() => {
			c2p = initializeClickToPay();
		});

		describe('initial state', () => {
			it('has correct initial values', () => {
				expect(c2p.initialized).toBe(false);
				expect(c2p.otpDestination).toBeNull();
				expect(c2p.network).toBe('');
				expect(c2p.showModal).toBe(false);
				expect(c2p.cards).toEqual([]);
				expect(c2p.userLoggedIn).toBe(false);
				expect(c2p.error).toBe('');
				expect(c2p.isValidatingEmail).toBe(false);
				expect(c2p.isVerifyingOtp).toBe(false);
				expect(c2p.userEmail).toBe('');
				expect(c2p.lastOtpRequestTime).toBe(0);
			});
		});

		describe('initialize', () => {
			it('sets initialized to true on success', async () => {
				await c2p.initialize({
					PUBLIC_unified_c2p_dpa_id: 'dpa123',
					PUBLIC_unified_c2p_dpa_presentation_name: 'Test Store',
					PUBLIC_unified_c2p_sandbox: true
				});

				expect(c2p.initialized).toBe(true);
				expect(initializeMastercardC2P).toHaveBeenCalledWith({
					srcDpaId: 'dpa123',
					presentationName: 'Test Store',
					sandbox: true,
					dpaLocale: 'en_US'
				});
			});

			it('sets initialized to false on failure', async () => {
				initializeMastercardC2P.mockResolvedValueOnce({ status: 'failed' });

				await c2p.initialize({});

				expect(c2p.initialized).toBe(false);
			});

			it('sets initialized to false on error', async () => {
				initializeMastercardC2P.mockRejectedValueOnce(new Error('Init failed'));

				await c2p.initialize({});

				expect(c2p.initialized).toBe(false);
			});
		});

		describe('validateEmail', () => {
			it('returns false if email is empty', async () => {
				const result = await c2p.validateEmail('');
				expect(result).toBe(false);
			});

			it('returns false if canResendOtp is false (cooldown active)', async () => {
				c2p.lastOtpRequestTime = Date.now();
				const result = await c2p.validateEmail('test@example.com');
				expect(result).toBe(false);
			});

			it('validates email and updates state on success', async () => {
				const result = await c2p.validateEmail('test@example.com');

				expect(result).toBe(true);
				expect(c2p.otpDestination).toEqual({
					emails: ['test@example.com'],
					phones: []
				});
				expect(c2p.network).toBe('MASTERCARD');
				expect(c2p.showModal).toBe(true);
				expect(c2p.userEmail).toBe('test@example.com');
				expect(c2p.lastOtpRequestTime).toBeGreaterThan(0);
			});

			it('uses custom channel parameter', async () => {
				await c2p.validateEmail('test@example.com', 'SMS');
				expect(validateEmail).toHaveBeenCalledWith('test@example.com', 'SMS');
			});

			it('returns false if no OTP destinations', async () => {
				validateEmail.mockResolvedValueOnce({
					status: 200,
					data: { otp_destination: { emails: [], phones: [] } }
				});

				const result = await c2p.validateEmail('test@example.com');
				expect(result).toBe(false);
			});

			it('returns false on non-200 status', async () => {
				validateEmail.mockResolvedValueOnce({ status: 400 });

				const result = await c2p.validateEmail('test@example.com');
				expect(result).toBe(false);
			});

			it('sets error on exception', async () => {
				validateEmail.mockRejectedValueOnce(new Error('Network error'));

				const result = await c2p.validateEmail('test@example.com');

				expect(result).toBe(false);
				expect(c2p.error).toBe('Email validation failed');
			});

			it('sets isValidatingEmail during validation', async () => {
				let capturedState = false;
				validateEmail.mockImplementationOnce(async () => {
					capturedState = c2p.isValidatingEmail;
					return {
						status: 200,
						data: { otp_destination: { emails: ['a@b.com'], phones: [] } }
					};
				});

				await c2p.validateEmail('test@example.com');

				expect(capturedState).toBe(true);
				expect(c2p.isValidatingEmail).toBe(false);
			});
		});

		describe('verifyOtp', () => {
			it('returns false if code is empty', async () => {
				const result = await c2p.verifyOtp('');
				expect(result).toBe(false);
			});

			it('verifies OTP and updates state on success', async () => {
				const result = await c2p.verifyOtp('123456');

				expect(result).toBe(true);
				expect(c2p.userLoggedIn).toBe(true);
				expect(c2p.cards).toEqual([{ id: 'card1', last4: '1234' }]);
				expect(c2p.showModal).toBe(false);
			});

			it('calls checkout.addC2PCards on success', async () => {
				await c2p.verifyOtp('123456');

				const checkout = getCheckout();
				expect(checkout.addC2PCards).toHaveBeenCalledWith([{ id: 'card1', last4: '1234' }]);
			});

			it('sets error on invalid code', async () => {
				verifyOtp.mockResolvedValueOnce({
					status: 400,
					data: { description: 'Invalid OTP code' }
				});

				const result = await c2p.verifyOtp('000000');

				expect(result).toBe(false);
				expect(c2p.error).toBe('Invalid OTP code');
			});

			it('sets default error message if no description', async () => {
				verifyOtp.mockResolvedValueOnce({ status: 400, data: {} });

				const result = await c2p.verifyOtp('000000');

				expect(result).toBe(false);
				expect(c2p.error).toBe('Invalid code');
			});

			it('sets error on exception', async () => {
				verifyOtp.mockRejectedValueOnce(new Error('Network error'));

				const result = await c2p.verifyOtp('123456');

				expect(result).toBe(false);
				expect(c2p.error).toBe('Verification failed');
			});

			it('sets isVerifyingOtp during verification', async () => {
				let capturedState = false;
				verifyOtp.mockImplementationOnce(async () => {
					capturedState = c2p.isVerifyingOtp;
					return { status: 200, data: { payment_method_options: [] } };
				});

				await c2p.verifyOtp('123456');

				expect(capturedState).toBe(true);
				expect(c2p.isVerifyingOtp).toBe(false);
			});
		});

		describe('resendOtp', () => {
			it('returns false if no userEmail', async () => {
				const result = await c2p.resendOtp();
				expect(result).toBe(false);
			});

			it('calls validateEmail with stored email', async () => {
				c2p.userEmail = 'stored@example.com';
				await c2p.resendOtp();
				expect(validateEmail).toHaveBeenCalledWith('stored@example.com', 'EMAIL');
			});

			it('uses custom channel', async () => {
				c2p.userEmail = 'stored@example.com';
				await c2p.resendOtp('SMS');
				expect(validateEmail).toHaveBeenCalledWith('stored@example.com', 'SMS');
			});
		});

		describe('closeModal', () => {
			it('sets showModal to false', () => {
				c2p.showModal = true;
				c2p.closeModal();
				expect(c2p.showModal).toBe(false);
			});
		});

		describe('reset', () => {
			it('resets all state to initial values', async () => {
				// Set various state
				await c2p.validateEmail('test@example.com');
				c2p.userLoggedIn = true;
				c2p.cards = [{ id: 'card1' }];
				c2p.error = 'Some error';

				c2p.reset();

				expect(c2p.otpDestination).toBeNull();
				expect(c2p.network).toBe('');
				expect(c2p.showModal).toBe(false);
				expect(c2p.cards).toEqual([]);
				expect(c2p.userLoggedIn).toBe(false);
				expect(c2p.error).toBe('');
				expect(c2p.isValidatingEmail).toBe(false);
				expect(c2p.isVerifyingOtp).toBe(false);
				expect(c2p.userEmail).toBe('');
				expect(c2p.lastOtpRequestTime).toBe(0);
			});
		});

		describe('derived state', () => {
			it('canResendOtp returns true after cooldown', () => {
				const cleanup = $effect.root(() => {
					c2p.lastOtpRequestTime = Date.now() - 31000; // Over 30 seconds ago
					flushSync();
					expect(c2p.canResendOtp).toBe(true);
				});
				cleanup();
			});

			it('canResendOtp returns false during cooldown', () => {
				const cleanup = $effect.root(() => {
					c2p.lastOtpRequestTime = Date.now(); // Just now
					flushSync();
					expect(c2p.canResendOtp).toBe(false);
				});
				cleanup();
			});

			it('hasEmailOption returns true when emails exist', () => {
				const cleanup = $effect.root(() => {
					c2p.otpDestination = { emails: ['test@example.com'], phones: [] };
					flushSync();
					expect(c2p.hasEmailOption).toBe(true);
				});
				cleanup();
			});

			it('hasEmailOption returns false when no emails', () => {
				const cleanup = $effect.root(() => {
					c2p.otpDestination = { emails: [], phones: [] };
					flushSync();
					expect(c2p.hasEmailOption).toBe(false);
				});
				cleanup();
			});

			it('hasPhoneOption returns true when phones exist', () => {
				const cleanup = $effect.root(() => {
					c2p.otpDestination = { emails: [], phones: ['1234567890'] };
					flushSync();
					expect(c2p.hasPhoneOption).toBe(true);
				});
				cleanup();
			});
		});
	});
});
