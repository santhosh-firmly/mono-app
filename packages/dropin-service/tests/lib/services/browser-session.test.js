import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createMockSessionManager,
	createMockConfig,
	createMockTelemetry
} from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/session-manager.js', () => createMockSessionManager());
vi.mock('$lib/utils/config.js', () => ({
	config: createMockConfig({
		appId: 'test-app-id',
		apiServer: 'https://api.example.com',
		deviceId: null
	})
}));
vi.mock('./telemetry.js', () => createMockTelemetry());

import {
	fetchBrowserSession,
	getApiAccessToken,
	getHeaders,
	getDeviceId
} from '$lib/services/browser-session.js';
import { sessionManager } from '$lib/utils/session-manager.js';
import { config } from '$lib/utils/config.js';

describe('browser-session service', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ access_token: 'new-token', device_id: 'device-123' })
			})
		);

		sessionManager.isBrowser.mockReturnValue(true);
		sessionManager.getStoredSession.mockReturnValue(null);
		sessionManager.isSessionValid.mockReturnValue(false);
		config.appId = 'test-app-id';
		config.apiServer = 'https://api.example.com';
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	describe('fetchBrowserSession', () => {
		it('throws when not in browser environment', async () => {
			sessionManager.isBrowser.mockReturnValueOnce(false);

			await expect(fetchBrowserSession('app-id', 'https://api.example.com')).rejects.toThrow(
				'Invalid parameters for session fetch'
			);
		});

		it('throws when appId is missing', async () => {
			await expect(fetchBrowserSession('', 'https://api.example.com')).rejects.toThrow(
				'Invalid parameters for session fetch'
			);
		});

		it('throws when apiServer is missing', async () => {
			await expect(fetchBrowserSession('app-id', '')).rejects.toThrow(
				'Invalid parameters for session fetch'
			);
		});

		it('makes POST request to browser-session endpoint', async () => {
			await fetchBrowserSession('test-app', 'https://api.example.com');

			expect(fetch).toHaveBeenCalledWith(
				'https://api.example.com/api/v1/browser-session',
				expect.objectContaining({
					method: 'POST',
					credentials: 'include',
					headers: expect.objectContaining({
						'x-firmly-app-id': 'test-app',
						'Content-Type': 'application/json'
					})
				})
			);
		});

		it('includes existing access_token in request body', async () => {
			sessionManager.getStoredSession.mockReturnValueOnce({
				access_token: 'existing-token'
			});

			await fetchBrowserSession('test-app', 'https://api.example.com');

			expect(fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					body: JSON.stringify({ access_token: 'existing-token' })
				})
			);
		});

		it('stores session data on success', async () => {
			const sessionData = { access_token: 'new-token' };

			fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(sessionData)
			});

			await fetchBrowserSession('test-app', 'https://api.example.com');

			expect(sessionManager.setStoredSession).toHaveBeenCalledWith(sessionData);
		});

		it('calls onDeviceCreated callback when device is created', async () => {
			const onDeviceCreated = vi.fn();
			const sessionData = {
				access_token: 'new-token',
				device_id: 'device-123',
				device_created: true
			};

			fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(sessionData)
			});

			await fetchBrowserSession('test-app', 'https://api.example.com', { onDeviceCreated });

			expect(onDeviceCreated).toHaveBeenCalledWith(sessionData);
		});

		it('does not call onDeviceCreated when device was not created', async () => {
			const onDeviceCreated = vi.fn();
			const sessionData = {
				access_token: 'new-token',
				device_id: 'device-123',
				device_created: false
			};

			fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(sessionData)
			});

			await fetchBrowserSession('test-app', 'https://api.example.com', { onDeviceCreated });

			expect(onDeviceCreated).not.toHaveBeenCalled();
		});

		it('throws timeout error when request times out', async () => {
			const abortError = new Error('Aborted');
			abortError.name = 'AbortError';
			fetch.mockRejectedValueOnce(abortError);

			await expect(
				fetchBrowserSession('test-app', 'https://api.example.com')
			).rejects.toThrow('Session request timed out');
		});

		it('rethrows non-abort errors', async () => {
			const networkError = new Error('Network failure');
			fetch.mockRejectedValueOnce(networkError);

			await expect(
				fetchBrowserSession('test-app', 'https://api.example.com')
			).rejects.toThrow('Network failure');
		});

		it('throws on HTTP error', async () => {
			fetch.mockResolvedValueOnce({
				ok: false,
				status: 401
			});

			await expect(
				fetchBrowserSession('test-app', 'https://api.example.com')
			).rejects.toThrow('Session fetch failed: 401');
		});
	});

	describe('getApiAccessToken', () => {
		it('returns null when appId is not configured', async () => {
			config.appId = '';

			const token = await getApiAccessToken();

			expect(token).toBe(null);
		});

		it('returns null when apiServer is not configured', async () => {
			config.apiServer = '';

			const token = await getApiAccessToken();

			expect(token).toBe(null);
		});

		it('returns existing token when session is valid', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(true);
			sessionManager.getStoredSession.mockReturnValueOnce({
				access_token: 'valid-token'
			});

			const token = await getApiAccessToken();

			expect(token).toBe('valid-token');
		});

		it('fetches new session when current is invalid', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(false);

			fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ access_token: 'new-token' })
			});

			const token = await getApiAccessToken();

			expect(token).toBe('new-token');
		});

		it('returns stale token when allowStaleToken is true and fetch fails', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(false);
			sessionManager.getStoredSession.mockReturnValue({ access_token: 'stale-token' });
			sessionManager.isBrowser.mockReturnValueOnce(false);

			const token = await getApiAccessToken({ allowStaleToken: true });

			expect(token).toBe('stale-token');
		});

		it('returns null when fetch fails and allowStaleToken is false', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(false);
			sessionManager.getStoredSession.mockReturnValue(null);
			sessionManager.isBrowser.mockReturnValueOnce(false);

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const token = await getApiAccessToken({ allowStaleToken: false });

			expect(token).toBe(null);
			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it('returns null when session has no access_token', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(true);
			sessionManager.getStoredSession.mockReturnValueOnce({});

			const token = await getApiAccessToken();

			expect(token).toBe(null);
		});
	});

	describe('getHeaders', () => {
		it('returns headers with authorization token', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(true);
			sessionManager.getStoredSession.mockReturnValueOnce({ access_token: 'test-token' });

			const result = await getHeaders();

			expect(result.headers['Content-Type']).toBe('application/json');
			expect(result.headers['x-firmly-authorization']).toBe('test-token');
		});

		it('returns headers without authorization when not configured', async () => {
			config.appId = '';

			const result = await getHeaders();

			expect(result.headers).toEqual({
				'Content-Type': 'application/json'
			});
		});

		it('returns headers with null authorization when token fetch fails', async () => {
			sessionManager.isSessionValid.mockReturnValueOnce(false);
			const networkError = new Error('Network failure');
			fetch.mockRejectedValueOnce(networkError);

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const result = await getHeaders();
			consoleSpy.mockRestore();

			expect(result.headers['Content-Type']).toBe('application/json');
			expect(result.headers['x-firmly-authorization']).toBe(null);
		});

		it('returns basic headers when getApiAccessToken throws an error', async () => {
			// Force getApiAccessToken to throw an error
			sessionManager.isSessionValid.mockImplementation(() => {
				throw new Error('Unexpected error');
			});

			const result = await getHeaders();

			expect(result.headers).toEqual({
				'Content-Type': 'application/json'
			});
		});
	});

	describe('getDeviceId', () => {
		it('returns device ID from session manager', () => {
			const deviceId = getDeviceId();

			expect(deviceId).toBe('device-123');
		});
	});
});
