import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventQueue } from '$lib/utils/event-queue.js';

describe('EventQueue', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('constructor', () => {
		it('throws when onFlush is not provided', () => {
			expect(() => new EventQueue({})).toThrow('EventQueue requires onFlush callback');
		});

		it('throws when onFlush is not a function', () => {
			expect(() => new EventQueue({ onFlush: 'not a function' })).toThrow(
				'EventQueue requires onFlush callback'
			);
		});

		it('creates queue with default flushDelay of 200ms', () => {
			const queue = new EventQueue({ onFlush: vi.fn() });
			expect(queue.flushDelay).toBe(200);
		});

		it('accepts custom flushDelay', () => {
			const queue = new EventQueue({ flushDelay: 500, onFlush: vi.fn() });
			expect(queue.flushDelay).toBe(500);
		});
	});

	describe('enqueue', () => {
		it('adds event to queue', () => {
			const queue = new EventQueue({ onFlush: vi.fn() });

			queue.enqueue({ name: 'test' });

			expect(queue.length).toBe(1);
		});

		it('adds order number to event', () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ onFlush });

			queue.enqueue({ name: 'event1' });
			queue.enqueue({ name: 'event2' });

			vi.advanceTimersByTime(200);

			expect(onFlush).toHaveBeenCalledWith([
				expect.objectContaining({ name: 'event1', order: 1 }),
				expect.objectContaining({ name: 'event2', order: 2 })
			]);
		});

		it('schedules flush after flushDelay', () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ flushDelay: 100, onFlush });

			queue.enqueue({ name: 'test' });

			expect(onFlush).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);

			expect(onFlush).toHaveBeenCalledTimes(1);
		});

		it('debounces multiple enqueue calls', () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ flushDelay: 100, onFlush });

			queue.enqueue({ name: 'event1' });
			vi.advanceTimersByTime(50);

			queue.enqueue({ name: 'event2' });
			vi.advanceTimersByTime(50);

			expect(onFlush).not.toHaveBeenCalled();

			vi.advanceTimersByTime(50);
			expect(onFlush).toHaveBeenCalledTimes(1);
			expect(onFlush).toHaveBeenCalledWith([
				expect.objectContaining({ name: 'event1' }),
				expect.objectContaining({ name: 'event2' })
			]);
		});
	});

	describe('flush', () => {
		it('flushes queue immediately', async () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ onFlush });

			queue.enqueue({ name: 'test' });
			await queue.flush();

			expect(onFlush).toHaveBeenCalledTimes(1);
			expect(queue.length).toBe(0);
		});

		it('does nothing when queue is empty', async () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ onFlush });

			await queue.flush();

			expect(onFlush).not.toHaveBeenCalled();
		});

		it('clears pending timeout', async () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ flushDelay: 100, onFlush });

			queue.enqueue({ name: 'test' });
			await queue.flush();

			vi.advanceTimersByTime(100);

			expect(onFlush).toHaveBeenCalledTimes(1);
		});

		it('handles onFlush errors gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const onFlush = vi.fn().mockRejectedValue(new Error('Flush error'));
			const queue = new EventQueue({ onFlush });

			queue.enqueue({ name: 'test' });
			await queue.flush();

			expect(consoleSpy).toHaveBeenCalledWith('EventQueue flush error:', expect.any(Error));
			consoleSpy.mockRestore();
		});
	});

	describe('length', () => {
		it('returns current queue length', () => {
			const queue = new EventQueue({ onFlush: vi.fn() });

			expect(queue.length).toBe(0);

			queue.enqueue({ name: 'event1' });
			expect(queue.length).toBe(1);

			queue.enqueue({ name: 'event2' });
			expect(queue.length).toBe(2);
		});
	});

	describe('clear', () => {
		it('empties queue without flushing', () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ onFlush });

			queue.enqueue({ name: 'event1' });
			queue.enqueue({ name: 'event2' });
			queue.clear();

			expect(queue.length).toBe(0);
			expect(onFlush).not.toHaveBeenCalled();
		});

		it('resets order counter', () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ onFlush });

			queue.enqueue({ name: 'event1' });
			queue.clear();
			queue.enqueue({ name: 'event2' });

			vi.advanceTimersByTime(200);

			expect(onFlush).toHaveBeenCalledWith([expect.objectContaining({ order: 1 })]);
		});

		it('clears pending timeout', () => {
			const onFlush = vi.fn();
			const queue = new EventQueue({ flushDelay: 100, onFlush });

			queue.enqueue({ name: 'test' });
			queue.clear();

			vi.advanceTimersByTime(100);

			expect(onFlush).not.toHaveBeenCalled();
		});
	});
});
