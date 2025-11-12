import { json } from '@sveltejs/kit';
import {
	saveSessionToR2,
	appendEventsToR2,
	getSessionFromR2,
	getSessionMetadata,
	createSessionMetadata,
	updateSessionMetadata,
	addToSessionList,
	updateInSessionList,
	listSessionMetadata,
	calculateSessionMetadata
} from '$lib/utils/storage.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

async function createNewSession(platform, sessionId, events) {
	const metadataFields = calculateSessionMetadata(events);

	const metadata = {
		sessionId,
		...metadataFields,
		createdAt: new Date().toISOString()
	};

	await saveSessionToR2(platform, sessionId, events);
	await createSessionMetadata(platform, metadata);
	await addToSessionList(platform, metadata);

	return { sessionId, message: 'Session created successfully' };
}

async function appendToSession(platform, sessionId, events) {
	const { totalEventCount, allEvents } = await appendEventsToR2(platform, sessionId, events);
	const updatedFields = calculateSessionMetadata(allEvents);

	const updates = {
		duration: updatedFields.duration,
		eventCount: totalEventCount,
		url: updatedFields.url,
		updatedAt: new Date().toISOString()
	};

	await Promise.all([
		updateSessionMetadata(platform, sessionId, updates),
		updateInSessionList(platform, sessionId, updates)
	]);

	return { sessionId, message: 'Session updated successfully' };
}

export async function POST({ request, platform }) {
	const { sessionId, events } = await request.json();

	if (!sessionId) {
		return json({ error: 'sessionId is required' }, { status: 400 });
	}

	if (!events || !Array.isArray(events) || events.length === 0) {
		return json({ error: 'Invalid events data' }, { status: 400 });
	}

	try {
		const existingMetadata = await getSessionMetadata(platform, sessionId);
		const isNewSession = !existingMetadata;

		const result = isNewSession
			? await createNewSession(platform, sessionId, events)
			: await appendToSession(platform, sessionId, events);

		return json(result, { headers: CORS_HEADERS });
	} catch (error) {
		console.error('Session save error:', error);
		return json(
			{ error: error.message || 'Failed to save session' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}

export async function GET({ platform, url }) {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	try {
		const sessions = await listSessionMetadata(platform, limit, offset);
		return json({ sessions, count: sessions.length }, { headers: CORS_HEADERS });
	} catch (error) {
		console.error('Session list error:', error);
		return json({ error: 'Failed to fetch sessions' }, { status: 500, headers: CORS_HEADERS });
	}
}

export async function OPTIONS() {
	return new Response(null, { headers: CORS_HEADERS });
}
