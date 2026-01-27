import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDomainRequest, createMockGetHeaders } from '../__mock__/mock-factories.js';
import {
	paypalStartOrder,
	paypalAuthorizePayment,
	paypalCompleteOrder
} from '$lib/services/paypal.js';

vi.mock('$lib/utils/api-client', () => ({
	domainRequest: createMockDomainRequest()
}));

vi.mock('$lib/services/browser-session', () => ({
	getHeaders: createMockGetHeaders()
}));

import { domainRequest } from '$lib/utils/api-client';

describe('PayPal Order Operations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('paypalStartOrder', () => {
		it('should start PayPal order successfully', async () => {
			const orderData = {
				payment_method: {
					attributes: {
						paypal_token: 'test-token-123'
					}
				}
			};

			domainRequest.mockResolvedValue({
				status: 200,
				data: orderData
			});

			const result = await paypalStartOrder('test.com');

			expect(domainRequest).toHaveBeenCalledWith('express/paypal/start', 'test.com', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.status).toBe(200);
			expect(result.data).toEqual(orderData);
		});

		it('should handle error when starting order fails', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Failed to start order' }
			});

			const result = await paypalStartOrder('test.com');

			expect(result.status).toBe(400);
		});
	});

	describe('paypalAuthorizePayment', () => {
		it('should authorize PayPal payment successfully', async () => {
			const authData = { authorized: true };

			domainRequest.mockResolvedValue({
				status: 200,
				data: authData
			});

			const result = await paypalAuthorizePayment('payer-123', 'token-456', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('express/paypal/authorize', 'test.com', {
				method: 'POST',
				body: {
					attributes: {
						payer_id: 'payer-123',
						paypal_token: 'token-456'
					}
				},
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.status).toBe(200);
			expect(result.data).toEqual(authData);
		});

		it('should handle authorization error', async () => {
			domainRequest.mockResolvedValue({
				status: 401,
				data: { error: 'Authorization failed' }
			});

			const result = await paypalAuthorizePayment('payer-123', 'token-456', 'test.com');

			expect(result.status).toBe(401);
		});
	});

	describe('paypalCompleteOrder', () => {
		it('should complete PayPal order successfully', async () => {
			const orderData = { id: 'order-789', status: 'completed' };

			domainRequest.mockResolvedValue({
				status: 200,
				data: orderData
			});

			const result = await paypalCompleteOrder('payer-123', 'token-456', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith(
				'express/paypal/complete-order',
				'test.com',
				{
					method: 'POST',
					body: {
						attributes: {
							payer_id: 'payer-123',
							paypal_token: 'token-456'
						}
					},
					headers: { 'Content-Type': 'application/json' }
				}
			);
			expect(result.status).toBe(200);
			expect(result.data).toEqual(orderData);
		});

		it('should handle completion error', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Completion failed' }
			});

			const result = await paypalCompleteOrder('payer-123', 'token-456', 'test.com');

			expect(result.status).toBe(400);
		});
	});
});
