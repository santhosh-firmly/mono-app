import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockStorageManager } from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/storage-manager.js', () => createMockStorageManager());

import { SessionManager, sessionManager, sdkSessionManager } from '$lib/utils/session-manager.js';
import { saveToStorage, loadFromStorage, removeFromStorage } from '$lib/utils/storage-manager.js';

describe('session-manager', () => {
	let mockSessionStorage;
	let mockLocalStorage;

	beforeEach(() => {
		vi.clearAllMocks();

		mockSessionStorage = {
			getItem: vi.fn().mockReturnValue(null),
			setItem: vi.fn(),
			removeItem: vi.fn()
		};

		mockLocalStorage = {
			getItem: vi.fn().mockReturnValue(null),
			setItem: vi.fn(),
			removeItem: vi.fn()
		};

		vi.stubGlobal('window', {
			localStorage: mockLocalStorage,
			sessionStorage: mockSessionStorage
		});

		vi.stubGlobal('crypto', {
			getRandomValues: vi.fn((array) => {
				for (let i = 0; i < array.length; i++) {
					array[i] = Math.floor(Math.random() * 256);
				}
				return array;
			})
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('SessionManager', () => {
		let manager;

		beforeEach(() => {
			manager = new SessionManager();
		});

		describe('constructor', () => {
			it('uses default prefixes', () => {
				expect(manager.storagePrefix).toBe('FBS');
				expect(manager.sessionIdPrefix).toBe('FRSID');
			});

			it('accepts custom prefixes', () => {
				const customManager = new SessionManager({
					storagePrefix: 'CUSTOM',
					sessionIdPrefix: 'CUSTOM_SID'
				});
				expect(customManager.storagePrefix).toBe('CUSTOM');
				expect(customManager.sessionIdPrefix).toBe('CUSTOM_SID');
			});

			it('initializes currentSession as null', () => {
				expect(manager.currentSession).toBeNull();
			});
		});

		describe('isBrowser', () => {
			it('returns truthy when window, localStorage and sessionStorage exist', () => {
				expect(manager.isBrowser()).toBeTruthy();
			});

			it('returns falsy when window is undefined', () => {
				vi.stubGlobal('window', undefined);
				expect(manager.isBrowser()).toBeFalsy();
			});

			it('returns falsy when localStorage is missing', () => {
				vi.stubGlobal('window', { sessionStorage: mockSessionStorage });
				expect(manager.isBrowser()).toBeFalsy();
			});

			it('returns falsy when sessionStorage is missing', () => {
				vi.stubGlobal('window', { localStorage: mockLocalStorage });
				expect(manager.isBrowser()).toBeFalsy();
			});
		});

		describe('generateRandomId', () => {
			it('generates ID of specified length', () => {
				const id = manager.generateRandomId(20);
				expect(id).toHaveLength(20);
			});

			it('uses default length of 16', () => {
				const id = manager.generateRandomId();
				expect(id).toHaveLength(16);
			});

			it('generates alphanumeric characters only', () => {
				const id = manager.generateRandomId(100);
				expect(id).toMatch(/^[A-Za-z0-9]+$/);
			});

			it('falls back to Math.random when crypto is unavailable', () => {
				vi.stubGlobal('crypto', undefined);
				const id = manager.generateRandomId(16);
				expect(id).toHaveLength(16);
				expect(id).toMatch(/^[A-Za-z0-9]+$/);
			});
		});

		describe('getStoredSession', () => {
			it('returns currentSession if set', () => {
				const session = { access_token: 'token123' };
				manager.currentSession = session;
				expect(manager.getStoredSession()).toBe(session);
			});

			it('returns stored session from storage if currentSession is null', () => {
				const storedSession = { access_token: 'stored123' };
				loadFromStorage.mockReturnValueOnce(storedSession);
				expect(manager.getStoredSession()).toBe(storedSession);
			});

			it('returns currentSession in non-browser environment', () => {
				vi.stubGlobal('window', undefined);
				const session = { access_token: 'token123' };
				manager.currentSession = session;
				expect(manager.getStoredSession()).toBe(session);
			});
		});

		describe('setStoredSession', () => {
			it('sets currentSession', () => {
				const session = { access_token: 'token123' };
				manager.setStoredSession(session);
				expect(manager.currentSession).toBe(session);
			});

			it('saves to storage in browser environment', () => {
				const session = { access_token: 'token123' };
				manager.setStoredSession(session);
				expect(saveToStorage).toHaveBeenCalledWith('FBS', session);
			});

			it('does not save to storage in non-browser environment', () => {
				vi.stubGlobal('window', undefined);
				const session = { access_token: 'token123' };
				manager.setStoredSession(session);
				expect(saveToStorage).not.toHaveBeenCalled();
			});
		});

		describe('getSessionId', () => {
			it('returns session ID from sessionStorage', () => {
				mockSessionStorage.getItem.mockReturnValueOnce('sABC123');
				expect(manager.getSessionId()).toBe('sABC123');
				expect(mockSessionStorage.getItem).toHaveBeenCalledWith('FRSID');
			});

			it('returns null in non-browser environment', () => {
				vi.stubGlobal('window', undefined);
				expect(manager.getSessionId()).toBeNull();
			});
		});

		describe('setSessionId', () => {
			it('saves session ID to sessionStorage', () => {
				manager.setSessionId('sNewSessionId');
				expect(mockSessionStorage.setItem).toHaveBeenCalledWith('FRSID', 'sNewSessionId');
			});

			it('does nothing in non-browser environment', () => {
				vi.stubGlobal('window', undefined);
				manager.setSessionId('sNewSessionId');
				expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
			});
		});

		describe('initializeSessionId', () => {
			it('returns existing session ID if present', () => {
				mockSessionStorage.getItem.mockReturnValueOnce('sExisting123');
				const result = manager.initializeSessionId();
				expect(result).toEqual({ sessionId: 'sExisting123', isNew: false });
			});

			it('generates new session ID if not present', () => {
				mockSessionStorage.getItem.mockReturnValueOnce(null);
				const result = manager.initializeSessionId();
				expect(result.isNew).toBe(true);
				expect(result.sessionId).toMatch(/^s[A-Za-z0-9]{16}$/);
			});

			it('saves new session ID to sessionStorage', () => {
				mockSessionStorage.getItem.mockReturnValueOnce(null);
				manager.initializeSessionId();
				expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
					'FRSID',
					expect.stringMatching(/^s[A-Za-z0-9]{16}$/)
				);
			});
		});

		describe('isSessionValid', () => {
			it('returns false when session has no expires', () => {
				manager.currentSession = { access_token: 'token' };
				expect(manager.isSessionValid()).toBe(false);
			});

			it('returns false when session is expired', () => {
				const pastTime = Math.floor(Date.now() / 1000) - 1000;
				manager.currentSession = { expires: pastTime };
				expect(manager.isSessionValid()).toBe(false);
			});

			it('returns false when session expires within buffer (5 minutes)', () => {
				const bufferTime = Math.floor(Date.now() / 1000) + 200; // Within 5 min buffer
				manager.currentSession = { expires: bufferTime };
				expect(manager.isSessionValid()).toBe(false);
			});

			it('returns true when session is valid beyond buffer', () => {
				const futureTime = Math.floor(Date.now() / 1000) + 600; // Beyond 5 min buffer
				manager.currentSession = { expires: futureTime };
				expect(manager.isSessionValid()).toBe(true);
			});

			it('checks provided session instead of stored session', () => {
				manager.currentSession = { expires: Math.floor(Date.now() / 1000) - 1000 };
				const validSession = { expires: Math.floor(Date.now() / 1000) + 600 };
				expect(manager.isSessionValid(validSession)).toBe(true);
			});
		});

		describe('getAccessToken', () => {
			it('returns access token from stored session', () => {
				manager.currentSession = { access_token: 'myToken123' };
				expect(manager.getAccessToken()).toBe('myToken123');
			});

			it('returns null when no session', () => {
				expect(manager.getAccessToken()).toBeNull();
			});

			it('returns null when session has no access_token', () => {
				manager.currentSession = { expires: 12345 };
				expect(manager.getAccessToken()).toBeNull();
			});
		});

		describe('getDeviceId', () => {
			it('returns device ID from stored session', () => {
				manager.currentSession = { device_id: 'device123' };
				expect(manager.getDeviceId()).toBe('device123');
			});

			it('returns null when no session', () => {
				expect(manager.getDeviceId()).toBeNull();
			});
		});

		describe('getBrowserId', () => {
			it('returns browser ID from stored session', () => {
				manager.currentSession = { browser_id: 'browser456' };
				expect(manager.getBrowserId()).toBe('browser456');
			});

			it('returns null when no session', () => {
				expect(manager.getBrowserId()).toBeNull();
			});
		});

		describe('clearSession', () => {
			it('clears currentSession', () => {
				manager.currentSession = { access_token: 'token' };
				manager.clearSession();
				expect(manager.currentSession).toBeNull();
			});

			it('removes from storage in browser environment', () => {
				manager.clearSession();
				expect(removeFromStorage).toHaveBeenCalledWith('FBS');
				expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('FRSID');
			});

			it('does not call storage in non-browser environment', () => {
				vi.stubGlobal('window', undefined);
				manager.clearSession();
				expect(removeFromStorage).not.toHaveBeenCalled();
			});
		});
	});

	describe('exported instances', () => {
		it('exports sessionManager with default prefixes', () => {
			expect(sessionManager).toBeInstanceOf(SessionManager);
			expect(sessionManager.storagePrefix).toBe('FBS');
			expect(sessionManager.sessionIdPrefix).toBe('FRSID');
		});

		it('exports sdkSessionManager with SDK prefixes', () => {
			expect(sdkSessionManager).toBeInstanceOf(SessionManager);
			expect(sdkSessionManager.storagePrefix).toBe('FBS_SDK');
			expect(sdkSessionManager.sessionIdPrefix).toBe('FRSID_SDK');
		});
	});
});
