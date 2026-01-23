/**
 * Session Manager Utility
 *
 * Pure utility for managing session state in storage.
 * Does NOT make API calls - those belong in services.
 */

import { saveToStorage, loadFromStorage, removeFromStorage } from './storage-manager.js';

// Session expiration buffer in seconds (5 minutes)
const SESSION_EXPIRATION_BUFFER_SECONDS = 300;

export class SessionManager {
	constructor(options = {}) {
		this.storagePrefix = options.storagePrefix || 'FBS';
		this.sessionIdPrefix = options.sessionIdPrefix || 'FRSID';
		this.currentSession = null;
	}

	isBrowser() {
		return typeof window !== 'undefined' && window.localStorage && window.sessionStorage;
	}

	generateRandomId(length = 16) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';

		if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
			const array = new Uint8Array(length);
			crypto.getRandomValues(array);
			for (let i = 0; i < length; i++) {
				result += chars.charAt(array[i] % chars.length);
			}
		} else {
			for (let i = 0; i < length; i++) {
				result += chars.charAt(Math.floor(Math.random() * chars.length));
			}
		}
		return result;
	}

	getStoredSession() {
		if (!this.isBrowser()) return this.currentSession;

		const stored = loadFromStorage(this.storagePrefix);
		return this.currentSession || stored;
	}

	setStoredSession(session) {
		this.currentSession = session;
		if (this.isBrowser()) {
			saveToStorage(this.storagePrefix, session);
		}
	}

	getSessionId() {
		if (!this.isBrowser()) return null;
		return window.sessionStorage.getItem(this.sessionIdPrefix);
	}

	setSessionId(sessionId) {
		if (this.isBrowser()) {
			window.sessionStorage.setItem(this.sessionIdPrefix, sessionId);
		}
	}

	initializeSessionId() {
		let sessionId = this.getSessionId();
		if (!sessionId) {
			sessionId = 's' + this.generateRandomId(16);
			this.setSessionId(sessionId);
			return { sessionId, isNew: true };
		}
		return { sessionId, isNew: false };
	}

	isSessionValid(session = null) {
		const sessionToCheck = session || this.getStoredSession();
		if (!sessionToCheck?.expires) return false;

		const currentTime = Math.floor(Date.now() / 1000);
		return sessionToCheck.expires > currentTime + SESSION_EXPIRATION_BUFFER_SECONDS;
	}

	getAccessToken() {
		const session = this.getStoredSession();
		return session?.access_token || null;
	}

	getDeviceId() {
		const session = this.getStoredSession();
		return session?.device_id || null;
	}

	getBrowserId() {
		const session = this.getStoredSession();
		return session?.browser_id || null;
	}

	clearSession() {
		this.currentSession = null;
		if (this.isBrowser()) {
			removeFromStorage(this.storagePrefix);
			window.sessionStorage.removeItem(this.sessionIdPrefix);
		}
	}
}

// Export instances
export const sessionManager = new SessionManager({
	storagePrefix: 'FBS',
	sessionIdPrefix: 'FRSID'
});

export const sdkSessionManager = new SessionManager({
	storagePrefix: 'FBS_SDK',
	sessionIdPrefix: 'FRSID_SDK'
});
