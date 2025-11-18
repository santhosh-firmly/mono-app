import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';
import { GetSessionUseCase } from '../usecases/get-session.js';
import { MissingParameterError } from '../errors/index.js';
import { CORS_HEADERS } from '../constants/cors.js';
import { withErrorHandling } from '../middleware/error-handler.js';

export const handleSessionById = withErrorHandling(async (request, env, sessionId) => {
	if (request.method !== 'GET') {
		return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
	}

	if (!sessionId) {
		throw new MissingParameterError('sessionId');
	}

	const platform = { env };
	const persistenceAdapter = new SessionPersistenceAdapter(platform);
	const useCase = new GetSessionUseCase(persistenceAdapter);
	const result = await useCase.execute(sessionId);

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
	});
});
