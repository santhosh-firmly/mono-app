import { json } from '@sveltejs/kit';
import {
	generateSessionId,
	saveSessionToR2,
	saveSessionMetadata,
	listSessionMetadata
} from '$lib/utils/storage.js';

export async function POST({ request, platform }) {
	const { events } = await request.json();

	if (!events || !Array.isArray(events) || events.length === 0) {
		return json({ error: 'Invalid events data' }, { status: 400 });
	}

	const sessionId = generateSessionId();
	const firstEvent = events[0];
	const lastEvent = events[events.length - 1];

	const metadata = {
		sessionId,
		timestamp: firstEvent.timestamp || Date.now(),
		duration: lastEvent.timestamp - firstEvent.timestamp || 0,
		eventCount: events.length,
		url: events.find((e) => e.type === 4 && e.data?.href)?.data?.href || 'Unknown',
		createdAt: new Date().toISOString()
	};

	await saveSessionToR2(platform, sessionId, events);
	await saveSessionMetadata(platform, metadata);

	return json(
		{ sessionId, message: 'Session saved successfully' },
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		}
	);
}

export async function GET({ platform, url }) {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	const sessions = await listSessionMetadata(platform, limit, offset);

	return json(
		{ sessions, count: sessions.length },
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		}
	);
}

export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
}
