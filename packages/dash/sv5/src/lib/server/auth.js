import { createRemoteJWKSet, jwtVerify } from "jose";
import { PUBLIC_AZURE_AD_TENANT_ID, PUBLIC_AZURE_AD_CLIENT_ID } from '$env/static/public';

const MICROSOFT_KEYS_ENDPOINT = 'https://login.microsoftonline.com/common/discovery/v2.0/keys';

export async function enforceSSOAuth(jwt) {
    const jwks = createRemoteJWKSet(new URL(MICROSOFT_KEYS_ENDPOINT));

    const { payload } = await jwtVerify(jwt, jwks, {
        issuer: `https://login.microsoftonline.com/${PUBLIC_AZURE_AD_TENANT_ID}/v2.0`,
        audience: PUBLIC_AZURE_AD_CLIENT_ID,
    });

    return {
        authInfo: payload
    };
}
