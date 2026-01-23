import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bindEvent, debounce } from '$lib/utils/event-utils.js';

describe('event-utils', () => {
	describe('bindEvent', () => {
		it('binds event listener using addEventListener', () => {
			const element = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			};
			const handler = vi.fn();

			const cleanup = bindEvent(element, 'click', handler);

			expect(element.addEventListener).toHaveBeenCalledWith('click', handler, false);
			expect(typeof cleanup).toBe('function');
		});

		it('returns cleanup function that removes event listener', () => {
			const element = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			};
			const handler = vi.fn();

			const cleanup = bindEvent(element, 'click', handler);
			cleanup();

			expect(element.removeEventListener).toHaveBeenCalledWith('click', handler, false);
		});

		it('passes options to addEventListener', () => {
			const element = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			};
			const handler = vi.fn();
			const options = { passive: true, capture: true };

			bindEvent(element, 'scroll', handler, options);

			expect(element.addEventListener).toHaveBeenCalledWith('scroll', handler, options);
		});

		it('falls back to attachEvent for legacy browsers', () => {
			const element = {
				attachEvent: vi.fn(),
				detachEvent: vi.fn()
			};
			const handler = vi.fn();

			const cleanup = bindEvent(element, 'click', handler);

			expect(element.attachEvent).toHaveBeenCalledWith('onclick', handler);
			expect(typeof cleanup).toBe('function');
		});

		it('cleanup uses detachEvent for legacy browsers', () => {
			const element = {
				attachEvent: vi.fn(),
				detachEvent: vi.fn()
			};
			const handler = vi.fn();

			const cleanup = bindEvent(element, 'click', handler);
			cleanup();

			expect(element.detachEvent).toHaveBeenCalledWith('onclick', handler);
		});
	});

	describe('debounce', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('delays function execution', () => {
			const func = vi.fn();
			const debounced = debounce(func, 100);

			debounced();
			expect(func).not.toHaveBeenCalled();

			vi.advanceTimersByTime(100);
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('resets timer on subsequent calls', () => {
			const func = vi.fn();
			const debounced = debounce(func, 100);

			debounced();
			vi.advanceTimersByTime(50);

			debounced();
			vi.advanceTimersByTime(50);

			expect(func).not.toHaveBeenCalled();

			vi.advanceTimersByTime(50);
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('passes arguments to debounced function', () => {
			const func = vi.fn();
			const debounced = debounce(func, 100);

			debounced('arg1', 'arg2');
			vi.advanceTimersByTime(100);

			expect(func).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('executes immediately when immediate is true', () => {
			const func = vi.fn();
			const debounced = debounce(func, 100, true);

			debounced();
			expect(func).toHaveBeenCalledTimes(1);
		});

		it('does not execute again during wait period when immediate', () => {
			const func = vi.fn();
			const debounced = debounce(func, 100, true);

			debounced();
			debounced();
			debounced();

			expect(func).toHaveBeenCalledTimes(1);
		});

		it('allows execution after wait period when immediate', () => {
			const func = vi.fn();
			const debounced = debounce(func, 100, true);

			debounced();
			expect(func).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(100);

			debounced();
			expect(func).toHaveBeenCalledTimes(2);
		});

		it('preserves this context', () => {
			const obj = {
				value: 42,
				method: vi.fn(function () {
					return this.value;
				})
			};
			obj.debounced = debounce(obj.method, 100);

			obj.debounced();
			vi.advanceTimersByTime(100);

			expect(obj.method).toHaveBeenCalled();
		});
	});
});
