import { json } from '@sveltejs/kit';
import { getSessionFromR2, getSessionMetadata } from '$lib/utils/storage.js';

export async function GET({ params, platform }) {
	const { id } = params;

	const events = await getSessionFromR2(platform, id);

	if (!events) {
		return json({ error: 'Session not found' }, { status: 404 });
	}

	const metadata = await getSessionMetadata(platform, id);

	return json(
		{ sessionId: id, events, metadata },
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		}
	);
}

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
}
