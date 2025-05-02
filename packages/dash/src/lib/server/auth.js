import { createRemoteJWKSet, jwtVerify } from 'jose';

const MICROSOFT_KEYS_ENDPOINT = 'https://login.microsoftonline.com/common/discovery/v2.0/keys';

export async function enforceSSOAuth(jwt, { azureTenantId, azureClientId }) {
	const jwks = createRemoteJWKSet(new URL(MICROSOFT_KEYS_ENDPOINT));

	const { payload } = await jwtVerify(jwt, jwks, {
		issuer: `https://login.microsoftonline.com/${azureTenantId}/v2.0`,
		audience: azureClientId
	});

	return {
		authInfo: payload
	};
}
