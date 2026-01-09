import { error } from '@sveltejs/kit';

/**
 * GET /admin/api/users/[userId]/avatar
 * Serve any user's avatar for admin viewing.
 */
export async function GET({ params, locals, platform }) {
	const { authInfo } = locals;

	if (!authInfo?.oid) {
		throw error(401, 'Unauthorized');
	}

	const { userId } = params;

	const AVATARS = platform?.env?.AVATARS;
	if (!AVATARS) {
		throw error(500, 'Avatar storage not configured');
	}

	try {
		const key = `avatars/${userId}.webp`;
		const object = await AVATARS.get(key);

		if (!object) {
			throw error(404, 'Avatar not found');
		}

		const headers = new Headers();
		headers.set('Content-Type', 'image/webp');
		headers.set('Cache-Control', 'private, max-age=3600');
		headers.set('ETag', object.httpEtag);

		return new Response(object.body, { headers });
	} catch (err) {
		if (err.status === 404) throw err;
		console.error('Error fetching avatar:', err);
		throw error(500, 'Failed to fetch avatar');
	}
}
