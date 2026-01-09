import { json } from '@sveltejs/kit';
import { getProfile, updateProfile } from '$lib/server/user.js';

/**
 * GET /api/profile
 * Get the current user's profile.
 */
export async function GET({ locals, platform }) {
	const { userId } = locals.session;

	const profile = await getProfile({ platform, userId });

	return json(profile);
}

/**
 * PUT /api/profile
 * Update the current user's profile.
 * Accepts: { name, company, title, location }
 */
export async function PUT({ request, locals, platform }) {
	const { userId } = locals.session;

	const updates = await request.json();

	// Validate allowed fields
	const allowedFields = ['name', 'company', 'title', 'location'];
	const filteredUpdates = {};

	for (const field of allowedFields) {
		if (updates[field] !== undefined) {
			// Sanitize string values
			filteredUpdates[field] = String(updates[field]).trim();
		}
	}

	if (Object.keys(filteredUpdates).length === 0) {
		return json({ error: 'No valid fields to update' }, { status: 400 });
	}

	const updatedProfile = await updateProfile({
		platform,
		userId,
		profile: filteredUpdates
	});

	return json({
		success: true,
		profile: updatedProfile
	});
}
