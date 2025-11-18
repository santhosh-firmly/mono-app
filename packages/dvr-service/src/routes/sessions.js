import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';
import { SessionBufferAdapter } from '../adapters/session-buffer-adapter.js';
import { SaveSessionUseCase } from '../usecases/save-session.js';
import { ListSessionsUseCase } from '../usecases/list-sessions.js';
import {
	MissingParameterError,
	InvalidSessionDataError,
	InvalidRequestError
} from '../errors/index.js';
import { CORS_HEADERS } from '../constants/cors.js';
import { withErrorHandling } from '../middleware/error-handler.js';

export const handleSessions = withErrorHandling(async (request, env) => {
	if (request.method === 'POST') {
		return handlePost(request, env);
	}

	if (request.method === 'GET') {
		return handleGet(request, env);
	}

	return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
});

async function handlePost(request, env) {
	const { sessionId, events, finalize } = await request.json();

	if (!sessionId) {
		throw new MissingParameterError('sessionId');
	}

	if (!finalize && (!events || !Array.isArray(events) || events.length === 0)) {
		throw new InvalidSessionDataError('events must be a non-empty array');
	}

	if (finalize && (!events || !Array.isArray(events))) {
		throw new InvalidSessionDataError('events must be an array');
	}

	const platform = { env };
	const persistenceAdapter = new SessionPersistenceAdapter(platform);
	const bufferAdapter = new SessionBufferAdapter(env.SESSION_RECORDER);
	const useCase = new SaveSessionUseCase(persistenceAdapter, bufferAdapter);

	const result = await useCase.execute(sessionId, events, finalize);

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
	});
}

async function handleGet(request, env) {
	const url = new URL(request.url);
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = parseInt(url.searchParams.get('offset') || '0');

	if (isNaN(limit) || limit < 1 || limit > 1000) {
		throw new InvalidRequestError('limit must be between 1 and 1000');
	}

	if (isNaN(offset) || offset < 0) {
		throw new InvalidRequestError('offset must be 0 or greater');
	}

	const platform = { env };
	const persistenceAdapter = new SessionPersistenceAdapter(platform);
	const useCase = new ListSessionsUseCase(persistenceAdapter);
	const result = await useCase.execute(limit, offset);

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
	});
}
