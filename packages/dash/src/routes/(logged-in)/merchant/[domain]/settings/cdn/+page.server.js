import { redirect } from '@sveltejs/kit';

/**
 * Load function for CDN settings page.
 * Only owners and Firmly admins can access this page.
 */
export async function load({ parent, params }) {
	const { userRole, isFirmlyAdmin } = await parent();

	if (!isFirmlyAdmin && userRole !== 'owner') {
		redirect(303, `/merchant/${params.domain}`);
	}

	return {};
}
