import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSessionId, safeCallback, debugLog } from '../src/utils.js';

describe('utils', () => {
	describe('generateSessionId', () => {
		it('should generate a session ID with correct format', () => {
			const sessionId = generateSessionId();
			expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
		});

		it('should generate unique session IDs', () => {
			const id1 = generateSessionId();
			const id2 = generateSessionId();
			expect(id1).not.toBe(id2);
		});

		it('should include timestamp in session ID', () => {
			const before = Date.now();
			const sessionId = generateSessionId();
			const after = Date.now();

			const timestamp = parseInt(sessionId.split('_')[1]);
			expect(timestamp).toBeGreaterThanOrEqual(before);
			expect(timestamp).toBeLessThanOrEqual(after);
		});
	});

	describe('safeCallback', () => {
		it('should call the callback with provided arguments', () => {
			const callback = vi.fn();
			safeCallback(callback, 'arg1', 'arg2');
			expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('should not throw if callback is not a function', () => {
			expect(() => safeCallback(null)).not.toThrow();
			expect(() => safeCallback(undefined)).not.toThrow();
			expect(() => safeCallback('not a function')).not.toThrow();
		});

		it('should catch and log errors from callback', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const throwingCallback = () => {
				throw new Error('callback error');
			};

			expect(() => safeCallback(throwingCallback)).not.toThrow();
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe('debugLog', () => {
		beforeEach(() => {
			global.window = { __FIRMLY_SESSION_RECORDER_DEBUG__: false };
		});

		afterEach(() => {
			delete global.window;
		});

		it('should not log when debug mode is disabled', () => {
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
			debugLog('test message', { foo: 'bar' });
			expect(consoleLogSpy).not.toHaveBeenCalled();
			consoleLogSpy.mockRestore();
		});

		it('should log when debug mode is enabled', () => {
			global.window.__FIRMLY_SESSION_RECORDER_DEBUG__ = true;
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			debugLog('test message', { foo: 'bar' });

			expect(consoleLogSpy).toHaveBeenCalledWith('[SessionRecorder] test message', { foo: 'bar' });
			consoleLogSpy.mockRestore();
		});

		it('should not throw when window is undefined', () => {
			delete global.window;
			expect(() => debugLog('test')).not.toThrow();
		});
	});
});
