import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionRecorder } from '../src/index.js';

describe('SessionRecorder', () => {
	let recorder;

	beforeEach(() => {
		// Mock window.navigator.sendBeacon
		global.navigator.sendBeacon = vi.fn(() => true);

		// Mock fetch
		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				status: 200
			})
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (recorder) {
			recorder.stop();
		}
	});

	describe('constructor', () => {
		it('should throw error if serviceUrl is not provided', () => {
			expect(() => new SessionRecorder({})).toThrow('serviceUrl is required');
		});

		it('should initialize with valid config', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			expect(recorder.config.serviceUrl).toBe('https://example.com');
			expect(recorder.isRecording).toBe(false);
			expect(recorder.sessionId).toBeNull();
		});
	});

	describe('start', () => {
		it('should generate a session ID if none provided', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			const sessionId = recorder.start();

			expect(sessionId).toBeTruthy();
			expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
			expect(recorder.isRecording).toBe(true);
		});

		it('should use provided session ID', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			const customSessionId = 'custom_session_123';
			const sessionId = recorder.start(customSessionId);

			expect(sessionId).toBe(customSessionId);
			expect(recorder.sessionId).toBe(customSessionId);
			expect(recorder.isRecording).toBe(true);
		});

		it('should return existing session ID if already recording', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			const sessionId1 = recorder.start('session_1');
			const sessionId2 = recorder.start('session_2');

			expect(sessionId1).toBe('session_1');
			expect(sessionId2).toBe('session_1'); // Returns existing session ID
		});

		it('should return null if recording is disabled', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com',
				enabled: false
			});

			const sessionId = recorder.start();

			expect(sessionId).toBeNull();
			expect(recorder.isRecording).toBe(false);
		});

		it('should generate new ID if provided sessionId is undefined', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			const sessionId = recorder.start(undefined);

			expect(sessionId).toBeTruthy();
			expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
		});

		it('should generate new ID if provided sessionId is null', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			const sessionId = recorder.start(null);

			expect(sessionId).toBeTruthy();
			expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
		});

		it('should generate new ID if provided sessionId is empty string', () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			const sessionId = recorder.start('');

			expect(sessionId).toBeTruthy();
			expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
		});
	});

	describe('stop', () => {
		it('should handle stop when not recording', async () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			await expect(recorder.stop()).resolves.toBeUndefined();
		});

		it('should stop recording and clean up', async () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			recorder.start('test_session');
			expect(recorder.isRecording).toBe(true);

			await recorder.stop();

			expect(recorder.isRecording).toBe(false);
			expect(recorder.sessionId).toBeNull();
		});

		it('should send final batch when stopping', async () => {
			recorder = new SessionRecorder({
				serviceUrl: 'https://example.com'
			});

			recorder.start('test_session');
			await recorder.stop();

			expect(fetch).toHaveBeenCalledWith(
				'https://example.com/api/sessions',
				expect.objectContaining({
					method: 'POST'
				})
			);
		});
	});
});
