export class SessionManager {
	constructor(options = {}) {
		this.storagePrefix = options.storagePrefix || 'FBS';
		this.sessionIdPrefix = options.sessionIdPrefix || 'FRSID';
		this.timeouts = options.timeouts || {
			browserSession: 5000,
			paymentKey: 3000,
			productDetails: 10000
		};
		this.currentSession = null;
	}

	/**
	 * Get current timestamp in seconds since epoch
	 */
	getSecondsSinceEpoch() {
		return ~~(Date.now() / 1000);
	}

	/**
	 * Generate random ID for session management
	 */
	generateRandomId(length = 16) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	/**
	 * Check if running in browser environment
	 */
	isBrowser() {
		return typeof window !== 'undefined';
	}

	/**
	 * Get stored browser session from localStorage
	 */
	getStoredSession() {
		if (!this.isBrowser()) return null;

		const stored = localStorage.getItem(this.storagePrefix);
		if (!stored) return this.currentSession;

		try {
			const parsed = JSON.parse(stored);
			return this.currentSession || parsed || null;
		} catch (error) {
			console.error('Error parsing stored session:', error);
			return this.currentSession;
		}
	}

	/**
	 * Store browser session in localStorage and memory
	 */
	setStoredSession(session) {
		if (!this.isBrowser()) return;

		this.currentSession = session;
		try {
			const serialized = JSON.stringify(session);
			localStorage.setItem(this.storagePrefix, serialized);
		} catch (error) {
			console.error('Error storing session:', error);
		}
	}

	/**
	 * Get session ID from sessionStorage
	 */
	getSessionId() {
		if (!this.isBrowser()) return null;
		return sessionStorage.getItem(this.sessionIdPrefix);
	}

	/**
	 * Set session ID in sessionStorage
	 */
	setSessionId(sessionId) {
		if (!this.isBrowser()) return;
		sessionStorage.setItem(this.sessionIdPrefix, sessionId);
	}

	/**
	 * Initialize session ID if not exists
	 */
	initializeSessionId() {
		let sessionId = this.getSessionId();
		if (!sessionId) {
			sessionId = 's' + this.generateRandomId(16);
			this.setSessionId(sessionId);
			return { sessionId, isNew: true };
		}
		return { sessionId, isNew: false };
	}

	/**
	 * Check if current session is valid (not expired)
	 */
	isSessionValid(session = null) {
		const sessionToCheck = session || this.getStoredSession();
		if (!sessionToCheck || !sessionToCheck.expires) return false;

		return sessionToCheck.expires > this.getSecondsSinceEpoch() + 300; // 5 minute buffer
	}

	/**
	 * Fetch new browser session from server
	 */
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

		// Include existing token if available
		const currentSession = this.getStoredSession();
		if (currentSession?.access_token) {
			requestOptions.body = JSON.stringify({
				access_token: currentSession.access_token
			});
		}

		try {
			// Add abort controller for timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeouts.browserSession);

			const response = await fetch(`${apiServer}/api/v1/browser-session`, {
				...requestOptions,
				signal: controller.signal,
				credentials: 'include'
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				const sessionData = await response.json();
				this.setStoredSession(sessionData);

				// Notify about device creation if applicable
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

	/**
	 * Get access token, fetching new session if needed
	 */
	async getAccessToken(appId, apiServer, options = {}) {
		let session = this.getStoredSession();

		if (!this.isSessionValid(session)) {
			try {
				session = await this.fetchBrowserSession(appId, apiServer, options);
			} catch (error) {
				if (options.allowStaleToken && session?.access_token) {
					console.warn(
						'Using potentially stale token due to fetch failure:',
						error.message
					);
					return session.access_token;
				}
				throw error;
			}
		}

		return session?.access_token || null;
	}

	/**
	 * Get headers with authorization token
	 */
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
			console.error('Failed to get auth headers:', error);
			return {
				headers: {
					'Content-Type': 'application/json'
				}
			};
		}
	}

	/**
	 * Clear stored session data
	 */
	clearSession() {
		if (!this.isBrowser()) return;

		this.currentSession = null;
		localStorage.removeItem(this.storagePrefix);
		sessionStorage.removeItem(this.sessionIdPrefix);
	}

	/**
	 * Get device ID from current session
	 */
	getDeviceId() {
		const session = this.getStoredSession();
		return session?.device_id || null;
	}

	/**
	 * Refresh session by forcing a new fetch
	 */
	async refreshSession(appId, apiServer, options = {}) {
		try {
			return await this.fetchBrowserSession(appId, apiServer, options);
		} catch (error) {
			console.error('Session refresh failed:', error);
			throw error;
		}
	}
}

// Export default instances for common use cases
export const sdkSessionManager = new SessionManager({
	storagePrefix: 'FBS_SDK',
	sessionIdPrefix: 'FRSID_SDK'
});

export const dropinSessionManager = new SessionManager({
	storagePrefix: 'FBS',
	sessionIdPrefix: 'FRSID'
});

// Export configuration constants
export const SESSION_CONFIG = {
	TIMEOUTS: {
		BROWSER_SESSION: 5000,
		PAYMENT_KEY: 3000,
		PRODUCT_DETAILS: 10000,
		DEFAULT_REQUEST: 8000,
		SDK_INITIALIZATION: 1000,
		DROPIN_INITIALIZATION: 2000
	},
	STORAGE: {
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
	},
	EXPIRY_BUFFER_SECONDS: 300 // 5 minutes
};
