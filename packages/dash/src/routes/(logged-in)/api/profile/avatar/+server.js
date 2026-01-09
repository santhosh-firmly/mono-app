import { json, error } from '@sveltejs/kit';
import { updateProfile } from '$lib/server/user.js';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * GET /api/profile/avatar
 * Serve avatar image with authentication.
 * Only serves the current user's avatar (no userId param to prevent IDOR).
 */
export async function GET({ locals, platform }) {
	const { userId } = locals.session;

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

/**
 * POST /api/profile/avatar
 * Upload a new avatar image.
 * Expects multipart/form-data with 'avatar' file field.
 */
export async function POST({ locals, request, platform }) {
	const { userId } = locals.session;

	const AVATARS = platform?.env?.AVATARS;
	if (!AVATARS) {
		throw error(500, 'Avatar storage not configured');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('avatar');

		if (!file || !(file instanceof File)) {
			throw error(400, 'No avatar file provided');
		}

		// Validate file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			throw error(400, 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			throw error(400, 'File too large. Maximum size is 2 MB');
		}

		// Read file as ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();

		// Upload to R2
		const key = `avatars/${userId}.webp`;
		await AVATARS.put(key, arrayBuffer, {
			httpMetadata: {
				contentType: 'image/webp'
			}
		});

		// Update profile to indicate avatar exists
		await updateProfile({ platform, userId, profile: { hasAvatar: true } });

		return json({ success: true });
	} catch (err) {
		if (err.status) throw err;
		console.error('Error uploading avatar:', err);
		throw error(500, 'Failed to upload avatar');
	}
}

/**
 * DELETE /api/profile/avatar
 * Remove the current user's avatar.
 */
export async function DELETE({ locals, platform }) {
	const { userId } = locals.session;

	const AVATARS = platform?.env?.AVATARS;
	if (!AVATARS) {
		throw error(500, 'Avatar storage not configured');
	}

	try {
		const key = `avatars/${userId}.webp`;
		await AVATARS.delete(key);

		// Update profile to indicate no avatar
		await updateProfile({ platform, userId, profile: { hasAvatar: false } });

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting avatar:', err);
		throw error(500, 'Failed to delete avatar');
	}
}
