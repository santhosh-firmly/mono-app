import { error, redirect } from '@sveltejs/kit';
import { FIRMLY_AUTH_COOKIE } from '$env/static/private';
import { PUBLIC_AZURE_AD_TENANT_ID } from '$env/static/public';
import { compactVerify, createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';

export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/auth/') || event.url.href === 'http://sveltekit-prerender/[fallback]') {
        return resolve(event);
    }

    const jwt = event.cookies.get(FIRMLY_AUTH_COOKIE);
    if (jwt) {
        try {
            // const key = await createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${PUBLIC_AZURE_AD_TENANT_ID}/discovery/v2.0/keys`));
            // const key = await createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${PUBLIC_AZURE_AD_TENANT_ID}/discovery/keys`));
            // const { payload } = await compactVerify(jwt, key);
            // TODO: Finish JWT validation
            const payload = await decodeJwt(jwt);
            console.log('payload', payload);
            
            event.locals.authInfo = payload;
        } catch (e) {
            console.log('failed to validate JWT', e, jwt);
            throw error(401);
        }
        return resolve(event);
    }

    throw redirect(302, '/auth/sign-in');
}