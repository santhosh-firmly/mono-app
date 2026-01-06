import { redirect } from '@sveltejs/kit';

export async function GET({ cookies, platform }) {
	cookies.set(platform.env.FIRMLY_AUTH_COOKIE, '', {
		path: '/'
	});

	throw redirect(302, '/');
}
