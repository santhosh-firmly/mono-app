import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BatchManager } from '../src/batching.js';

describe('BatchManager', () => {
	let batchManager;
	let mockConfig;

	beforeEach(() => {
		vi.useFakeTimers();
		mockConfig = {
			sessionId: 'test_session_123',
			batchInterval: 10000,
			maxBatchSize: 500 * 1024,
			maxEvents: 500,
			onFlush: vi.fn()
		};
		batchManager = new BatchManager(mockConfig);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('start', () => {
		it('should start interval timer', () => {
			batchManager.start();
			expect(batchManager.intervalId).toBeDefined();
		});

		it('should not start multiple timers', () => {
			batchManager.start();
			const firstIntervalId = batchManager.intervalId;
			batchManager.start();
			expect(batchManager.intervalId).toBe(firstIntervalId);
		});

		it('should flush events when interval triggers', () => {
			batchManager.start();
			batchManager.events = [{ type: 1 }];

			vi.advanceTimersByTime(10000);

			expect(mockConfig.onFlush).toHaveBeenCalledWith([{ type: 1 }], 'time');
		});

		it('should not flush when no events', () => {
			batchManager.start();
			vi.advanceTimersByTime(10000);
			expect(mockConfig.onFlush).not.toHaveBeenCalled();
		});
	});

	describe('stop', () => {
		it('should clear interval timer', () => {
			batchManager.start();
			batchManager.stop();
			expect(batchManager.intervalId).toBeNull();
		});

		it('should handle stop when not started', () => {
			expect(() => batchManager.stop()).not.toThrow();
		});
	});

	describe('addEvent', () => {
		it('should add event to buffer', () => {
			const event = { type: 1, data: 'test' };
			batchManager.addEvent(event);
			expect(batchManager.events).toContain(event);
		});

		it('should flush when maxEvents limit reached', () => {
			mockConfig.maxEvents = 3;
			batchManager = new BatchManager(mockConfig);

			batchManager.addEvent({ type: 1 });
			batchManager.addEvent({ type: 2 });
			expect(mockConfig.onFlush).not.toHaveBeenCalled();

			batchManager.addEvent({ type: 3 });
			expect(mockConfig.onFlush).toHaveBeenCalledWith(
				[{ type: 1 }, { type: 2 }, { type: 3 }],
				'limit'
			);
		});

		it('should flush when maxBatchSize limit reached', () => {
			mockConfig.maxBatchSize = 100;
			batchManager = new BatchManager(mockConfig);

			const largeEvent = { type: 1, data: 'x'.repeat(50) };
			batchManager.addEvent(largeEvent);
			batchManager.addEvent(largeEvent);

			expect(mockConfig.onFlush).toHaveBeenCalled();
		});
	});

	describe('flush', () => {
		it('should return empty array when no events', () => {
			const result = batchManager.flush();
			expect(result).toEqual([]);
		});

		it('should clear events buffer and call onFlush callback', () => {
			const events = [{ type: 1 }, { type: 2 }];
			batchManager.events = events;
			const result = batchManager.flush('manual');

			expect(batchManager.events).toEqual([]);
			expect(mockConfig.onFlush).toHaveBeenCalledWith(events, 'manual');
			expect(result).toEqual(events);
		});
	});

	describe('getStats', () => {
		it('should return current stats', () => {
			batchManager.events = [{ type: 1 }, { type: 2 }];
			const stats = batchManager.getStats();

			expect(stats.eventCount).toBe(2);
			expect(stats.payloadSize).toBeGreaterThan(0);
			expect(stats.timeSinceLastFlush).toBeGreaterThanOrEqual(0);
		});
	});
});
