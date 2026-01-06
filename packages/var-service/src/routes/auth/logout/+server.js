import { redirect } from '@sveltejs/kit';

export async function GET({ cookies, platform }) {
	cookies.set(platform.env.FIRMLY_AUTH_COOKIE, '', {
		path: '/',
		maxAge: 0,
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	});

	throw redirect(302, '/');
}
