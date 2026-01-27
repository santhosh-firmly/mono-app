/**
 * JWE (JSON Web Encryption) utilities for secure payload encryption.
 * @module utils/jwe
 */

import { importJWK, CompactEncrypt } from 'foundation/auth/ext-jose.js';

/**
 * Imports a JWK (JSON Web Key) for RSA-OAEP-256 encryption.
 * @param {Object} jwkKey - The JWK object to import
 * @returns {Promise<CryptoKey>} The imported crypto key
 */
export async function importJWKKey(jwkKey) {
	return importJWK(jwkKey, 'RSA-OAEP-256');
}

/**
 * Encrypts a payload using JWE compact serialization with RSA-OAEP-256 and A256GCM.
 * @param {Object} payload - The data to encrypt
 * @param {CryptoKey} publicKey - The RSA public key for encryption
 * @param {string} [kid] - Optional key ID to include in the JWE header
 * @returns {Promise<string>} The encrypted JWE compact serialization string
 */
export async function encryptPayload(payload, publicKey, kid) {
	const jweConfig = { alg: 'RSA-OAEP-256', enc: 'A256GCM' };

	if (kid) {
		jweConfig.kid = kid;
	}

	return new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
		.setProtectedHeader(jweConfig)
		.encrypt(publicKey);
}
