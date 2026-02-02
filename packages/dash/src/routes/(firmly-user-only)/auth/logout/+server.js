import { redirect } from '@sveltejs/kit';

export async function GET({ cookies, platform }) {
	cookies.delete(platform.env.FIRMLY_AUTH_COOKIE, { path: '/' });
	cookies.delete('fuser_refresh', { path: '/' });

	throw redirect(302, '/');
}
