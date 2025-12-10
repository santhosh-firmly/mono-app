import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionRecorder } from '../src/recorder.js';

// Mock rrweb
vi.mock('rrweb', () => ({
	record: vi.fn(() => vi.fn())
}));

describe('SessionRecorder', () => {
	let recorder;
	let mockConfig;

	beforeEach(() => {
		global.window = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		};
		global.document = {
			visibilityState: 'visible'
		};
		global.navigator = {
			sendBeacon: vi.fn(() => true)
		};
		global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
		global.Blob = class Blob {
			constructor(parts, options) {
				this.parts = parts;
				this.options = options;
			}
		};

		mockConfig = {
			serviceUrl: 'https://test.example.com'
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
		delete global.window;
		delete global.document;
		delete global.navigator;
		delete global.fetch;
		delete global.Blob;
	});

	describe('constructor', () => {
		it('should throw error when not in browser environment', () => {
			delete global.window;
			expect(() => new SessionRecorder(mockConfig)).toThrow(
				'SessionRecorder requires a browser environment'
			);
		});

		it('should throw error when serviceUrl is missing', () => {
			expect(() => new SessionRecorder({})).toThrow('serviceUrl is required');
		});
	});

	describe('start', () => {
		beforeEach(() => {
			recorder = new SessionRecorder(mockConfig);
		});

		it('should start recording and return session ID', () => {
			const sessionId = recorder.start();
			expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
			expect(recorder.isRecording).toBe(true);
		});

		it('should return existing session ID if already recording', () => {
			const sessionId1 = recorder.start();
			const sessionId2 = recorder.start();
			expect(sessionId1).toBe(sessionId2);
		});

		it('should not start if disabled', () => {
			recorder = new SessionRecorder({ ...mockConfig, enabled: false });
			const sessionId = recorder.start();
			expect(sessionId).toBeNull();
		});

		it('should setup page unload handlers', () => {
			recorder.start();
			expect(window.addEventListener).toHaveBeenCalledWith(
				'visibilitychange',
				expect.any(Function)
			);
			expect(window.addEventListener).toHaveBeenCalledWith('pagehide', expect.any(Function));
		});
	});

	describe('stop', () => {
		beforeEach(() => {
			recorder = new SessionRecorder(mockConfig);
		});

		it('should stop recording', async () => {
			recorder.start();
			await recorder.stop();
			expect(recorder.isRecording).toBe(false);
			expect(recorder.sessionId).toBeNull();
		});

		it('should remove page unload handlers', async () => {
			recorder.start();
			await recorder.stop();
			expect(window.removeEventListener).toHaveBeenCalledWith(
				'visibilitychange',
				expect.any(Function)
			);
			expect(window.removeEventListener).toHaveBeenCalledWith(
				'pagehide',
				expect.any(Function)
			);
		});

		it('should handle stop when not recording', async () => {
			await expect(recorder.stop()).resolves.not.toThrow();
		});
	});

	describe('_sendBatch', () => {
		beforeEach(() => {
			recorder = new SessionRecorder(mockConfig);
			recorder.sessionId = 'test_session_123';
		});

		it('should not send when no events and not finalizing', async () => {
			await recorder._sendBatch([], false);
			expect(fetch).not.toHaveBeenCalled();
		});

		it('should send batch via fetch', async () => {
			const events = [{ type: 1 }, { type: 2 }];
			await recorder._sendBatch(events, false);

			expect(fetch).toHaveBeenCalledWith(
				'https://test.example.com/api/sessions',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: expect.any(String)
				})
			);
		});

		it('should include finalize flag when finalizing', async () => {
			const events = [{ type: 1 }];
			await recorder._sendBatch(events, true);

			const callArgs = fetch.mock.calls[0][1];
			const body = JSON.parse(callArgs.body);
			expect(body.finalize).toBe(true);
		});

		it('should use keepalive when finalizing', async () => {
			await recorder._sendBatch([{ type: 1 }], true);
			const callArgs = fetch.mock.calls[0][1];
			expect(callArgs.keepalive).toBe(true);
		});

		it('should handle fetch errors', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			fetch.mockRejectedValueOnce(new Error('Network error'));

			await recorder._sendBatch([{ type: 1 }], false);
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe('_splitIntoChunks', () => {
		beforeEach(() => {
			recorder = new SessionRecorder(mockConfig);
			recorder.sessionId = 'test_session_123';
		});

		it('should return single chunk when events fit', () => {
			const events = [{ type: 1 }, { type: 2 }];
			const chunks = recorder._splitIntoChunks(events, 10000);
			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toEqual(events);
		});

		it('should split events when exceeding maxSize without losing data', () => {
			const largeEvent = { type: 1, data: 'x'.repeat(100) };
			const events = [largeEvent, largeEvent, largeEvent];
			const chunks = recorder._splitIntoChunks(events, 200);

			expect(chunks.length).toBeGreaterThan(1);
			expect(chunks.flat()).toEqual(events);
		});
	});

	describe('_sendFinalBatchSync', () => {
		beforeEach(() => {
			recorder = new SessionRecorder(mockConfig);
			recorder.start();
		});

		it('should use sendBeacon for page unload', () => {
			recorder.batchManager.events = [{ type: 1 }];
			recorder._sendFinalBatchSync();

			expect(navigator.sendBeacon).toHaveBeenCalledWith(
				'https://test.example.com/api/sessions',
				expect.any(Blob)
			);
		});

		it('should split large batches into chunks', () => {
			const largeEvent = { type: 1, data: 'x'.repeat(30000) };
			recorder.batchManager.events = [largeEvent, largeEvent, largeEvent];

			recorder._sendFinalBatchSync();

			expect(navigator.sendBeacon).toHaveBeenCalled();
			expect(navigator.sendBeacon.mock.calls.length).toBeGreaterThan(1);
		});

		it('should mark only last chunk with finalize', () => {
			const event = { type: 1, data: 'x'.repeat(30000) };
			recorder.batchManager.events = [event, event];

			recorder._sendFinalBatchSync();

			const calls = navigator.sendBeacon.mock.calls;
			const lastBlob = calls[calls.length - 1][1];
			const lastPayload = JSON.parse(lastBlob.parts[0]);

			expect(lastPayload.finalize).toBe(true);
		});

		it('should not throw when sendBeacon is unavailable', () => {
			delete navigator.sendBeacon;
			recorder.batchManager.events = [{ type: 1 }];

			expect(() => recorder._sendFinalBatchSync()).not.toThrow();
		});
	});

	describe('getStatus', () => {
		it('should return status with batch stats when recording', () => {
			recorder = new SessionRecorder(mockConfig);
			recorder.start();
			const status = recorder.getStatus();

			expect(status.isRecording).toBe(true);
			expect(status.sessionId).toBeDefined();
			expect(status.batchStats).toBeDefined();
		});
	});

	describe('page unload handlers', () => {
		beforeEach(() => {
			recorder = new SessionRecorder(mockConfig);
			recorder.start();
		});

		it('should trigger sendBeacon on visibilitychange to hidden', () => {
			const visibilityHandler = window.addEventListener.mock.calls.find(
				(call) => call[0] === 'visibilitychange'
			)[1];

			document.visibilityState = 'hidden';
			recorder.batchManager.events = [{ type: 1 }];
			visibilityHandler();

			expect(navigator.sendBeacon).toHaveBeenCalled();
		});

		it('should not trigger on visibilitychange to visible', () => {
			const visibilityHandler = window.addEventListener.mock.calls.find(
				(call) => call[0] === 'visibilitychange'
			)[1];

			document.visibilityState = 'visible';
			visibilityHandler();

			expect(navigator.sendBeacon).not.toHaveBeenCalled();
		});

		it('should trigger sendBeacon on pagehide', () => {
			const pagehideHandler = window.addEventListener.mock.calls.find(
				(call) => call[0] === 'pagehide'
			)[1];

			recorder.batchManager.events = [{ type: 1 }];
			pagehideHandler();

			expect(navigator.sendBeacon).toHaveBeenCalled();
		});
	});
});
