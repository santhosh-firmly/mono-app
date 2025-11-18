import { describe, it, expect, vi } from 'vitest';
import { SaveSessionUseCase } from './save-session.js';
import { InternalError } from '../errors/index.js';

describe('SaveSessionUseCase', () => {
	it('should buffer events when not finalizing', async () => {
		const mockBufferAdapter = {
			appendEvents: vi.fn().mockResolvedValue({
				buffered: true,
				eventCount: 5
			})
		};
		const mockPersistenceAdapter = {};

		const useCase = new SaveSessionUseCase(mockPersistenceAdapter, mockBufferAdapter);
		const result = await useCase.execute('session123', [{ type: 1 }]);

		expect(result).toEqual({
			sessionId: 'session123',
			success: true,
			buffered: true,
			eventCount: 5
		});
		expect(mockBufferAdapter.appendEvents).toHaveBeenCalledWith('session123', [{ type: 1 }]);
	});

	it('should finalize session without additional events', async () => {
		const mockSessionData = {
			events: [{ type: 1 }],
			metadata: { eventCount: 10 }
		};
		const mockBufferAdapter = {
			appendEvents: vi.fn(),
			finalize: vi.fn().mockResolvedValue({ sessionData: mockSessionData })
		};
		const mockPersistenceAdapter = {
			writeEvents: vi.fn(),
			createMetadata: vi.fn()
		};

		const useCase = new SaveSessionUseCase(mockPersistenceAdapter, mockBufferAdapter);
		const result = await useCase.execute('session123', [], true);

		expect(result).toEqual({
			sessionId: 'session123',
			success: true,
			finalized: true,
			eventCount: 10
		});
		expect(mockBufferAdapter.appendEvents).not.toHaveBeenCalled();
		expect(mockBufferAdapter.finalize).toHaveBeenCalledWith('session123');
		expect(mockPersistenceAdapter.writeEvents).toHaveBeenCalledWith('session123', [{ type: 1 }]);
		expect(mockPersistenceAdapter.createMetadata).toHaveBeenCalledWith('session123', { eventCount: 10 });
	});

	it('should finalize session with additional events', async () => {
		const mockSessionData = {
			events: [{ type: 1 }, { type: 2 }],
			metadata: { eventCount: 12 }
		};
		const mockBufferAdapter = {
			appendEvents: vi.fn().mockResolvedValue({}),
			finalize: vi.fn().mockResolvedValue({ sessionData: mockSessionData })
		};
		const mockPersistenceAdapter = {
			writeEvents: vi.fn(),
			createMetadata: vi.fn()
		};

		const useCase = new SaveSessionUseCase(mockPersistenceAdapter, mockBufferAdapter);
		const result = await useCase.execute('session123', [{ type: 2 }], true);

		expect(result).toEqual({
			sessionId: 'session123',
			success: true,
			finalized: true,
			eventCount: 12
		});
		expect(mockBufferAdapter.appendEvents).toHaveBeenCalledWith('session123', [{ type: 2 }]);
		expect(mockBufferAdapter.finalize).toHaveBeenCalledWith('session123');
		expect(mockPersistenceAdapter.writeEvents).toHaveBeenCalledWith('session123', [{ type: 1 }, { type: 2 }]);
		expect(mockPersistenceAdapter.createMetadata).toHaveBeenCalledWith('session123', { eventCount: 12 });
	});

	it('should throw InternalError when finalize returns no session data', async () => {
		const mockBufferAdapter = {
			finalize: vi.fn().mockResolvedValue({ sessionData: null })
		};
		const mockPersistenceAdapter = {};

		const useCase = new SaveSessionUseCase(mockPersistenceAdapter, mockBufferAdapter);

		await expect(useCase.execute('session123', [], true)).rejects.toThrow(InternalError);
		expect(mockBufferAdapter.finalize).toHaveBeenCalledWith('session123');
	});
});
