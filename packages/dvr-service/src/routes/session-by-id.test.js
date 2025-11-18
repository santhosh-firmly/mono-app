import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSessionById } from './session-by-id.js';
import { GetSessionUseCase } from '../usecases/get-session.js';
import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';

// Mock the dependencies
vi.mock('../usecases/get-session.js');
vi.mock('../adapters/session-persistence-adapter.js');
vi.mock('../middleware/error-handler.js', () => ({
	withErrorHandling: vi.fn((handler) => handler)
}));

// Import after mocking
describe('handleSessionById', () => {
	let mockUseCase;

	beforeEach(() => {
		mockUseCase = { execute: vi.fn() };
		GetSessionUseCase.mockReturnValue(mockUseCase);
		SessionPersistenceAdapter.mockReturnValue({});
	});

	it('should return 405 for non-GET methods', async () => {
		const request = { method: 'POST' };
		const env = {};
		const sessionId = '123';

		const response = await handleSessionById(request, env, sessionId);
		expect(response.status).toBe(405);
	});

	it('should throw MissingParameterError for missing sessionId', async () => {
		const request = { method: 'GET' };
		const env = {};
		const sessionId = null;

		const { MissingParameterError } = await import('../errors/index.js');
		await expect(handleSessionById(request, env, sessionId)).rejects.toThrow(MissingParameterError);
	});

	it('should return session data for valid GET request', async () => {
		const request = { method: 'GET' };
		const env = {};
		const sessionId = '123';
		const mockResult = { sessionId: '123', events: [], metadata: {} };
		mockUseCase.execute.mockResolvedValue(mockResult);

		const response = await handleSessionById(request, env, sessionId);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body).toEqual(mockResult);
		expect(mockUseCase.execute).toHaveBeenCalledWith('123');
	});
});
