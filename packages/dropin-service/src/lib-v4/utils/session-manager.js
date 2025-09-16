/**
 * Simplified Session Manager
 * Handles browser sessions and JWT tokens with minimal complexity
 */

export class SessionManager {
	constructor(options = {}) {
		this.storagePrefix = options.storagePrefix || 'FBS';
		this.sessionIdPrefix = options.sessionIdPrefix || 'FRSID';
		this.timeout = options.timeout || 5000;
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

		try {
			const stored = window.localStorage.getItem(this.storagePrefix);
			return this.currentSession || (stored ? JSON.parse(stored) : null);
		} catch (error) {
			return this.currentSession;
		}
	}

	setStoredSession(session) {
		this.currentSession = session;

		if (this.isBrowser()) {
			try {
				window.localStorage.setItem(this.storagePrefix, JSON.stringify(session));
			} catch (error) {
				// Storage error - continue with in-memory session
			}
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
		return sessionToCheck.expires > currentTime + 300; // 5 minute buffer
	}

	async fetchBrowserSession(appId, apiServer, options = {}) {
		if (!this.isBrowser() || !appId || !apiServer) {
			throw new Error('Invalid parameters for session fetch');
		}

		const requestOptions = {
			method: 'POST',
			headers: {
				'x-firmly-app-id': appId,
				'Content-Type': 'application/json'
			}
		};

		const currentSession = this.getStoredSession();
		if (currentSession?.access_token) {
			requestOptions.body = JSON.stringify({
				access_token: currentSession.access_token
			});
		}

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeout);

			const response = await fetch(`${apiServer}/api/v1/browser-session`, {
				...requestOptions,
				signal: controller.signal,
				credentials: 'include'
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				const sessionData = await response.json();
				this.setStoredSession(sessionData);

				if (sessionData.device_created && options.onDeviceCreated) {
					options.onDeviceCreated(sessionData);
				}

				return sessionData;
			} else {
				throw new Error(`Session fetch failed: ${response.status}`);
			}
		} catch (error) {
			if (error.name === 'AbortError') {
				throw new Error('Session request timed out');
			}
			throw error;
		}
	}

	async getAccessToken(appId, apiServer, options = {}) {
		let session = this.getStoredSession();

		if (!this.isSessionValid(session)) {
			try {
				session = await this.fetchBrowserSession(appId, apiServer, options);
			} catch (error) {
				if (options.allowStaleToken && session?.access_token) {
					return session.access_token;
				}
				throw error;
			}
		}

		return session?.access_token || null;
	}

	async getAuthHeaders(appId, apiServer, options = {}) {
		try {
			const token = await this.getAccessToken(appId, apiServer, options);
			return {
				headers: {
					'Content-Type': 'application/json',
					'x-firmly-authorization': token
				}
			};
		} catch (error) {
			return {
				headers: {
					'Content-Type': 'application/json'
				}
			};
		}
	}

	getDeviceId() {
		const session = this.getStoredSession();
		return session?.device_id || null;
	}

	clearSession() {
		this.currentSession = null;
		if (this.isBrowser()) {
			window.localStorage.removeItem(this.storagePrefix);
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
