import { redirect } from '@sveltejs/kit';

export async function GET({ cookies, platform, url }) {
	cookies.set(platform.env.FIRMLY_AUTH_COOKIE, '', {
		path: '/',
		maxAge: 0,
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax'
	});

	throw redirect(302, '/');
}
