import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMerchantPresentation } from '$lib/server/merchant-config.js';

vi.mock('foundation/data-management/data-accessor.js', () => ({
	accessData: vi.fn()
}));

vi.mock('foundation/utils/log.js', () => ({
	getLogger: vi.fn(() => ({
		error: vi.fn()
	}))
}));

import { accessData } from 'foundation/data-management/data-accessor.js';
import { getLogger } from 'foundation/utils/log.js';

describe('merchant-config', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getMerchantPresentation', () => {
		const mockEnv = {
			firmlyConfigs: {}
		};

		it('returns null when domain is not provided', async () => {
			const result = await getMerchantPresentation(null, mockEnv);

			expect(result).toBeNull();
			expect(getLogger).toHaveBeenCalledWith('Data Accessor Error');
		});

		it('returns null when env is not provided', async () => {
			const result = await getMerchantPresentation('example.com', null);

			expect(result).toBeNull();
		});

		it('returns null when env.firmlyConfigs is not provided', async () => {
			const result = await getMerchantPresentation('example.com', {});

			expect(result).toBeNull();
		});

		it('returns presentation data when found', async () => {
			const mockData = {
				theme: {
					largeLogo: 'https://example.com/large.png',
					smallLogo: 'https://example.com/small.png'
				},
				termsOfUse: 'https://example.com/terms',
				privacyPolicy: 'https://example.com/privacy'
			};

			accessData.mockResolvedValue(mockData);

			const result = await getMerchantPresentation('example.com', mockEnv);

			expect(result).toEqual({
				domain: 'example.com',
				theme: mockData.theme,
				largeLogo: 'https://example.com/large.png',
				smallLogo: 'https://example.com/small.png',
				termsOfUse: 'https://example.com/terms',
				privacyPolicy: 'https://example.com/privacy'
			});
		});

		it('parses string data from database', async () => {
			const mockData = JSON.stringify({
				theme: {
					largeLogo: 'https://example.com/large.png',
					smallLogo: 'https://example.com/small.png'
				},
				termsOfUse: 'https://example.com/terms',
				privacyPolicy: 'https://example.com/privacy'
			});

			accessData.mockResolvedValue(mockData);

			const result = await getMerchantPresentation('example.com', mockEnv);

			expect(result).toEqual({
				domain: 'example.com',
				theme: {
					largeLogo: 'https://example.com/large.png',
					smallLogo: 'https://example.com/small.png'
				},
				largeLogo: 'https://example.com/large.png',
				smallLogo: 'https://example.com/small.png',
				termsOfUse: 'https://example.com/terms',
				privacyPolicy: 'https://example.com/privacy'
			});
		});

		it('returns undefined when data is not found', async () => {
			accessData.mockResolvedValue(null);

			const result = await getMerchantPresentation('example.com', mockEnv);

			expect(result).toBeUndefined();
		});

		it('returns null and logs error when exception occurs', async () => {
			const error = new Error('Database error');
			accessData.mockRejectedValue(error);

			const result = await getMerchantPresentation('example.com', mockEnv);

			expect(result).toBeNull();
			expect(getLogger).toHaveBeenCalledWith('Data access error');
		});

		it('calls accessData with correct parameters', async () => {
			accessData.mockResolvedValue(null);

			await getMerchantPresentation('test-domain.com', mockEnv);

			expect(accessData).toHaveBeenCalledWith(
				expect.objectContaining({
					env: {
						DATA_ACCESS_STRATEGY: 'd1',
						firmlyConfigs: mockEnv.firmlyConfigs
					}
				}),
				'merchant_presentation',
				'test-domain.com'
			);
		});
	});
});
