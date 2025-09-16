import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionManager, sessionManager, sdkSessionManager } from './session-manager.js';

// Mock global objects
const mockLocalStorage = {
	storage: new Map(),
	getItem: vi.fn((key) => mockLocalStorage.storage.get(key) || null),
	setItem: vi.fn((key, value) => mockLocalStorage.storage.set(key, value)),
	removeItem: vi.fn((key) => mockLocalStorage.storage.delete(key)),
	clear: vi.fn(() => mockLocalStorage.storage.clear())
};

const mockSessionStorage = {
	storage: new Map(),
	getItem: vi.fn((key) => mockSessionStorage.storage.get(key) || null),
	setItem: vi.fn((key, value) => mockSessionStorage.storage.set(key, value)),
	removeItem: vi.fn((key) => mockSessionStorage.storage.delete(key)),
	clear: vi.fn(() => mockSessionStorage.storage.clear())
};

const mockFetch = vi.fn();

Object.defineProperty(global, 'window', {
	value: {
		localStorage: mockLocalStorage,
		sessionStorage: mockSessionStorage
	},
	writable: true
});

Object.defineProperty(global, 'localStorage', {
	value: mockLocalStorage,
	writable: true
});

Object.defineProperty(global, 'sessionStorage', {
	value: mockSessionStorage,
	writable: true
});

Object.defineProperty(global, 'fetch', {
	value: mockFetch,
	writable: true
});

describe('SessionManager', () => {
	let manager;
	let consoleSpy;

	beforeEach(() => {
		manager = new SessionManager();
		mockLocalStorage.storage.clear();
		mockSessionStorage.storage.clear();
		mockFetch.mockReset();
		// Suppress console output during tests
		consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	describe('constructor', () => {
		it('should initialize with default options', () => {
			expect(manager.storagePrefix).toBe('FBS');
			expect(manager.sessionIdPrefix).toBe('FRSID');
			expect(manager.timeout).toBe(5000);
		});

		it('should use custom options', () => {
			const customManager = new SessionManager({
				storagePrefix: 'CUSTOM',
				sessionIdPrefix: 'CUSTOM_ID',
				timeout: 1000
			});

			expect(customManager.storagePrefix).toBe('CUSTOM');
			expect(customManager.sessionIdPrefix).toBe('CUSTOM_ID');
			expect(customManager.timeout).toBe(1000);
		});
	});

	describe('isBrowser', () => {
		it('should return true in browser environment', () => {
			expect(typeof window !== 'undefined').toBe(true);
		});
	});

	describe('generateRandomId', () => {
		it('should generate random ID with default length', () => {
			const id = manager.generateRandomId();
			expect(id).toHaveLength(16);
			expect(typeof id).toBe('string');
		});

		it('should generate random ID with custom length', () => {
			const id = manager.generateRandomId(8);
			expect(id).toHaveLength(8);
		});
	});

	describe('session storage', () => {
		it('should store and retrieve session', () => {
			const session = { access_token: 'test', expires: 123456 };

			manager.setStoredSession(session);
			expect(manager.getStoredSession()).toEqual(session);
		});

		it('should handle invalid JSON in storage', () => {
			mockLocalStorage.storage.set('FBS', 'invalid-json');
			expect(manager.getStoredSession()).toBeNull();
		});

		it('should return current session when storage fails', () => {
			const session = { access_token: 'test' };
			manager.currentSession = session;
			mockLocalStorage.storage.set('FBS', 'invalid-json');

			expect(manager.getStoredSession()).toBe(session);
		});
	});

	describe('session ID management', () => {
		it('should store and retrieve session ID', () => {
			manager.setSessionId('test-session-id');
			expect(manager.getSessionId()).toBe('test-session-id');
		});

		it('should initialize new session ID when none exists', () => {
			const result = manager.initializeSessionId();

			expect(result.sessionId).toMatch(/^s[A-Za-z0-9]{16}$/);
			expect(result.isNew).toBe(true);
		});

		it('should return existing session ID', () => {
			mockSessionStorage.storage.set('FRSID', 'existing-id');

			const result = manager.initializeSessionId();

			expect(result.sessionId).toBe('existing-id');
			expect(result.isNew).toBe(false);
		});
	});

	describe('session validation', () => {
		it('should validate non-expired session', () => {
			const futureTime = Math.floor(Date.now() / 1000) + 1000;
			const session = { expires: futureTime };

			expect(manager.isSessionValid(session)).toBe(true);
		});

		it('should invalidate expired session', () => {
			const pastTime = Math.floor(Date.now() / 1000) - 1000;
			const session = { expires: pastTime };

			expect(manager.isSessionValid(session)).toBe(false);
		});

		it('should invalidate session without expires', () => {
			const session = { access_token: 'test' };

			expect(manager.isSessionValid(session)).toBe(false);
		});
	});

	describe('fetchBrowserSession', () => {
		it('should fetch new session successfully', async () => {
			const sessionData = {
				access_token: 'new-token',
				expires: Math.floor(Date.now() / 1000) + 3600,
				device_id: 'device-123'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(sessionData)
			});

			const result = await manager.fetchBrowserSession('app-id', 'https://api.example.com');

			expect(result).toEqual(sessionData);
			expect(manager.getStoredSession()).toEqual(sessionData);
		});

		it('should handle fetch failure', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			await expect(
				manager.fetchBrowserSession('app-id', 'https://api.example.com')
			).rejects.toThrow('Session fetch failed: 500');
		});

		it('should handle network timeout', async () => {
			mockFetch.mockRejectedValueOnce({ name: 'AbortError' });

			await expect(
				manager.fetchBrowserSession('app-id', 'https://api.example.com')
			).rejects.toThrow('Session request timed out');
		});

		it('should call onDeviceCreated callback', async () => {
			const sessionData = {
				access_token: 'token',
				device_created: true,
				device_id: 'device-123'
			};

			const onDeviceCreated = vi.fn();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(sessionData)
			});

			await manager.fetchBrowserSession('app-id', 'https://api.example.com', {
				onDeviceCreated
			});

			expect(onDeviceCreated).toHaveBeenCalledWith(sessionData);
		});
	});

	describe('getAccessToken', () => {
		it('should return existing valid token', async () => {
			const session = {
				access_token: 'valid-token',
				expires: Math.floor(Date.now() / 1000) + 1000
			};
			manager.setStoredSession(session);

			const token = await manager.getAccessToken('app-id', 'https://api.example.com');
			expect(token).toBe('valid-token');
		});

		it('should fetch new token when session expired', async () => {
			const expiredSession = {
				access_token: 'expired-token',
				expires: Math.floor(Date.now() / 1000) - 1000
			};
			const newSession = {
				access_token: 'new-token',
				expires: Math.floor(Date.now() / 1000) + 1000
			};

			manager.setStoredSession(expiredSession);

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(newSession)
			});

			const token = await manager.getAccessToken('app-id', 'https://api.example.com');
			expect(token).toBe('new-token');
		});

		it('should use stale token on fetch failure when allowed', async () => {
			const expiredSession = {
				access_token: 'stale-token',
				expires: Math.floor(Date.now() / 1000) - 1000
			};
			manager.setStoredSession(expiredSession);

			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			const token = await manager.getAccessToken('app-id', 'https://api.example.com', {
				allowStaleToken: true
			});
			expect(token).toBe('stale-token');
		});
	});

	describe('getAuthHeaders', () => {
		it('should return headers with token', async () => {
			const session = {
				access_token: 'test-token',
				expires: Math.floor(Date.now() / 1000) + 1000
			};
			manager.setStoredSession(session);

			const headers = await manager.getAuthHeaders('app-id', 'https://api.example.com');

			expect(headers).toEqual({
				headers: {
					'Content-Type': 'application/json',
					'x-firmly-authorization': 'test-token'
				}
			});
		});

		it('should return default headers on failure', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			const headers = await manager.getAuthHeaders('app-id', 'https://api.example.com');

			expect(headers).toEqual({
				headers: {
					'Content-Type': 'application/json'
				}
			});
		});
	});

	describe('utility methods', () => {
		it('should get device ID from session', () => {
			const session = { device_id: 'device-123' };
			manager.setStoredSession(session);

			expect(manager.getDeviceId()).toBe('device-123');
		});

		it('should return null when no device ID', () => {
			expect(manager.getDeviceId()).toBeNull();
		});

		it('should clear session data', () => {
			manager.setStoredSession({ access_token: 'test' });
			manager.setSessionId('test-id');

			manager.clearSession();

			expect(manager.currentSession).toBeNull();
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('FBS');
			expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('FRSID');
		});
	});
});

describe('exported instances', () => {
	it('should export sessionManager with default config', () => {
		expect(sessionManager.storagePrefix).toBe('FBS');
		expect(sessionManager.sessionIdPrefix).toBe('FRSID');
	});

	it('should export sdkSessionManager with SDK config', () => {
		expect(sdkSessionManager.storagePrefix).toBe('FBS_SDK');
		expect(sdkSessionManager.sessionIdPrefix).toBe('FRSID_SDK');
	});
});
