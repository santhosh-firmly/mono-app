import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jose library before importing the module
vi.mock('jose', () => ({
	createRemoteJWKSet: vi.fn(() => ({})),
	jwtVerify: vi.fn()
}));

import { jwtVerify } from 'jose';
import { enforceSSOAuth } from './ms-auth.js';

describe('enforceSSOAuth', () => {
	const mockTenantId = 'test-tenant-id';
	const mockClientId = 'test-client-id';
	const mockJwt = 'mock.jwt.token';
	const mockPayload = { sub: 'user123', name: 'Test User', email: 'test@example.com' };

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should successfully verify a valid JWT and return auth info', async () => {
		jwtVerify.mockResolvedValue({ payload: mockPayload });

		const result = await enforceSSOAuth(mockJwt, {
			azureTenantId: mockTenantId,
			azureClientId: mockClientId
		});

		expect(jwtVerify).toHaveBeenCalledWith(
			mockJwt,
			{},
			{
				issuer: 'https://login.microsoftonline.com/test-tenant-id/v2.0',
				audience: mockClientId
			}
		);
		expect(result).toEqual({ authInfo: mockPayload });
	});

	it('should throw an error for invalid JWT', async () => {
		const mockError = new Error('Invalid JWT');
		jwtVerify.mockRejectedValue(mockError);

		await expect(
			enforceSSOAuth(mockJwt, {
				azureTenantId: mockTenantId,
				azureClientId: mockClientId
			})
		).rejects.toThrow('Invalid JWT');
	});

	it('should verify JWT with correct issuer and audience', async () => {
		const customTenantId = 'custom-tenant-123';
		const customClientId = 'custom-client-456';

		jwtVerify.mockResolvedValue({ payload: mockPayload });

		await enforceSSOAuth(mockJwt, {
			azureTenantId: customTenantId,
			azureClientId: customClientId
		});

		expect(jwtVerify).toHaveBeenCalledWith(
			mockJwt,
			{},
			{
				issuer: 'https://login.microsoftonline.com/custom-tenant-123/v2.0',
				audience: customClientId
			}
		);
	});
});
