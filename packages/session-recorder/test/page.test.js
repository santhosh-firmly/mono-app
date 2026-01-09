import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Page } from '../src/page.js';

describe('Page', () => {
	let page;
	let mockOnUnload;
	let addEventListenerSpy;
	let removeEventListenerSpy;

	beforeEach(() => {
		mockOnUnload = vi.fn();
		addEventListenerSpy = vi.spyOn(window, 'addEventListener');
		removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
		page = new Page(mockOnUnload);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with callback', () => {
			expect(page.onUnload).toBe(mockOnUnload);
			expect(page.visibilityHandler).toBeNull();
			expect(page.unloadHandler).toBeNull();
		});
	});

	describe('setup', () => {
		it('should add event listeners for visibilitychange and pagehide', () => {
			page.setup();

			expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
			expect(addEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function));
			expect(page.visibilityHandler).toBeInstanceOf(Function);
			expect(page.unloadHandler).toBeInstanceOf(Function);
		});

		it('should call onUnload when pagehide event fires', () => {
			page.setup();

			const pagehideHandler = addEventListenerSpy.mock.calls.find(
				(call) => call[0] === 'pagehide'
			)[1];
			pagehideHandler();

			expect(mockOnUnload).toHaveBeenCalledTimes(1);
		});

		it('should call onUnload when visibility changes to hidden', () => {
			page.setup();

			const visibilityHandler = addEventListenerSpy.mock.calls.find(
				(call) => call[0] === 'visibilitychange'
			)[1];

			Object.defineProperty(document, 'visibilityState', {
				writable: true,
				configurable: true,
				value: 'hidden'
			});

			visibilityHandler();

			expect(mockOnUnload).toHaveBeenCalledTimes(1);
		});

		it('should not call onUnload when visibility changes to visible', () => {
			page.setup();

			const visibilityHandler = addEventListenerSpy.mock.calls.find(
				(call) => call[0] === 'visibilitychange'
			)[1];

			Object.defineProperty(document, 'visibilityState', {
				writable: true,
				configurable: true,
				value: 'visible'
			});

			visibilityHandler();

			expect(mockOnUnload).not.toHaveBeenCalled();
		});
	});

	describe('remove', () => {
		it('should remove event listeners', () => {
			page.setup();
			const visibilityHandler = page.visibilityHandler;
			const unloadHandler = page.unloadHandler;

			page.remove();

			expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', visibilityHandler);
			expect(removeEventListenerSpy).toHaveBeenCalledWith('pagehide', unloadHandler);
			expect(page.visibilityHandler).toBeNull();
			expect(page.unloadHandler).toBeNull();
		});

		it('should handle remove when not set up', () => {
			expect(() => page.remove()).not.toThrow();
		});

		it('should not remove listeners if already null', () => {
			page.visibilityHandler = null;
			page.unloadHandler = null;

			page.remove();

			expect(removeEventListenerSpy).not.toHaveBeenCalled();
		});
	});
});
