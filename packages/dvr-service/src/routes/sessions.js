import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';
import { SessionBufferAdapter } from '../adapters/session-buffer-adapter.js';
import { SaveSessionUseCase } from '../usecases/save-session.js';
import { ListSessionsUseCase } from '../usecases/list-sessions.js';

export async function handleSessions(request, env, CORS_HEADERS) {
	if (request.method === 'POST') {
		return handlePost(request, env, CORS_HEADERS);
	}

	if (request.method === 'GET') {
		return handleGet(request, env, CORS_HEADERS);
	}

	return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
}

async function handlePost(request, env, CORS_HEADERS) {
	try {
		const { sessionId, events, finalize } = await request.json();

		if (!sessionId) {
			return new Response(
				JSON.stringify({ error: 'sessionId is required' }),
				{ status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
			);
		}

		if (!finalize && (!events || !Array.isArray(events) || events.length === 0)) {
			return new Response(
				JSON.stringify({ error: 'Invalid events data' }),
				{ status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
			);
		}

		if (finalize && (!events || !Array.isArray(events))) {
			return new Response(
				JSON.stringify({ error: 'events must be an array' }),
				{ status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
			);
		}

		const platform = { env };
		const persistenceAdapter = new SessionPersistenceAdapter(platform);
		const bufferAdapter = new SessionBufferAdapter(env.SESSION_RECORDER);
		const useCase = new SaveSessionUseCase(persistenceAdapter, bufferAdapter);

		const result = await useCase.execute(sessionId, events, finalize);

		return new Response(
			JSON.stringify(result),
			{ status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('Session save error:', error);
		return new Response(
			JSON.stringify({ error: error.message || 'Failed to save session' }),
			{ status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
		);
	}
}

async function handleGet(request, env, CORS_HEADERS) {
	try {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		const platform = { env };
		const persistenceAdapter = new SessionPersistenceAdapter(platform);
		const useCase = new ListSessionsUseCase(persistenceAdapter);
		const result = await useCase.execute(limit, offset);

		return new Response(
			JSON.stringify(result),
			{ status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('Session list error:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch sessions' }),
			{ status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
		);
	}
}
