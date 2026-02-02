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

/**
 * Refresh admin tokens using a Microsoft refresh token.
 * @param {Object} params
 * @param {string} params.refreshToken - The Microsoft refresh token
 * @param {string} params.tenantId - Azure AD tenant ID
 * @param {string} params.clientId - Azure AD client ID
 * @param {string} params.clientSecret - Azure AD client secret
 * @returns {Promise<{id_token: string, refresh_token: string, expires_in: number}|null>}
 */
export async function refreshAdminTokens({ refreshToken, tenantId, clientId, clientSecret }) {
	try {
		const response = await fetch(
			`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
			{
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					client_id: clientId,
					client_secret: clientSecret,
					refresh_token: refreshToken,
					scope: 'openid profile email offline_access'
				})
			}
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return {
			id_token: data.id_token,
			refresh_token: data.refresh_token,
			expires_in: data.expires_in
		};
	} catch {
		return null;
	}
}
