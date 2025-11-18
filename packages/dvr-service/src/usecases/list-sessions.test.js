import { describe, it, expect, vi } from 'vitest';
import { ListSessionsUseCase } from './list-sessions.js';

describe('ListSessionsUseCase', () => {
	it('should return sessions with default limit and offset', async () => {
		const mockSessions = [
			{ sessionId: '1', eventCount: 10 },
			{ sessionId: '2', eventCount: 5 }
		];
		const mockRepository = {
			listMetadata: vi.fn().mockResolvedValue(mockSessions)
		};

		const useCase = new ListSessionsUseCase(mockRepository);
		const result = await useCase.execute();

		expect(result).toEqual({
			sessions: mockSessions,
			count: 2
		});
		expect(mockRepository.listMetadata).toHaveBeenCalledWith(50, 0);
	});

	it('should return sessions with custom limit and offset', async () => {
		const mockSessions = [{ sessionId: '3', eventCount: 20 }];
		const mockRepository = {
			listMetadata: vi.fn().mockResolvedValue(mockSessions)
		};

		const useCase = new ListSessionsUseCase(mockRepository);
		const result = await useCase.execute(10, 5);

		expect(result).toEqual({
			sessions: mockSessions,
			count: 1
		});
		expect(mockRepository.listMetadata).toHaveBeenCalledWith(10, 5);
	});
});
