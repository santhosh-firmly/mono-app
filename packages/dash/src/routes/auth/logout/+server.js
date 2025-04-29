import { redirect } from '@sveltejs/kit';
import { FIRMLY_AUTH_COOKIE } from '$env/static/private';

export async function GET({ cookies }) {
	cookies.set(FIRMLY_AUTH_COOKIE, '', {
		path: '/'
	});

	throw redirect(302, '/');
}
