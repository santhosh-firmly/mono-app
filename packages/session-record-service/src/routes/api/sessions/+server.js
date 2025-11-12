import { json } from '@sveltejs/kit';
import { CloudflareSessionRepository } from '$lib/server/adapters/cloudflare-session-repository.js';
import { SaveSessionUseCase } from '$lib/server/usecases/save-session.js';
import { ListSessionsUseCase } from '$lib/server/usecases/list-sessions.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export async function POST({ request, platform }) {
	const { sessionId, events } = await request.json();

	if (!sessionId) {
		return json({ error: 'sessionId is required' }, { status: 400 });
	}

	if (!events || !Array.isArray(events) || events.length === 0) {
		return json({ error: 'Invalid events data' }, { status: 400 });
	}

	try {
		const repository = new CloudflareSessionRepository(platform);
		const useCase = new SaveSessionUseCase(repository);
		const result = await useCase.execute(sessionId, events);

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
		const repository = new CloudflareSessionRepository(platform);
		const useCase = new ListSessionsUseCase(repository);
		const result = await useCase.execute(limit, offset);

		return json(result, { headers: CORS_HEADERS });
	} catch (error) {
		console.error('Session list error:', error);
		return json({ error: 'Failed to fetch sessions' }, { status: 500, headers: CORS_HEADERS });
	}
}

export async function OPTIONS() {
	return new Response(null, { headers: CORS_HEADERS });
}
