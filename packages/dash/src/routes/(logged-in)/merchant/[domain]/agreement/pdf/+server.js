import { error } from '@sveltejs/kit';
import { getAgreementConfig } from '$lib/server/merchant.js';

/**
 * GET /merchant/[domain]/agreement/pdf
 * Serve the agreement PDF from R2 storage.
 */
export async function GET({ params, platform }) {
	const { domain } = params;

	try {
		// Get agreement config to find the PDF key
		const config = await getAgreementConfig({
			platform,
			merchantDomain: domain
		});

		if (config.contentType !== 'pdf' || !config.pdfKey) {
			throw error(404, 'No PDF agreement found');
		}

		// Fetch PDF from R2
		const AGREEMENTS = platform?.env?.AGREEMENTS;
		if (!AGREEMENTS) {
			throw error(500, 'Agreements storage not configured');
		}

		const object = await AGREEMENTS.get(config.pdfKey);

		if (!object) {
			throw error(404, 'Agreement PDF not found');
		}

		// Return the PDF with appropriate headers
		const headers = new Headers();
		headers.set('Content-Type', 'application/pdf');
		headers.set('Content-Disposition', `inline; filename="agreement.pdf"`);
		headers.set('Cache-Control', 'private, max-age=3600');

		return new Response(object.body, {
			status: 200,
			headers
		});
	} catch (err) {
		if (err.status) {
			throw err;
		}
		console.error('Error serving agreement PDF:', err);
		throw error(500, 'Failed to load agreement PDF');
	}
}
