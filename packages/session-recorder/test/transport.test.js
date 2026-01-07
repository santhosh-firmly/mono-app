import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Transport } from '../src/transport.js';

describe('Transport', () => {
	let transport;
	let mockOnError;
	let mockOnBatchSent;
	let mockFetch;
	let mockSendBeacon;

	beforeEach(() => {
		mockOnError = vi.fn();
		mockOnBatchSent = vi.fn();
		mockFetch = vi.fn().mockResolvedValue({ ok: true });
		mockSendBeacon = vi.fn().mockReturnValue(true);

		global.fetch = mockFetch;
		global.navigator.sendBeacon = mockSendBeacon;

		transport = new Transport(
			'https://example.com',
			'test_session_123',
			'test-app',
			mockOnError,
			mockOnBatchSent
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with correct properties', () => {
			expect(transport.serviceUrl).toBe('https://example.com');
			expect(transport.sessionId).toBe('test_session_123');
			expect(transport.appName).toBe('test-app');
			expect(transport.onError).toBe(mockOnError);
			expect(transport.onBatchSent).toBe(mockOnBatchSent);
			expect(transport.beaconLimit).toBe(64 * 1024);
		});
	});

	describe('sendBatch', () => {
		it('should send batch via fetch with correct payload', async () => {
			const events = [{ type: 1 }, { type: 2 }];
			await transport.sendBatch(events, false);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://example.com/api/sessions',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					keepalive: false
				})
			);

			const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(payload.sessionId).toBe('test_session_123');
			expect(payload.appName).toBe('test-app');
			expect(payload.events).toEqual(events);
			expect(payload.finalize).toBeUndefined();
		});

		it('should include finalize flag when finalize is true', async () => {
			const events = [{ type: 1 }];
			await transport.sendBatch(events, true);

			const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(payload.sessionId).toBe('test_session_123');
			expect(payload.appName).toBe('test-app');
			expect(payload.finalize).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://example.com/api/sessions',
				expect.objectContaining({
					keepalive: true
				})
			);
		});

		it('should call onBatchSent callback on success', async () => {
			const events = [{ type: 1 }];
			await transport.sendBatch(events, false);

			expect(mockOnBatchSent).toHaveBeenCalledWith('test_session_123', 1, expect.any(Number));
		});

		it('should handle fetch errors and call onError', async () => {
			const error = new Error('Network error');
			mockFetch.mockRejectedValue(error);

			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			await transport.sendBatch([{ type: 1 }], false);

			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send batch:', error);
			expect(mockOnError).toHaveBeenCalledWith(error);

			consoleErrorSpy.mockRestore();
		});

		it('should not send if events are empty and not finalizing', async () => {
			await transport.sendBatch([], false);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('should send empty batch when finalizing', async () => {
			await transport.sendBatch([], true);
			expect(mockFetch).toHaveBeenCalled();
		});

		it('should not include appName in payload if null', async () => {
			const transportWithoutAppName = new Transport(
				'https://example.com',
				'test_session_123',
				null,
				mockOnError,
				mockOnBatchSent
			);

			const events = [{ type: 1 }];
			await transportWithoutAppName.sendBatch(events, false);

			const payload = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(payload.sessionId).toBe('test_session_123');
			expect(payload.appName).toBeUndefined();
			expect(payload.events).toEqual(events);
		});
	});

	describe('sendFinalBatchSync', () => {
		it('should send batch via sendBeacon', () => {
			const events = [{ type: 1 }, { type: 2 }];
			transport.sendFinalBatchSync(events);

			expect(mockSendBeacon).toHaveBeenCalledWith(
				'https://example.com/api/sessions',
				expect.any(Blob)
			);
		});

		it('should include finalize flag in payload', async () => {
			const events = [{ type: 1 }];
			transport.sendFinalBatchSync(events);

			const blob = mockSendBeacon.mock.calls[0][1];
			expect(blob).toBeInstanceOf(Blob);

			const reader = new FileReader();
			const text = await new Promise((resolve) => {
				reader.onload = () => resolve(reader.result);
				reader.readAsText(blob);
			});

			const payload = JSON.parse(text);
			expect(payload.finalize).toBe(true);
			expect(payload.sessionId).toBe('test_session_123');
		});

		it('should split large payloads into multiple chunks', () => {
			const largeEvent = { type: 1, data: 'x'.repeat(20 * 1024) };
			const events = [largeEvent, largeEvent, largeEvent, largeEvent];

			transport.sendFinalBatchSync(events);

			expect(mockSendBeacon.mock.calls.length).toBeGreaterThan(1);
		});

		it('should not send if events are empty', () => {
			transport.sendFinalBatchSync([]);
			expect(mockSendBeacon).not.toHaveBeenCalled();
		});

		it('should handle missing sendBeacon gracefully', () => {
			global.navigator.sendBeacon = undefined;
			expect(() => transport.sendFinalBatchSync([{ type: 1 }])).not.toThrow();
		});

		it('should only mark last chunk as final', async () => {
			const largeEvent = { type: 1, data: 'x'.repeat(20 * 1024) };
			const events = [largeEvent, largeEvent, largeEvent, largeEvent];

			transport.sendFinalBatchSync(events);

			const calls = mockSendBeacon.mock.calls;
			expect(calls.length).toBeGreaterThan(1);

			for (let i = 0; i < calls.length; i++) {
				const blob = calls[i][1];
				const reader = new FileReader();
				const text = await new Promise((resolve) => {
					reader.onload = () => resolve(reader.result);
					reader.readAsText(blob);
				});
				const payload = JSON.parse(text);

				if (i === calls.length - 1) {
					expect(payload.finalize).toBe(true);
				} else {
					expect(payload.finalize).toBeUndefined();
				}
			}
		});
	});
});
