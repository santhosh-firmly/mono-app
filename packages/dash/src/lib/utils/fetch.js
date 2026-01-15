import { adminMode } from '$lib/stores/admin-mode.svelte.js';

/**
 * Fetch wrapper that automatically includes the admin_mode param
 * when the user is in admin mode. Use this instead of native fetch()
 * for API calls that need to respect admin mode.
 *
 * @param {string | URL | Request} input - The URL or Request object
 * @param {RequestInit} [init] - Optional fetch init options
 * @returns {Promise<Response>}
 */
export async function adminFetch(input, init) {
	// If input is a string or URL, modify it to include admin_mode
	if (typeof input === 'string') {
		input = adminMode.buildUrl(input);
	} else if (input instanceof URL) {
		input = adminMode.buildUrl(input.toString());
	}
	// Note: Request objects are not modified - use string URLs for admin mode support

	return fetch(input, init);
}
