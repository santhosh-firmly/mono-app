import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';
import { GetSessionUseCase } from '../usecases/get-session.js';

export async function handleSessionById(request, env, sessionId, CORS_HEADERS) {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
	}

	try {
		const platform = { env };
		const persistenceAdapter = new SessionPersistenceAdapter(platform);
		const useCase = new GetSessionUseCase(persistenceAdapter);
		const result = await useCase.execute(sessionId);

		return new Response(
			JSON.stringify(result),
			{ status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('Get session error:', error);

		if (error.message === 'Session not found') {
			return new Response(
				JSON.stringify({ error: 'Session not found' }),
				{ status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
			);
		}

		return new Response(
			JSON.stringify({ error: 'Failed to fetch session' }),
			{ status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
		);
	}
}
