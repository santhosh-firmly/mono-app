import { json } from '@sveltejs/kit';
import { merchants as data } from '$lib/assets/merchants-data.json';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, params }) {
	try {
		const updatedMerchant = await request.json();
		const { domain } = params;

		// Verify that the merchant exists and matches the domain parameter
		if (updatedMerchant.store_id !== domain) {
			return json({ success: false, message: 'Invalid merchant ID' }, { status: 400 });
		}

		// Find the merchant in the data array
		const index = data.findIndex((m) => m.store_id === domain);

		if (index === -1) {
			return json({ success: false, message: 'Merchant not found' }, { status: 404 });
		}

		// In a real application, this would update the data in a database
		// For this demo, we're just returning success

		return json({ success: true, message: 'Merchant updated successfully' });
	} catch (err) {
		console.error('Error updating merchant:', err);
		return json({ success: false, message: 'Failed to update merchant' }, { status: 500 });
	}
}
