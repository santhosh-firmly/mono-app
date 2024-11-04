import { redirect } from '@sveltejs/kit';

export async function load() {
	// Redirect to the market place landing page.
	throw redirect(302, '/mk');
}
