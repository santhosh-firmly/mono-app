import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSessions } from './sessions.js';
import { SaveSessionUseCase } from '../usecases/save-session.js';
import { ListSessionsUseCase } from '../usecases/list-sessions.js';
import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';
import { SessionBufferAdapter } from '../adapters/session-buffer-adapter.js';

// Mock the dependencies
vi.mock('../usecases/save-session.js');
vi.mock('../usecases/list-sessions.js');
vi.mock('../adapters/session-persistence-adapter.js');
vi.mock('../adapters/session-buffer-adapter.js');
vi.mock('../middleware/error-handler.js', () => ({
	withErrorHandling: vi.fn((handler) => handler)
}));

// Import after mocking
describe('handleSessions', () => {
	let mockSaveUseCase, mockListUseCase;

	beforeEach(() => {
		mockSaveUseCase = { execute: vi.fn() };
		mockListUseCase = { execute: vi.fn() };
		SaveSessionUseCase.mockReturnValue(mockSaveUseCase);
		ListSessionsUseCase.mockReturnValue(mockListUseCase);
		SessionPersistenceAdapter.mockReturnValue({});
		SessionBufferAdapter.mockReturnValue({});
	});

	it('should return 405 for unsupported methods', async () => {
		const request = { method: 'PUT' };
		const env = {};

		const response = await handleSessions(request, env);
		expect(response.status).toBe(405);
	});

	describe('POST', () => {
		it('should save session successfully', async () => {
			const request = {
				method: 'POST',
				json: vi.fn().mockResolvedValue({
					sessionId: '123',
				events: [{ type: 1 }],
				finalize: false
				})
			};
			const env = { SESSION_RECORDER: {} };
			const mockResult = { sessionId: '123', success: true };
			mockSaveUseCase.execute.mockResolvedValue(mockResult);

			const response = await handleSessions(request, env);
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body).toEqual(mockResult);
			expect(mockSaveUseCase.execute).toHaveBeenCalledWith('123', [{ type: 1 }], false);
		});

		it('should throw MissingParameterError for missing sessionId', async () => {
			const request = {
				method: 'POST',
				json: vi.fn().mockResolvedValue({
					events: [{ type: 1 }]
				})
			};
			const env = {};

			const { MissingParameterError } = await import('../errors/index.js');
			await expect(handleSessions(request, env)).rejects.toThrow(MissingParameterError);
		});
	});

	describe('GET', () => {
		it('should list sessions with default params', async () => {
			const request = {
				method: 'GET',
				url: 'http://example.com/sessions'
			};
			const env = {};
			const mockResult = { sessions: [], count: 0 };
			mockListUseCase.execute.mockResolvedValue(mockResult);

			const response = await handleSessions(request, env);
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body).toEqual(mockResult);
			expect(mockListUseCase.execute).toHaveBeenCalledWith(50, 0);
		});

		it('should list sessions with custom params', async () => {
			const request = {
				method: 'GET',
				url: 'http://example.com/sessions?limit=10&offset=5'
			};
			const env = {};
			const mockResult = { sessions: [], count: 0 };
			mockListUseCase.execute.mockResolvedValue(mockResult);

			const response = await handleSessions(request, env);
			expect(mockListUseCase.execute).toHaveBeenCalledWith(10, 5);
		});

		it('should throw InvalidRequestError for invalid limit', async () => {
			const request = {
				method: 'GET',
				url: 'http://example.com/sessions?limit=invalid'
			};
			const env = {};

			const { InvalidRequestError } = await import('../errors/index.js');
			await expect(handleSessions(request, env)).rejects.toThrow(InvalidRequestError);
		});
	});
});
