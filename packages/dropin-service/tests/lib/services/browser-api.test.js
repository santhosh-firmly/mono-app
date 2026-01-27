import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createMockInitializationState,
	createMockSessionManager,
	createMockConfig,
	createMockTelemetry,
	createMockBrowserSession
} from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/initialization-state.js', () => createMockInitializationState());
vi.mock('$lib/utils/session-manager.js', () => createMockSessionManager());
vi.mock('$lib/utils/config.js', () => ({
	config: createMockConfig()
}));
vi.mock('$lib/services/telemetry.js', () => createMockTelemetry());
vi.mock('$lib/services/browser-session.js', () => createMockBrowserSession());

import { initialize, setDomain, setAppVersion } from '$lib/services/browser-api.js';
import { initializationState, INITIALIZATION_STATES } from '$lib/utils/initialization-state.js';
import { sessionManager } from '$lib/utils/session-manager.js';
import { config } from '$lib/utils/config.js';
import { track } from '$lib/services/telemetry.js';
import { fetchBrowserSession } from '$lib/services/browser-session.js';

describe('browser-api service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Stub window to pass SSR check
		vi.stubGlobal('window', {});
		// Reset config state
		config.appId = null;
		config.apiServer = null;
		config.telemetryServer = null;
		config.ccServer = null;
		config.domain = null;
		config.browserId = null;
		config.sessionId = null;
		config.deviceId = null;
		config.isNewSessionId = false;
		config.appVersion = null;
		config.appName = null;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('initialize', () => {
		it('sets config values from parameters', async () => {
			await initialize('app-123', 'https://api.firmly.com', 'store.com');

			expect(config.appId).toBe('app-123');
			expect(config.apiServer).toBe('https://api.firmly.com');
			expect(config.domain).toBe('store.com');
		});

		it('sets telemetryServer based on apiServer', async () => {
			await initialize('app-123', 'https://api.firmly.com');

			expect(config.telemetryServer).toBe('https://api.firmly.com/api/v1/telemetry');
		});

		it('sets ccServer by replacing api with cc', async () => {
			await initialize('app-123', 'https://api.firmly.com');

			expect(config.ccServer).toBe('https://cc.firmly.com');
		});

		it('initializes session from sessionManager', async () => {
			await initialize('app-123', 'https://api.firmly.com');

			expect(sessionManager.initializeSessionId).toHaveBeenCalled();
			expect(config.sessionId).toBe('test-session-id');
		});

		it('sets initialization state to DROPIN_READY', async () => {
			await initialize('app-123', 'https://api.firmly.com');

			expect(initializationState.setState).toHaveBeenCalledWith(
				INITIALIZATION_STATES.DROPIN_READY
			);
		});

		it('fetches browser session and sets IDs', async () => {
			await initialize('app-123', 'https://api.firmly.com');

			expect(fetchBrowserSession).toHaveBeenCalledWith('app-123', 'https://api.firmly.com');
			expect(config.browserId).toBe('browser-123');
			expect(config.deviceId).toBe('device-456');
		});

		it('completes initialization on success', async () => {
			await initialize('app-123', 'https://api.firmly.com');

			expect(initializationState.complete).toHaveBeenCalled();
		});

		it('tracks dropin_initialized for new sessions', async () => {
			sessionManager.initializeSessionId.mockReturnValueOnce({
				sessionId: 'new-session',
				isNew: true
			});

			await initialize('app-123', 'https://api.firmly.com');

			expect(track).toHaveBeenCalledWith('dropin_initialized', 'ux');
		});

		it('does not track for existing sessions', async () => {
			sessionManager.initializeSessionId.mockReturnValueOnce({
				sessionId: 'existing-session',
				isNew: false
			});

			await initialize('app-123', 'https://api.firmly.com');

			expect(track).not.toHaveBeenCalled();
		});

		it('handles fetch error gracefully', async () => {
			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const error = new Error('Network error');
			fetchBrowserSession.mockRejectedValueOnce(error);

			await initialize('app-123', 'https://api.firmly.com');

			expect(consoleWarn).toHaveBeenCalledWith('Session initialization delayed:', error);
			expect(initializationState.addError).toHaveBeenCalledWith(error);

			consoleWarn.mockRestore();
		});

		it('does not re-initialize if already initialized', async () => {
			config.appId = 'existing-app';

			await initialize('new-app', 'https://api.firmly.com');

			expect(fetchBrowserSession).not.toHaveBeenCalled();
		});

		it('returns early in SSR mode (no window)', async () => {
			vi.unstubAllGlobals();
			const originalWindow = global.window;
			delete global.window;

			await initialize('app-123', 'https://api.firmly.com');

			expect(config.appId).toBeNull();

			global.window = originalWindow;
		});
	});

	describe('setDomain', () => {
		it('updates config domain', () => {
			setDomain('new-store.com');

			expect(config.domain).toBe('new-store.com');
		});
	});

	describe('setAppVersion', () => {
		it('sets app version and default app name', () => {
			setAppVersion('1.0.0');

			expect(config.appVersion).toBe('1.0.0');
			expect(config.appName).toBe('dropin-service');
		});

		it('sets custom app name', () => {
			setAppVersion('2.0.0', 'custom-app');

			expect(config.appVersion).toBe('2.0.0');
			expect(config.appName).toBe('custom-app');
		});
	});
});
