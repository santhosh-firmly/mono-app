import { SessionBuffer } from './durable-objects/session-buffer.js';
import { handleSessions } from './routes/sessions.js';
import { handleSessionById } from './routes/session-by-id.js';
import { CORS_HEADERS } from './constants/cors.js';

export { SessionBuffer };

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: CORS_HEADERS });
		}

		if (url.pathname === '/api/sessions' || url.pathname === '/api/sessions/') {
			return handleSessions(request, env);
		}

		const sessionIdMatch = url.pathname.match(/^\/api\/sessions\/([^\/]+)\/?$/);
		if (sessionIdMatch) {
			return handleSessionById(request, env, sessionIdMatch[1]);
		}

		return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
	}
};
