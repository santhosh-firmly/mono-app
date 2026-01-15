import { json } from '@sveltejs/kit';
import { getAgreementConfig, updateAgreementConfig } from '$lib/server/merchant.js';

/**
 * GET /admin/merchants/[domain]/agreement/api
 * Get the agreement configuration for a merchant.
 */
export async function GET({ params, platform }) {
	const { domain } = params;

	try {
		const config = await getAgreementConfig({
			platform,
			merchantDomain: domain
		});

		return json(config);
	} catch (error) {
		console.error('Error getting agreement config:', error);
		return json({ error: 'Failed to get agreement config' }, { status: 500 });
	}
}

/**
 * PUT /admin/merchants/[domain]/agreement/api
 * Update the agreement configuration for a merchant.
 * Supports JSON body for markdown or multipart/form-data for PDF upload.
 */
export async function PUT({ locals, params, platform, request }) {
	const authInfo = locals.authInfo;
	const userId = authInfo?.oid || authInfo?.sub || 'admin';
	const email = authInfo?.preferred_username || authInfo?.email || 'admin@firmly.ai';
	const { domain } = params;

	try {
		const contentType = request.headers.get('content-type') || '';

		let body;
		let pdfKey = null;

		if (contentType.includes('multipart/form-data')) {
			// Handle PDF upload
			const formData = await request.formData();
			const pdfFile = formData.get('pdf');
			const configData = formData.get('config');

			body = configData ? JSON.parse(configData) : {};

			if (pdfFile && pdfFile instanceof File) {
				// Upload PDF to R2
				const AGREEMENTS = platform?.env?.AGREEMENTS;
				if (!AGREEMENTS) {
					return json({ error: 'Agreements storage not configured' }, { status: 500 });
				}

				// Generate unique key for the PDF
				pdfKey = `${domain}/agreement-${Date.now()}.pdf`;

				// Upload to R2
				await AGREEMENTS.put(pdfKey, pdfFile.stream(), {
					httpMetadata: {
						contentType: 'application/pdf'
					}
				});

				body.pdfKey = pdfKey;
			}
		} else {
			// Handle JSON body (for markdown or default)
			body = await request.json();
		}

		const { contentType: agreementContentType, markdownContent, externallySigned } = body;

		// Validate content type
		if (!['default', 'markdown', 'pdf'].includes(agreementContentType)) {
			return json({ error: 'Invalid content type' }, { status: 400 });
		}

		// For PDF type, require pdfKey
		if (agreementContentType === 'pdf' && !body.pdfKey) {
			return json({ error: 'PDF file is required for PDF content type' }, { status: 400 });
		}

		const result = await updateAgreementConfig({
			platform,
			merchantDomain: domain,
			contentType: agreementContentType,
			markdownContent: agreementContentType === 'markdown' ? markdownContent : null,
			pdfKey: agreementContentType === 'pdf' ? body.pdfKey : null,
			externallySigned: externallySigned || false,
			actor: { id: userId, email }
		});

		if (!result.success) {
			return json(
				{ error: result.error || 'Failed to update agreement config' },
				{ status: 500 }
			);
		}

		return json({
			success: true,
			contentType: agreementContentType,
			pdfKey: body.pdfKey || null,
			externallySigned: externallySigned || false
		});
	} catch (error) {
		console.error('Error updating agreement config:', error);
		return json({ error: 'Failed to update agreement config' }, { status: 500 });
	}
}

/**
 * DELETE /admin/merchants/[domain]/agreement/api
 * Delete the custom agreement and reset to default.
 */
export async function DELETE({ locals, params, platform }) {
	const authInfo = locals.authInfo;
	const userId = authInfo?.oid || authInfo?.sub || 'admin';
	const email = authInfo?.preferred_username || authInfo?.email || 'admin@firmly.ai';
	const { domain } = params;

	try {
		// Get current config to check if there's a PDF to delete
		const currentConfig = await getAgreementConfig({
			platform,
			merchantDomain: domain
		});

		// Delete PDF from R2 if exists
		if (currentConfig.pdfKey) {
			const AGREEMENTS = platform?.env?.AGREEMENTS;
			if (AGREEMENTS) {
				try {
					await AGREEMENTS.delete(currentConfig.pdfKey);
				} catch (deleteError) {
					console.error('Error deleting PDF from R2:', deleteError);
					// Continue even if delete fails
				}
			}
		}

		// Reset to default
		const result = await updateAgreementConfig({
			platform,
			merchantDomain: domain,
			contentType: 'default',
			actor: { id: userId, email }
		});

		if (!result.success) {
			return json(
				{ error: result.error || 'Failed to reset agreement config' },
				{ status: 500 }
			);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error resetting agreement config:', error);
		return json({ error: 'Failed to reset agreement config' }, { status: 500 });
	}
}
