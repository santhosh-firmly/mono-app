import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	SessionManager,
	sdkSessionManager,
	dropinSessionManager,
	SESSION_CONFIG
} from './session-manager.js';

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

// Mock window object
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
	let sessionManager;

	beforeEach(() => {
		sessionManager = new SessionManager({
			storagePrefix: 'TEST_SESSION',
			sessionIdPrefix: 'TEST_SID',
			timeouts: {
				browserSession: 1000,
				paymentKey: 500,
				productDetails: 2000
			}
		});

		// Clear all mocks and storage
		vi.clearAllMocks();
		mockLocalStorage.storage.clear();
		mockSessionStorage.storage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with default options', () => {
			const manager = new SessionManager();
			expect(manager.storagePrefix).toBe('FBS');
			expect(manager.sessionIdPrefix).toBe('FRSID');
			expect(manager.timeouts.browserSession).toBe(5000);
		});

		it('should initialize with custom options', () => {
			const customOptions = {
				storagePrefix: 'CUSTOM_PREFIX',
				sessionIdPrefix: 'CUSTOM_SID',
				timeouts: { browserSession: 3000 }
			};
			const manager = new SessionManager(customOptions);

			expect(manager.storagePrefix).toBe('CUSTOM_PREFIX');
			expect(manager.sessionIdPrefix).toBe('CUSTOM_SID');
			expect(manager.timeouts.browserSession).toBe(3000);
		});
	});

	describe('getSecondsSinceEpoch', () => {
		it('should return current timestamp in seconds', () => {
			const now = Date.now();
			vi.spyOn(Date, 'now').mockReturnValue(now);

			const result = sessionManager.getSecondsSinceEpoch();
			expect(result).toBe(Math.floor(now / 1000));
		});
	});

	describe('generateRandomId', () => {
		it('should generate random string of default length', () => {
			const id = sessionManager.generateRandomId();
			expect(id).toHaveLength(16);
			expect(typeof id).toBe('string');
		});

		it('should generate random string of custom length', () => {
			const id = sessionManager.generateRandomId(10);
			expect(id).toHaveLength(10);
		});

		it('should generate different IDs on subsequent calls', () => {
			const id1 = sessionManager.generateRandomId();
			const id2 = sessionManager.generateRandomId();
			expect(id1).not.toBe(id2);
		});
	});

	describe('isBrowser', () => {
		it('should return true when window is defined', () => {
			expect(sessionManager.isBrowser()).toBe(true);
		});

		it('should return false when window is undefined', () => {
			const originalWindow = global.window;
			global.window = undefined;

			expect(sessionManager.isBrowser()).toBe(false);

			global.window = originalWindow;
		});
	});

	describe('getStoredSession', () => {
		it('should return null when no session is stored', () => {
			const session = sessionManager.getStoredSession();
			expect(session).toBeNull();
		});

		it('should return parsed session from localStorage', () => {
			const testSession = { access_token: 'test-token', device_id: 'device-123' };
			mockLocalStorage.storage.set('TEST_SESSION', JSON.stringify(testSession));

			const session = sessionManager.getStoredSession();
			expect(session).toEqual(testSession);
		});

		it('should return current session when localStorage fails', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const testSession = { access_token: 'memory-token' };
			sessionManager.currentSession = testSession;
			mockLocalStorage.storage.set('TEST_SESSION', 'invalid-json');

			const session = sessionManager.getStoredSession();
			expect(session).toEqual(testSession);
			consoleSpy.mockRestore();
		});

		it('should handle JSON parse errors gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			mockLocalStorage.storage.set('TEST_SESSION', 'invalid-json');

			const session = sessionManager.getStoredSession();
			expect(session).toBeNull();
			expect(consoleSpy).toHaveBeenCalledWith(
				'Error parsing stored session:',
				expect.any(Error)
			);
		});
	});

	describe('setStoredSession', () => {
		it('should store session in both memory and localStorage', () => {
			const testSession = { access_token: 'test-token', device_id: 'device-123' };

			sessionManager.setStoredSession(testSession);

			expect(sessionManager.currentSession).toEqual(testSession);
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'TEST_SESSION',
				JSON.stringify(testSession)
			);
		});

		it('should handle localStorage errors gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const testSession = { access_token: 'test-token' };

			// Mock storage availability to pass but then setItem to fail
			sessionManager.isStorageAvailable = vi.fn().mockReturnValue(true);
			mockLocalStorage.setItem.mockImplementation(() => {
				throw new Error('Storage error');
			});

			sessionManager.setStoredSession(testSession);

			expect(sessionManager.currentSession).toEqual(testSession);
			expect(consoleSpy).toHaveBeenCalledWith('Error storing session:', expect.any(Error));
		});
	});

	describe('session ID management', () => {
		it('should get session ID from sessionStorage', () => {
			mockSessionStorage.storage.set('TEST_SID', 'session-123');

			const sessionId = sessionManager.getSessionId();
			expect(sessionId).toBe('session-123');
		});

		it('should set session ID in sessionStorage', () => {
			sessionManager.setSessionId('new-session-123');

			expect(mockSessionStorage.setItem).toHaveBeenCalledWith('TEST_SID', 'new-session-123');
		});

		it('should initialize new session ID when none exists', () => {
			const result = sessionManager.initializeSessionId();

			expect(result.sessionId).toMatch(/^s.{16}$/);
			expect(result.isNew).toBe(true);
			expect(mockSessionStorage.setItem).toHaveBeenCalledWith('TEST_SID', result.sessionId);
		});

		it('should return existing session ID when one exists', () => {
			mockSessionStorage.storage.set('TEST_SID', 'existing-session');

			const result = sessionManager.initializeSessionId();

			expect(result.sessionId).toBe('existing-session');
			expect(result.isNew).toBe(false);
		});
	});

	describe('isSessionValid', () => {
		it('should return false for null session', () => {
			expect(sessionManager.isSessionValid(null)).toBe(false);
		});

		it('should return false for session without expires', () => {
			const session = { access_token: 'token' };
			expect(sessionManager.isSessionValid(session)).toBe(false);
		});

		it('should return false for expired session', () => {
			const now = Math.floor(Date.now() / 1000);
			const session = { access_token: 'token', expires: now - 1000 };

			expect(sessionManager.isSessionValid(session)).toBe(false);
		});

		it('should return true for valid session with buffer', () => {
			const now = Math.floor(Date.now() / 1000);
			const session = { access_token: 'token', expires: now + 400 }; // 400 > 300 buffer

			vi.spyOn(sessionManager, 'getSecondsSinceEpoch').mockReturnValue(now);

			expect(sessionManager.isSessionValid(session)).toBe(true);
		});
	});

	describe('fetchBrowserSession', () => {
		it('should fetch new session successfully', async () => {
			const mockResponse = {
				ok: true,
				json: () =>
					Promise.resolve({
						access_token: 'new-token',
						device_id: 'device-456',
						expires: Math.floor(Date.now() / 1000) + 3600
					})
			};
			mockFetch.mockResolvedValue(mockResponse);

			const session = await sessionManager.fetchBrowserSession(
				'app-123',
				'https://api.test.com'
			);

			expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/v1/browser-session', {
				method: 'POST',
				headers: {
					'x-firmly-app-id': 'app-123',
					'Content-Type': 'application/json'
				},
				signal: expect.any(AbortSignal),
				credentials: 'include'
			});

			expect(session).toEqual({
				access_token: 'new-token',
				device_id: 'device-456',
				expires: Math.floor(Date.now() / 1000) + 3600
			});
		});

		it('should include existing token in request body', async () => {
			const existingSession = { access_token: 'existing-token' };
			sessionManager.setStoredSession(existingSession);

			const mockResponse = {
				ok: true,
				json: () =>
					Promise.resolve({
						access_token: 'refreshed-token',
						expires: Math.floor(Date.now() / 1000) + 3600
					})
			};
			mockFetch.mockResolvedValue(mockResponse);

			await sessionManager.fetchBrowserSession('app-123', 'https://api.test.com');

			expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/v1/browser-session', {
				method: 'POST',
				headers: {
					'x-firmly-app-id': 'app-123',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ access_token: 'existing-token' }),
				signal: expect.any(AbortSignal),
				credentials: 'include'
			});
		});

		it('should call onDeviceCreated callback when device is created', async () => {
			const onDeviceCreated = vi.fn();
			const mockResponse = {
				ok: true,
				json: () =>
					Promise.resolve({
						access_token: 'new-token',
						device_id: 'device-789',
						device_created: true,
						expires: Math.floor(Date.now() / 1000) + 3600
					})
			};
			mockFetch.mockResolvedValue(mockResponse);

			const session = await sessionManager.fetchBrowserSession(
				'app-123',
				'https://api.test.com',
				{
					onDeviceCreated
				}
			);

			expect(onDeviceCreated).toHaveBeenCalledWith({
				access_token: 'new-token',
				device_id: 'device-789',
				device_created: true,
				expires: Math.floor(Date.now() / 1000) + 3600
			});
		});

		it('should handle fetch timeout', async () => {
			mockFetch.mockImplementation(() => {
				return new Promise((_, reject) => {
					setTimeout(() => reject({ name: 'AbortError' }), 100);
				});
			});

			await expect(
				sessionManager.fetchBrowserSession('app-123', 'https://api.test.com')
			).rejects.toThrow('Session request timed out');
		});

		it('should handle HTTP errors', async () => {
			const mockResponse = { ok: false, status: 401 };
			mockFetch.mockResolvedValue(mockResponse);

			await expect(
				sessionManager.fetchBrowserSession('app-123', 'https://api.test.com')
			).rejects.toThrow('Session fetch failed: 401');
		});

		it('should throw error for invalid parameters', async () => {
			await expect(
				sessionManager.fetchBrowserSession(null, 'https://api.test.com')
			).rejects.toThrow('Invalid parameters for session fetch');

			await expect(sessionManager.fetchBrowserSession('app-123', null)).rejects.toThrow(
				'Invalid parameters for session fetch'
			);
		});
	});

	describe('getAccessToken', () => {
		it('should return token from valid session', async () => {
			const now = Math.floor(Date.now() / 1000);
			const validSession = { access_token: 'valid-token', expires: now + 600 };

			vi.spyOn(sessionManager, 'getStoredSession').mockReturnValue(validSession);
			vi.spyOn(sessionManager, 'getSecondsSinceEpoch').mockReturnValue(now);

			const token = await sessionManager.getAccessToken('app-123', 'https://api.test.com');

			expect(token).toBe('valid-token');
		});

		it('should fetch new session when current is invalid', async () => {
			const now = Math.floor(Date.now() / 1000);
			const expiredSession = { access_token: 'expired-token', expires: now - 100 };
			const newSession = { access_token: 'new-token', expires: now + 600 };

			vi.spyOn(sessionManager, 'getStoredSession').mockReturnValue(expiredSession);
			vi.spyOn(sessionManager, 'getSecondsSinceEpoch').mockReturnValue(now);
			vi.spyOn(sessionManager, 'fetchBrowserSession').mockResolvedValue(newSession);

			const token = await sessionManager.getAccessToken('app-123', 'https://api.test.com');

			expect(sessionManager.fetchBrowserSession).toHaveBeenCalledWith(
				'app-123',
				'https://api.test.com',
				{}
			);
			expect(token).toBe('new-token');
		});

		it('should return stale token when allowStaleToken is true and fetch fails', async () => {
			const staleSession = { access_token: 'stale-token', expires: Date.now() - 1000 };

			vi.spyOn(sessionManager, 'getStoredSession').mockReturnValue(staleSession);
			vi.spyOn(sessionManager, 'fetchBrowserSession').mockRejectedValue(
				new Error('Network error')
			);

			const token = await sessionManager.getAccessToken('app-123', 'https://api.test.com', {
				allowStaleToken: true
			});

			expect(token).toBe('stale-token');
		});

		it('should throw error when fetch fails and no stale token allowed', async () => {
			vi.spyOn(sessionManager, 'getStoredSession').mockReturnValue(null);
			vi.spyOn(sessionManager, 'fetchBrowserSession').mockRejectedValue(
				new Error('Network error')
			);

			await expect(
				sessionManager.getAccessToken('app-123', 'https://api.test.com')
			).rejects.toThrow('Network error');
		});
	});

	describe('getAuthHeaders', () => {
		it('should return headers with authorization token', async () => {
			vi.spyOn(sessionManager, 'getAccessToken').mockResolvedValue('test-token');

			const headers = await sessionManager.getAuthHeaders('app-123', 'https://api.test.com');

			expect(headers).toEqual({
				headers: {
					'Content-Type': 'application/json',
					'x-firmly-authorization': 'test-token'
				}
			});
		});

		it('should return basic headers when token fetch fails', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.spyOn(sessionManager, 'getAccessToken').mockRejectedValue(new Error('Token error'));

			const headers = await sessionManager.getAuthHeaders('app-123', 'https://api.test.com');

			expect(headers).toEqual({
				headers: {
					'Content-Type': 'application/json'
				}
			});
			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to get auth headers:',
				expect.any(Error)
			);
		});
	});

	describe('clearSession', () => {
		it('should clear all session data', () => {
			sessionManager.currentSession = { access_token: 'test' };
			mockLocalStorage.storage.set('TEST_SESSION', 'data');
			mockSessionStorage.storage.set('TEST_SID', 'data');

			sessionManager.clearSession();

			expect(sessionManager.currentSession).toBeNull();
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('TEST_SESSION');
			expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('TEST_SID');
		});
	});

	describe('getDeviceId', () => {
		it('should return device ID from session', () => {
			const session = { device_id: 'device-123', access_token: 'token' };
			vi.spyOn(sessionManager, 'getStoredSession').mockReturnValue(session);

			const deviceId = sessionManager.getDeviceId();

			expect(deviceId).toBe('device-123');
		});

		it('should return null when no session or device ID', () => {
			vi.spyOn(sessionManager, 'getStoredSession').mockReturnValue(null);

			const deviceId = sessionManager.getDeviceId();

			expect(deviceId).toBeNull();
		});
	});

	describe('refreshSession', () => {
		it('should force fetch new session', async () => {
			const newSession = { access_token: 'refreshed-token' };
			vi.spyOn(sessionManager, 'fetchBrowserSession').mockResolvedValue(newSession);

			const session = await sessionManager.refreshSession('app-123', 'https://api.test.com');

			expect(sessionManager.fetchBrowserSession).toHaveBeenCalledWith(
				'app-123',
				'https://api.test.com',
				{}
			);
			expect(session).toEqual(newSession);
		});

		it('should handle refresh errors', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.spyOn(sessionManager, 'fetchBrowserSession').mockRejectedValue(
				new Error('Refresh failed')
			);

			await expect(
				sessionManager.refreshSession('app-123', 'https://api.test.com')
			).rejects.toThrow('Refresh failed');

			expect(consoleSpy).toHaveBeenCalledWith('Session refresh failed:', expect.any(Error));
		});
	});
});

describe('Exported instances', () => {
	it('should export sdkSessionManager with correct configuration', () => {
		expect(sdkSessionManager).toBeInstanceOf(SessionManager);
		expect(sdkSessionManager.storagePrefix).toBe('FBS_SDK');
		expect(sdkSessionManager.sessionIdPrefix).toBe('FRSID_SDK');
	});

	it('should export dropinSessionManager with correct configuration', () => {
		expect(dropinSessionManager).toBeInstanceOf(SessionManager);
		expect(dropinSessionManager.storagePrefix).toBe('FBS');
		expect(dropinSessionManager.sessionIdPrefix).toBe('FRSID');
	});
});

describe('SESSION_CONFIG', () => {
	it('should export correct timeout configurations', () => {
		expect(SESSION_CONFIG.TIMEOUTS).toEqual({
			BROWSER_SESSION: 5000,
			PAYMENT_KEY: 3000,
			PRODUCT_DETAILS: 10000,
			DEFAULT_REQUEST: 8000,
			SDK_INITIALIZATION: 1000,
			DROPIN_INITIALIZATION: 2000
		});
	});

	it('should export correct storage configurations', () => {
		expect(SESSION_CONFIG.STORAGE).toEqual({
			SDK_SESSION: 'FBS_SDK',
			SDK_SESSION_ID: 'FRSID_SDK',
			DROPIN_SESSION: 'FBS',
			DROPIN_SESSION_ID: 'FRSID',
			PAYMENT_KEY: 'FPKEY',
			CC_SERVER: 'FPS',
			BROWSER_ID: 'FLDID',
			PARENT_UTM: 'FPARUTM',
			SESSION_CART: 'FSSCAR',
			WALLET_C2P_ACCESS_TOKEN: 'FWC2P'
		});
	});

	it('should export correct expiry buffer', () => {
		expect(SESSION_CONFIG.EXPIRY_BUFFER_SECONDS).toBe(300);
	});
});
