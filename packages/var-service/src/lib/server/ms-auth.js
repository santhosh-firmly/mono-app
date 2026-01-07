import { createRemoteJWKSet, jwtVerify } from 'jose';

const MICROSOFT_KEYS_ENDPOINT = 'https://login.microsoftonline.com/common/discovery/v2.0/keys';
const jwks = createRemoteJWKSet(new URL(MICROSOFT_KEYS_ENDPOINT));

export async function enforceSSOAuth(jwt, { azureTenantId, azureClientId }) {
	const { payload } = await jwtVerify(jwt, jwks, {
		issuer: 'https://login.microsoftonline.com/' + azureTenantId + '/v2.0',
		audience: azureClientId
	});

	return {
		authInfo: payload
	};
}
