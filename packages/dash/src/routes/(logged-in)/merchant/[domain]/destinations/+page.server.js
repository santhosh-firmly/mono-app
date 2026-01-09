import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const parentData = await parent();
	const { kybStatus, isFirmlyAdmin, domain } = parentData;

	// Firmly admins always have access
	if (isFirmlyAdmin) {
		return {};
	}

	// Check if KYB is approved
	if (kybStatus.kyb_status !== 'approved') {
		// Redirect to settings page where KYB status is shown
		redirect(303, `/merchant/${domain}/settings`);
	}

	return {};
}
