import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPartnerPresentation } from '$lib/server/partner-config.js';

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

describe('partner-config', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getPartnerPresentation', () => {
		const mockEnv = {
			firmlyConfigs: {}
		};

		const defaultPresentation = {
			partnerPresentation: {
				id: null,
				largeLogo: null,
				smallLogo: null,
				displayName: 'Firmly',
				disclaimer: null,
				buttonText: 'Place Order'
			}
		};

		it('returns default presentation when appId is not provided', async () => {
			const result = await getPartnerPresentation(null, mockEnv);

			expect(result).toEqual(defaultPresentation);
			expect(getLogger).toHaveBeenCalledWith('Partner Config Error');
		});

		it('returns default presentation when env is not provided', async () => {
			const result = await getPartnerPresentation('app-123', null);

			expect(result).toEqual(defaultPresentation);
		});

		it('returns default presentation when env.firmlyConfigs is not provided', async () => {
			const result = await getPartnerPresentation('app-123', {});

			expect(result).toEqual(defaultPresentation);
		});

		it('returns partner presentation when found', async () => {
			const mockData = {
				largeLogo: 'https://partner.com/large.png',
				smallLogo: 'https://partner.com/small.png',
				name: 'Partner Name',
				disclaimer: 'Some disclaimer',
				buttonText: 'Buy Now'
			};

			accessData.mockResolvedValue(mockData);

			const result = await getPartnerPresentation('app-123', mockEnv);

			expect(result).toEqual({
				partnerPresentation: {
					id: 'app-123',
					largeLogo: 'https://partner.com/large.png',
					smallLogo: 'https://partner.com/small.png',
					displayName: 'Partner Name',
					disclaimer: 'Some disclaimer',
					buttonText: 'Buy Now'
				}
			});
		});

		it('parses string data from database', async () => {
			const mockData = JSON.stringify({
				largeLogo: 'https://partner.com/large.png',
				smallLogo: 'https://partner.com/small.png',
				name: 'Partner Name',
				disclaimer: 'Some disclaimer',
				buttonText: 'Buy Now'
			});

			accessData.mockResolvedValue(mockData);

			const result = await getPartnerPresentation('app-123', mockEnv);

			expect(result).toEqual({
				partnerPresentation: {
					id: 'app-123',
					largeLogo: 'https://partner.com/large.png',
					smallLogo: 'https://partner.com/small.png',
					displayName: 'Partner Name',
					disclaimer: 'Some disclaimer',
					buttonText: 'Buy Now'
				}
			});
		});

		it('returns default presentation when data is not found', async () => {
			accessData.mockResolvedValue(null);

			const result = await getPartnerPresentation('app-123', mockEnv);

			expect(result).toEqual(defaultPresentation);
		});

		it('returns default presentation and logs error when exception occurs', async () => {
			const error = new Error('Database error');
			accessData.mockRejectedValue(error);

			const result = await getPartnerPresentation('app-123', mockEnv);

			expect(result).toEqual(defaultPresentation);
			expect(getLogger).toHaveBeenCalledWith('Partner Config Error');
		});

		it('calls accessData with correct parameters', async () => {
			accessData.mockResolvedValue(null);

			await getPartnerPresentation('test-app-id', mockEnv);

			expect(accessData).toHaveBeenCalledWith(
				expect.objectContaining({
					env: {
						DATA_ACCESS_STRATEGY: 'd1',
						firmlyConfigs: mockEnv.firmlyConfigs
					}
				}),
				'partner_presentation',
				'test-app-id'
			);
		});
	});
});
