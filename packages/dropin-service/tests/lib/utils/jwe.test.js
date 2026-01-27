import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('foundation/auth/ext-jose.js', () => ({
	importJWK: vi.fn(),
	CompactEncrypt: vi.fn()
}));

import { importJWKKey, encryptPayload } from '$lib/utils/jwe.js';
import { importJWK, CompactEncrypt } from 'foundation/auth/ext-jose.js';

describe('jwe utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('importJWKKey', () => {
		it('imports JWK key with RSA-OAEP-256 algorithm', async () => {
			const mockKey = { kty: 'RSA', n: 'test', e: 'AQAB' };
			const mockImportedKey = { type: 'public' };

			importJWK.mockResolvedValue(mockImportedKey);

			const result = await importJWKKey(mockKey);

			expect(importJWK).toHaveBeenCalledWith(mockKey, 'RSA-OAEP-256');
			expect(result).toBe(mockImportedKey);
		});
	});

	describe('encryptPayload', () => {
		it('encrypts payload with public key', async () => {
			const payload = { data: 'test-data' };
			const publicKey = { type: 'public' };
			const mockEncrypted = 'encrypted-jwe-string';

			const mockEncrypt = vi.fn().mockResolvedValue(mockEncrypted);
			const mockSetProtectedHeader = vi.fn().mockReturnThis();

			CompactEncrypt.mockImplementation(() => ({
				setProtectedHeader: mockSetProtectedHeader,
				encrypt: mockEncrypt
			}));

			const result = await encryptPayload(payload, publicKey);

			expect(CompactEncrypt).toHaveBeenCalled();
			const constructorArgs = CompactEncrypt.mock.calls[0][0];
			const decodedPayload = new TextDecoder().decode(constructorArgs);
			expect(JSON.parse(decodedPayload)).toEqual(payload);

			expect(mockSetProtectedHeader).toHaveBeenCalledWith({
				alg: 'RSA-OAEP-256',
				enc: 'A256GCM'
			});
			expect(mockEncrypt).toHaveBeenCalledWith(publicKey);
			expect(result).toBe(mockEncrypted);
		});

		it('includes kid in protected header when provided', async () => {
			const payload = { data: 'test-data' };
			const publicKey = { type: 'public' };
			const kid = 'key-id-123';
			const mockEncrypted = 'encrypted-jwe-string';

			const mockEncrypt = vi.fn().mockResolvedValue(mockEncrypted);
			const mockSetProtectedHeader = vi.fn().mockReturnThis();

			CompactEncrypt.mockImplementation(() => ({
				setProtectedHeader: mockSetProtectedHeader,
				encrypt: mockEncrypt
			}));

			const result = await encryptPayload(payload, publicKey, kid);

			expect(mockSetProtectedHeader).toHaveBeenCalledWith({
				alg: 'RSA-OAEP-256',
				enc: 'A256GCM',
				kid: 'key-id-123'
			});
			expect(result).toBe(mockEncrypted);
		});

		it('does not include kid when not provided', async () => {
			const payload = { data: 'test-data' };
			const publicKey = { type: 'public' };
			const mockEncrypted = 'encrypted-jwe-string';

			const mockEncrypt = vi.fn().mockResolvedValue(mockEncrypted);
			const mockSetProtectedHeader = vi.fn().mockReturnThis();

			CompactEncrypt.mockImplementation(() => ({
				setProtectedHeader: mockSetProtectedHeader,
				encrypt: mockEncrypt
			}));

			await encryptPayload(payload, publicKey, null);

			expect(mockSetProtectedHeader).toHaveBeenCalledWith({
				alg: 'RSA-OAEP-256',
				enc: 'A256GCM'
			});
		});

		it('properly encodes payload as JSON', async () => {
			const payload = {
				user: 'john',
				email: 'john@example.com',
				nested: {
					value: 123
				}
			};
			const publicKey = { type: 'public' };

			const mockEncrypt = vi.fn().mockResolvedValue('encrypted');
			const mockSetProtectedHeader = vi.fn().mockReturnThis();

			CompactEncrypt.mockImplementation(() => ({
				setProtectedHeader: mockSetProtectedHeader,
				encrypt: mockEncrypt
			}));

			await encryptPayload(payload, publicKey);

			const constructorArgs = CompactEncrypt.mock.calls[0][0];
			const decodedPayload = new TextDecoder().decode(constructorArgs);
			expect(JSON.parse(decodedPayload)).toEqual(payload);
		});
	});
});
