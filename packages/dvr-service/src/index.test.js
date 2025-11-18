import { describe, it, expect, vi } from 'vitest';
import handler from './index.js';
import { handleSessions } from './routes/sessions.js';
import { handleSessionById } from './routes/session-by-id.js';

// Mock the route handlers
vi.mock('./routes/sessions.js');
vi.mock('./routes/session-by-id.js');

describe('Routing Handler', () => {
	it('should handle OPTIONS requests with CORS headers', async () => {
		const request = new Request('http://example.com/api/sessions', {
			method: 'OPTIONS'
		});
		const env = {};
		const ctx = {};

		const response = await handler.fetch(request, env, ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
	});

	it('should route /api/sessions to handleSessions', async () => {
		const request = new Request('http://example.com/api/sessions', {
			method: 'GET'
		});
		const env = { test: 'env' };
		const ctx = {};
		const mockResponse = new Response('sessions response');
		handleSessions.mockResolvedValue(mockResponse);

		const response = await handler.fetch(request, env, ctx);
		expect(handleSessions).toHaveBeenCalledWith(request, env);
		expect(response).toBe(mockResponse);
	});

	it('should route /api/sessions/ to handleSessions', async () => {
		const request = new Request('http://example.com/api/sessions/', {
			method: 'POST'
		});
		const env = {};
		const ctx = {};
		const mockResponse = new Response('sessions response');
		handleSessions.mockResolvedValue(mockResponse);

		const response = await handler.fetch(request, env, ctx);
		expect(handleSessions).toHaveBeenCalledWith(request, env);
		expect(response).toBe(mockResponse);
	});

	it('should route /api/sessions/{sessionId} to handleSessionById', async () => {
		const request = new Request('http://example.com/api/sessions/123', {
			method: 'GET'
		});
		const env = {};
		const ctx = {};
		const mockResponse = new Response('session response');
		handleSessionById.mockResolvedValue(mockResponse);

		const response = await handler.fetch(request, env, ctx);
		expect(handleSessionById).toHaveBeenCalledWith(request, env, '123');
		expect(response).toBe(mockResponse);
	});

	it('should route /api/sessions/{sessionId}/ to handleSessionById', async () => {
		const request = new Request('http://example.com/api/sessions/abc/', {
			method: 'GET'
		});
		const env = {};
		const ctx = {};
		const mockResponse = new Response('session response');
		handleSessionById.mockResolvedValue(mockResponse);

		const response = await handler.fetch(request, env, ctx);
		expect(handleSessionById).toHaveBeenCalledWith(request, env, 'abc');
		expect(response).toBe(mockResponse);
	});

	it('should return 404 for unknown routes', async () => {
		const request = new Request('http://example.com/api/unknown', {
			method: 'GET'
		});
		const env = {};
		const ctx = {};

		const response = await handler.fetch(request, env, ctx);
		expect(response.status).toBe(404);
		expect(await response.text()).toBe('Not Found');
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});

	it('should return 404 for nested paths under sessions', async () => {
		const request = new Request('http://example.com/api/sessions/123/extra', {
			method: 'GET'
		});
		const env = {};
		const ctx = {};

		const response = await handler.fetch(request, env, ctx);
		expect(response.status).toBe(404);
	});
});
