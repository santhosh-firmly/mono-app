import { json } from '@sveltejs/kit';
import { SessionPersistenceAdapter } from '$lib/server/adapters/session-persistence-adapter.js';
import { GetSessionUseCase } from '$lib/server/usecases/get-session.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

export async function GET({ params, platform }) {
	const { id } = params;

	try {
		const persistenceAdapter = new SessionPersistenceAdapter(platform);
		const useCase = new GetSessionUseCase(persistenceAdapter);
		const result = await useCase.execute(id);

		return json(result, { headers: CORS_HEADERS });
	} catch (error) {
		console.error('Get session error:', error);

		if (error.message === 'Session not found') {
			return json({ error: 'Session not found' }, { status: 404, headers: CORS_HEADERS });
		}

		return json({ error: 'Failed to fetch session' }, { status: 500, headers: CORS_HEADERS });
	}
}

export async function OPTIONS() {
	return new Response(null, { headers: CORS_HEADERS });
}
