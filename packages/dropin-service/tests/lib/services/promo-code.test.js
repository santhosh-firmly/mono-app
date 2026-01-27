import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDomainRequest, createMockGetHeaders } from '../__mock__/mock-factories.js';
import { addPromoCode, removeAllPromoCodes } from '$lib/services/promo-code.js';

vi.mock('$lib/utils/api-client', () => ({
	domainRequest: createMockDomainRequest()
}));

vi.mock('$lib/services/browser-session', () => ({
	getHeaders: createMockGetHeaders()
}));

import { domainRequest } from '$lib/utils/api-client';

describe('promo-code service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('addPromoCode', () => {
		it('adds promo code to cart successfully', async () => {
			const cartData = { id: '123', promo_codes: ['SAVE10'] };
			domainRequest.mockResolvedValue({ status: 200, data: cartData });

			const result = await addPromoCode('SAVE10', 'test.com');

			expect(result.status).toBe(200);
			expect(result.data).toEqual(cartData);
		});

		it('returns 400 for empty promo code', async () => {
			const result = await addPromoCode('', 'test.com');

			expect(result.status).toBe(400);
			expect(result.data).toBeNull();
			expect(domainRequest).not.toHaveBeenCalled();
		});

		it('returns 400 for null promo code', async () => {
			const result = await addPromoCode(null, 'test.com');

			expect(result.status).toBe(400);
			expect(result.data).toBeNull();
		});

		it('handles API error response', async () => {
			domainRequest.mockResolvedValue({ status: 422, data: { error: 'Invalid code' } });

			const result = await addPromoCode('INVALID', 'test.com');

			expect(result.status).toBe(422);
		});

		it('handles network error', async () => {
			domainRequest.mockRejectedValue(new Error('Network error'));

			const result = await addPromoCode('SAVE10', 'test.com');

			expect(result.status).toBe(500);
			expect(result.data).toBeNull();
		});
	});

	describe('removeAllPromoCodes', () => {
		it('removes all promo codes successfully', async () => {
			const cartData = { id: '123', promo_codes: [] };
			domainRequest.mockResolvedValue({ status: 200, data: cartData });

			const result = await removeAllPromoCodes('test.com');

			expect(result.status).toBe(200);
			expect(result.data).toEqual(cartData);
		});

		it('handles network error', async () => {
			domainRequest.mockRejectedValue(new Error('Network error'));

			const result = await removeAllPromoCodes('test.com');

			expect(result.status).toBe(500);
			expect(result.data).toBeNull();
		});
	});
});
