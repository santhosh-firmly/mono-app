import { describe, it, expect, vi } from 'vitest';
import { GetSessionUseCase } from './get-session.js';
import { SessionNotFoundError } from '../errors/index.js';

describe('GetSessionUseCase', () => {
	it('should return session data when events exist', async () => {
		const mockRepository = {
			getEvents: vi.fn().mockResolvedValue([{ type: 1, timestamp: 123 }]),
			getMetadata: vi.fn().mockResolvedValue({ sessionId: '123', eventCount: 1 })
		};

		const useCase = new GetSessionUseCase(mockRepository);
		const result = await useCase.execute('123');

		expect(result).toEqual({
			sessionId: '123',
			events: [{ type: 1, timestamp: 123 }],
			metadata: { sessionId: '123', eventCount: 1 }
		});
		expect(mockRepository.getEvents).toHaveBeenCalledWith('123');
		expect(mockRepository.getMetadata).toHaveBeenCalledWith('123');
	});

	it('should throw SessionNotFoundError when events do not exist', async () => {
		const mockRepository = {
			getEvents: vi.fn().mockResolvedValue(null),
			getMetadata: vi.fn()
		};

		const useCase = new GetSessionUseCase(mockRepository);

		await expect(useCase.execute('123')).rejects.toThrow(SessionNotFoundError);
		expect(mockRepository.getEvents).toHaveBeenCalledWith('123');
		expect(mockRepository.getMetadata).not.toHaveBeenCalled();
	});
});
