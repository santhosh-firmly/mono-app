import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockConfig, createMockBrowserFetch } from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/config.js', () => ({
	config: createMockConfig({
		telemetryServer: 'https://telemetry.example.com',
		browserId: 'browser-123',
		deviceId: 'device-456',
		sessionId: 'session-789',
		traceId: 'trace-001',
		appName: 'test-app',
		appVersion: '1.0.0'
	})
}));
vi.mock('$lib/utils/browser-fetch.js', () => createMockBrowserFetch());

import {
	track,
	trackError,
	flush,
	EVENT_TYPE_UX,
	EVENT_TYPE_API,
	EVENT_TYPE_ERROR,
	EVENT_TYPE_SESSION,
	EVENT_TYPE_DEVICE
} from '$lib/services/telemetry.js';
import { setFetchErrorHandler } from '$lib/utils/browser-fetch.js';

describe('telemetry service', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal('navigator', {
			sendBeacon: vi.fn().mockReturnValue(true)
		});
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	describe('event types', () => {
		it('exports correct event type constants', () => {
			expect(EVENT_TYPE_UX).toBe('ux');
			expect(EVENT_TYPE_API).toBe('api');
			expect(EVENT_TYPE_ERROR).toBe('error');
			expect(EVENT_TYPE_SESSION).toBe('session');
			expect(EVENT_TYPE_DEVICE).toBe('device');
		});
	});

	describe('track', () => {
		it('queues event and sends via sendBeacon after delay', async () => {
			track('test_event', EVENT_TYPE_UX);

			vi.advanceTimersByTime(200);

			expect(navigator.sendBeacon).toHaveBeenCalledWith(
				'https://telemetry.example.com',
				expect.any(String)
			);
		});

		it('includes event metadata', async () => {
			track('test_event', EVENT_TYPE_UX, { customData: 'value' });

			vi.advanceTimersByTime(200);

			const beaconCall = navigator.sendBeacon.mock.calls[0];
			const events = JSON.parse(beaconCall[1]);

			expect(events[0]).toMatchObject({
				name: 'test_event',
				event_type: 'ux',
				browser_id: 'browser-123',
				device_id: 'device-456',
				session_id: 'session-789',
				trace_id: 'trace-001',
				app_name: 'test-app',
				app_version: '1.0.0',
				customData: 'value'
			});
		});

		it('batches multiple events', async () => {
			track('event1', EVENT_TYPE_UX);
			track('event2', EVENT_TYPE_API);

			vi.advanceTimersByTime(200);

			const beaconCall = navigator.sendBeacon.mock.calls[0];
			const events = JSON.parse(beaconCall[1]);

			expect(events).toHaveLength(2);
			expect(events[0].name).toBe('event1');
			expect(events[1].name).toBe('event2');
		});

		it('falls back to fetch when sendBeacon fails', async () => {
			navigator.sendBeacon.mockReturnValue(false);

			track('test_event', EVENT_TYPE_UX);

			vi.advanceTimersByTime(200);
			await vi.runAllTimersAsync();

			expect(fetch).toHaveBeenCalledWith(
				'https://telemetry.example.com',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});
	});

	describe('trackError', () => {
		it('tracks Error objects with message and stack', async () => {
			const error = new Error('Test error');
			trackError(error, { context: 'test' });

			vi.advanceTimersByTime(200);

			const beaconCall = navigator.sendBeacon.mock.calls[0];
			const events = JSON.parse(beaconCall[1]);

			expect(events[0]).toMatchObject({
				event_type: 'error',
				error: 'Test error',
				context: 'test'
			});
			expect(events[0].stack).toBeDefined();
		});

		it('handles string errors', async () => {
			trackError('String error');

			vi.advanceTimersByTime(200);

			const beaconCall = navigator.sendBeacon.mock.calls[0];
			const events = JSON.parse(beaconCall[1]);

			expect(events[0].error).toBe('String error');
		});

		it('uses custom name from context', async () => {
			trackError(new Error('Test'), { name: 'custom_error' });

			vi.advanceTimersByTime(200);

			const beaconCall = navigator.sendBeacon.mock.calls[0];
			const events = JSON.parse(beaconCall[1]);

			expect(events[0].name).toBe('custom_error');
		});
	});

	describe('flush', () => {
		it('sends queued events immediately', async () => {
			track('test_event', EVENT_TYPE_UX);

			await flush();

			expect(navigator.sendBeacon).toHaveBeenCalled();
		});
	});

	describe('fetch error handler', () => {
		it('registers a fetch error handler on module load', () => {
			expect(setFetchErrorHandler).toHaveBeenCalledWith(expect.any(Function));
		});

		it('tracks fetch errors when handler is called', async () => {
			const errorHandler = setFetchErrorHandler.mock.calls[0][0];
			const errorData = { url: 'https://example.com', status: 500 };

			errorHandler(errorData);

			vi.advanceTimersByTime(200);

			const beaconCall = navigator.sendBeacon.mock.calls[0];
			const events = JSON.parse(beaconCall[1]);

			expect(events[0]).toMatchObject({
				name: 'error-fetch',
				event_type: 'error',
				url: 'https://example.com',
				status: 500
			});
		});
	});
});
