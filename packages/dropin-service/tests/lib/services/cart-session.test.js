import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockDomainRequest, createMockGetHeaders } from '../__mock__/mock-factories.js';
import {
	getConsents,
	setConsents,
	sessionJoin,
	sessionCreateOtp,
	sessionValidateOtp,
	getSessionCart
} from '$lib/services/cart.js';

vi.mock('$lib/utils/api-client', () => ({
	domainRequest: createMockDomainRequest()
}));

vi.mock('$lib/services/browser-session', () => ({
	getHeaders: createMockGetHeaders()
}));

import { domainRequest } from '$lib/utils/api-client';

describe('cart service - session management', () => {
	let mockSessionStorage;

	beforeEach(() => {
		mockSessionStorage = {
			data: {},
			getItem(key) {
				return this.data[key] || null;
			},
			setItem(key, value) {
				this.data[key] = value;
			},
			removeItem(key) {
				delete this.data[key];
			},
			clear() {
				this.data = {};
			}
		};

		global.sessionStorage = mockSessionStorage;
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
		delete global.sessionStorage;
	});

	describe('getConsents', () => {
		it('should get consents', async () => {
			const consentsData = { marketing: true, terms: true };

			domainRequest.mockResolvedValue({
				status: 200,
				data: consentsData
			});

			const result = await getConsents('test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/consents', 'test.com', {
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(consentsData);
		});
	});

	describe('setConsents', () => {
		it('should set consents', async () => {
			const consents = { marketing: false, terms: true };

			domainRequest.mockResolvedValue({
				status: 200,
				data: consents
			});

			const result = await setConsents(consents, 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/consents', 'test.com', {
				method: 'POST',
				body: consents,
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(consents);
		});
	});

	describe('sessionJoin', () => {
		it('should join session with password', async () => {
			const sessionData = { id: 'session456', shop_id: 'shop1' };

			domainRequest.mockResolvedValue({
				status: 200,
				data: sessionData
			});

			const result = await sessionJoin('password123', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('session/join', 'test.com', {
				method: 'POST',
				body: { password: 'password123' },
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(sessionData);
			expect(getSessionCart()).toEqual(sessionData);
		});
	});

	describe('sessionCreateOtp', () => {
		it('should create OTP for email', async () => {
			const otpData = { otp_sent: true };

			domainRequest.mockResolvedValue({
				status: 200,
				data: otpData
			});

			const result = await sessionCreateOtp('user@test.com', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('session/create-otp', 'test.com', {
				method: 'POST',
				body: { email: 'user@test.com' },
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(otpData);
		});
	});

	describe('sessionValidateOtp', () => {
		it('should validate OTP', async () => {
			const sessionData = { id: 'session789', validated: true };

			domainRequest.mockResolvedValue({
				status: 200,
				data: sessionData
			});

			const result = await sessionValidateOtp('user@test.com', '123456', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('session/validate-otp', 'test.com', {
				method: 'POST',
				body: { email: 'user@test.com', otp: '123456' },
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(sessionData);
			expect(getSessionCart()).toEqual(sessionData);
		});
	});

	describe('edge cases', () => {
		it('should not save cart when sessionJoin fails', async () => {
			domainRequest.mockResolvedValue({
				status: 401,
				data: { error: 'Invalid password' }
			});

			await sessionJoin('wrong', 'test.com');
			expect(getSessionCart()).toBeNull();
		});

		it('should not save cart when sessionValidateOtp fails', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Invalid OTP' }
			});

			await sessionValidateOtp('email@test.com', '000000', 'test.com');
			expect(getSessionCart()).toBeNull();
		});
	});
});
