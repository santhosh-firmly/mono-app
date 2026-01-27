import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createMockBrowserFetch,
	createMockBrowserSession,
	createMockConfig
} from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/browser-fetch', () => createMockBrowserFetch());
vi.mock('$lib/services/browser-session', () => createMockBrowserSession());
vi.mock('$lib/utils/config', () => ({
	config: createMockConfig({ apiServer: 'https://api.test.com' }),
	buildDomainUrl: vi.fn()
}));

import { setAttribution, setCustomProperties } from '$lib/services/attribution.js';
import { browserFetch } from '$lib/utils/browser-fetch';
import { getHeaders } from '$lib/services/browser-session';
import { config, buildDomainUrl } from '$lib/utils/config';

describe('attribution service', () => {
	beforeEach(() => {
		getHeaders.mockResolvedValue({
			headers: { 'Content-Type': 'application/json' }
		});
		vi.clearAllMocks();
	});

	describe('setAttribution', () => {
		it('should set attribution data successfully', async () => {
			const attributionData = {
				utm: 'utm_source=test&utm_medium=email',
				referrer_url: 'https://example.com',
				landing_page: 'https://shop.com/product'
			};

			const mockResponse = {
				status: 200,
				data: { success: true }
			};

			browserFetch.mockResolvedValue(mockResponse);

			const result = await setAttribution(attributionData);

			expect(browserFetch).toHaveBeenCalledWith(
				'https://api.test.com/api/v1/browser-session/attribution',
				{
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify(attributionData)
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when API server not configured', async () => {
			// Temporarily mock config to not have apiServer
			const originalConfig = config.apiServer;
			config.apiServer = null;

			await expect(setAttribution({})).rejects.toThrow('API server not configured');

			// Restore
			config.apiServer = originalConfig;
		});
	});

	describe('setCustomProperties', () => {
		it('should set custom properties for a shop', async () => {
			const shopId = 'shop123';
			const customProperties = {
				custom_field_1: 'value1',
				custom_field_2: 'value2'
			};

			const mockResponse = {
				status: 200,
				data: { success: true }
			};

			browserFetch.mockResolvedValue(mockResponse);
			buildDomainUrl.mockReturnValue(
				'https://api.test.com/domains/shop123/custom-properties'
			);

			const result = await setCustomProperties(shopId, customProperties);

			expect(buildDomainUrl).toHaveBeenCalledWith('custom-properties', shopId);
			expect(browserFetch).toHaveBeenCalledWith(
				'https://api.test.com/domains/shop123/custom-properties',
				{
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify(customProperties)
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when shop ID is not provided', async () => {
			await expect(setCustomProperties('', {})).rejects.toThrow('Shop ID is required');
			await expect(setCustomProperties(null, {})).rejects.toThrow('Shop ID is required');
			await expect(setCustomProperties(undefined, {})).rejects.toThrow('Shop ID is required');
		});
	});
});
