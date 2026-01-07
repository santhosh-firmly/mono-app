import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';

/**
 * GET /merchant/[domain]/settings/api/logo-proxy?url=...
 * Fetch an image from a URL and convert it to a base64 data URI.
 * Only accessible by owners and Firmly admins.
 */
export async function GET({ locals, params, platform, url }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Authorization check
		if (!isFirmlyAdmin) {
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const access = merchantAccess.find((a) => a.merchant_domain === domain);

			if (!access || access.role !== 'owner') {
				return json({ error: 'Only owners can modify settings' }, { status: 403 });
			}
		}

		// Get the image URL from query params
		const imageUrl = url.searchParams.get('url');

		if (!imageUrl) {
			return json({ error: 'URL parameter is required' }, { status: 400 });
		}

		// Validate URL
		let parsedUrl;
		try {
			parsedUrl = new URL(imageUrl);
		} catch {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Only allow http/https
		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			return json({ error: 'Only HTTP and HTTPS URLs are allowed' }, { status: 400 });
		}

		// Fetch the image
		const response = await fetch(imageUrl, {
			headers: {
				Accept: 'image/*',
				'User-Agent': 'Firmly-Logo-Fetcher/1.0'
			}
		});

		if (!response.ok) {
			return json(
				{ error: `Failed to fetch image: ${response.status} ${response.statusText}` },
				{ status: 400 }
			);
		}

		// Check content type
		const contentType = response.headers.get('content-type') || '';
		const validTypes = [
			'image/svg+xml',
			'image/png',
			'image/jpeg',
			'image/jpg',
			'image/gif',
			'image/webp'
		];
		const isValidType = validTypes.some((type) => contentType.includes(type));

		if (!isValidType) {
			return json(
				{ error: `Invalid content type: ${contentType}. Expected an image.` },
				{ status: 400 }
			);
		}

		// Get the image data
		const arrayBuffer = await response.arrayBuffer();
		const bytes = new Uint8Array(arrayBuffer);

		// Check file size (limit to 500KB)
		if (bytes.length > 500 * 1024) {
			return json({ error: 'Image too large. Maximum size is 500KB.' }, { status: 400 });
		}

		// Convert to base64
		let base64 = '';
		const chunkSize = 8192;
		for (let i = 0; i < bytes.length; i += chunkSize) {
			const chunk = bytes.slice(i, i + chunkSize);
			base64 += String.fromCharCode.apply(null, chunk);
		}
		base64 = btoa(base64);

		// Determine the mime type
		let mimeType = 'image/png';
		if (contentType.includes('svg')) {
			mimeType = 'image/svg+xml';
		} else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
			mimeType = 'image/jpeg';
		} else if (contentType.includes('gif')) {
			mimeType = 'image/gif';
		} else if (contentType.includes('webp')) {
			mimeType = 'image/webp';
		} else if (contentType.includes('png')) {
			mimeType = 'image/png';
		}

		const dataUri = `data:${mimeType};base64,${base64}`;

		return json({ dataUri });
	} catch (error) {
		console.error('Error fetching logo:', error);
		return json({ error: 'Failed to fetch image' }, { status: 500 });
	}
}
