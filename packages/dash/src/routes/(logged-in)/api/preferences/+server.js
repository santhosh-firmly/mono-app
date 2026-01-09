import { json } from '@sveltejs/kit';
import { getPreferences, updatePreferences } from '$lib/server/user.js';

/**
 * GET /api/preferences
 * Get the current user's preferences.
 */
export async function GET({ locals, platform }) {
	const { userId } = locals.session;

	const preferences = await getPreferences({ platform, userId });

	return json(preferences);
}

/**
 * PUT /api/preferences
 * Update the current user's preferences.
 * Accepts: { theme }
 */
export async function PUT({ request, locals, platform }) {
	const { userId } = locals.session;

	const updates = await request.json();

	// Validate allowed fields
	const allowedFields = ['theme'];
	const filteredUpdates = {};

	for (const field of allowedFields) {
		if (updates[field] !== undefined) {
			filteredUpdates[field] = updates[field];
		}
	}

	// Validate theme value
	if (filteredUpdates.theme !== undefined) {
		const validThemes = ['light', 'dark', 'system'];
		if (!validThemes.includes(filteredUpdates.theme)) {
			return json(
				{ error: 'Invalid theme value. Must be: light, dark, or system' },
				{ status: 400 }
			);
		}
	}

	if (Object.keys(filteredUpdates).length === 0) {
		return json({ error: 'No valid fields to update' }, { status: 400 });
	}

	const updatedPreferences = await updatePreferences({
		platform,
		userId,
		preferences: filteredUpdates
	});

	return json({
		success: true,
		preferences: updatedPreferences
	});
}
