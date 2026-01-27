import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockDomainRequest, createMockGetHeaders } from '../__mock__/mock-factories.js';
import { searchAddress, getAddress } from '$lib/services/address-autocomplete.js';

vi.mock('$lib/utils/api-client', () => ({
	domainRequest: createMockDomainRequest()
}));

vi.mock('$lib/services/browser-session', () => ({
	getHeaders: createMockGetHeaders()
}));

import { domainRequest } from '$lib/utils/api-client';

describe('address-autocomplete service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('searchAddress', () => {
		it('should return empty predictions for query shorter than 4 characters', async () => {
			const result = await searchAddress('abc', 'test.com');

			expect(result).toEqual({
				status: 200,
				data: { predictions: [] }
			});
			expect(domainRequest).not.toHaveBeenCalled();
		});

		it('should return empty predictions for empty query', async () => {
			const result = await searchAddress('', 'test.com');

			expect(result).toEqual({
				status: 200,
				data: { predictions: [] }
			});
			expect(domainRequest).not.toHaveBeenCalled();
		});

		it('should search for addresses with valid query', async () => {
			const mockResponse = {
				status: 200,
				data: {
					predictions: [
						{ id: '1', address: '123 Main St, City, State' },
						{ id: '2', address: '456 Oak Ave, City, State' }
					]
				}
			};

			domainRequest.mockResolvedValue(mockResponse);

			const result = await searchAddress('123 Main', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('addresses?q=123%20Main', 'test.com', {
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result).toEqual({
				status: 200,
				data: {
					predictions: [
						{ id: '1', value: '123 Main St, City, State', address1: '123 Main St' },
						{ id: '2', value: '456 Oak Ave, City, State', address1: '456 Oak Ave' }
					]
				}
			});
		});

		it('should handle API error gracefully', async () => {
			domainRequest.mockResolvedValue({
				status: 500,
				data: { error: 'Server error' }
			});

			const result = await searchAddress('test', 'test.com');

			expect(result).toEqual({
				status: 500,
				data: { predictions: [] }
			});
		});

		it('should handle network error', async () => {
			domainRequest.mockRejectedValue(new Error('Network error'));

			const result = await searchAddress('test', 'test.com');

			expect(result).toEqual({
				status: 500,
				data: { predictions: [] }
			});
		});

		it('should use existing address1 when provided', async () => {
			const mockResponse = {
				status: 200,
				data: {
					predictions: [
						{ id: '1', address: '123 Main St, City', address1: 'Custom Address1' }
					]
				}
			};

			domainRequest.mockResolvedValue(mockResponse);

			const result = await searchAddress('test address', 'test.com');

			expect(result.data.predictions[0].address1).toBe('Custom Address1');
		});

		it('should handle prediction without address property', async () => {
			const mockResponse = {
				status: 200,
				data: {
					predictions: [{ id: '1' }]
				}
			};

			domainRequest.mockResolvedValue(mockResponse);

			const result = await searchAddress('test address', 'test.com');

			expect(result.data.predictions[0]).toEqual({
				id: '1',
				value: undefined,
				address1: undefined
			});
		});

		it('should handle null predictions array', async () => {
			const mockResponse = {
				status: 200,
				data: { predictions: null }
			};

			domainRequest.mockResolvedValue(mockResponse);

			const result = await searchAddress('test address', 'test.com');

			expect(result.data.predictions).toEqual([]);
		});
	});

	describe('getAddress', () => {
		it('should return error for empty id', async () => {
			const result = await getAddress('', 'test.com');

			expect(result).toEqual({
				status: 400,
				data: null
			});
			expect(domainRequest).not.toHaveBeenCalled();
		});

		it('should return error for null id', async () => {
			const result = await getAddress(null, 'test.com');

			expect(result).toEqual({
				status: 400,
				data: null
			});
			expect(domainRequest).not.toHaveBeenCalled();
		});

		it('should get address details by id', async () => {
			const mockResponse = {
				status: 200,
				data: {
					id: '1',
					address: '123 Main St, City, State, ZIP',
					components: {
						street_number: '123',
						street_name: 'Main St',
						city: 'City',
						state: 'State',
						postal_code: 'ZIP'
					}
				}
			};

			domainRequest.mockResolvedValue(mockResponse);

			const result = await getAddress('1', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('addresses/1', 'test.com', {
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result).toEqual({
				status: 200,
				data: mockResponse.data
			});
		});

		it('should handle API error', async () => {
			domainRequest.mockResolvedValue({
				status: 404,
				data: { error: 'Address not found' }
			});

			const result = await getAddress('999', 'test.com');

			expect(result).toEqual({
				status: 404,
				data: null
			});
		});

		it('should handle network error', async () => {
			domainRequest.mockRejectedValue(new Error('Network error'));

			const result = await getAddress('1', 'test.com');

			expect(result).toEqual({
				status: 500,
				data: null
			});
		});
	});
});
