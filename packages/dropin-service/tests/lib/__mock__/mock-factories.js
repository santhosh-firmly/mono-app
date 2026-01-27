/**
 * Mock Factories
 *
 * Centralized mock factory functions that return complete mock implementations
 * with sensible defaults (success responses). Import and use these in tests,
 * then override specific methods as needed for your test scenarios.
 *
 * Usage:
 * ```javascript
 * import { createMockCart } from '../__mock__/mock-factories.js';
 *
 * const mockCart = createMockCart();
 * // Override specific method for your test
 * mockCart.cartGetCart.mockResolvedValue({ status: 404, data: null });
 * ```
 */

import { vi } from 'vitest';

/**
 * Creates a complete mock for the cart service
 * All methods return success (200) by default
 */
export function createMockCart() {
	return {
		cartUpdateSku: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		cartUpdateShippingInfo: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		cartUpdateDelivery: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		cartGetCart: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		cartSavedPaymentCompleteOrder: vi.fn().mockResolvedValue({ status: 200, data: {} }),
		cartSessionTransfer: vi
			.fn()
			.mockResolvedValue({ status: 200, data: { items: [], shop_id: 'shop123' } }),
		cartAddLineItem: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		cartClear: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		cartCompleteOrder: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		getConsents: vi.fn().mockResolvedValue({ status: 200, data: {} }),
		setConsents: vi.fn().mockResolvedValue({ status: 200, data: {} }),
		sessionJoin: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		sessionCreateOtp: vi.fn().mockResolvedValue({ status: 200, data: {} }),
		sessionValidateOtp: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		getSessionCart: vi.fn().mockReturnValue(null),
		setSessionCart: vi.fn()
	};
}

/**
 * Creates a complete mock for telemetry service
 */
export function createMockTelemetry() {
	return {
		track: vi.fn(),
		trackError: vi.fn(),
		flush: vi.fn(),
		EVENT_TYPE_UX: 'ux',
		EVENT_TYPE_API: 'api',
		EVENT_TYPE_ERROR: 'error',
		EVENT_TYPE_SESSION: 'session',
		EVENT_TYPE_DEVICE: 'device'
	};
}

/**
 * Creates a mock for message transport
 */
export function createMockMessageTransport() {
	return {
		postCheckoutClosed: vi.fn(),
		postOrderPlaced: vi.fn(),
		postUpdateCart: vi.fn(),
		onMessageAction: vi.fn()
	};
}

/**
 * Creates a mock for validation messages
 */
export function createMockValidationMessages() {
	return {
		validation_required: vi.fn(() => 'Required'),
		validation_first_and_last_name: vi.fn(() => 'Name required'),
		validation_email_required: vi.fn(() => 'Email required'),
		validation_email_invalid: vi.fn(() => 'Invalid email'),
		validation_phone_required: vi.fn(() => 'Phone required'),
		validation_phone_invalid: vi.fn(() => 'Invalid phone'),
		validation_zip_required: vi.fn(() => 'ZIP required'),
		validation_zip_invalid: vi.fn(() => 'Invalid ZIP'),
		validation_address_required: vi.fn(() => 'Address required'),
		validation_address_min_length: vi.fn(() => 'Address too short')
	};
}

/**
 * Creates a mock for API client domainRequest
 */
export function createMockDomainRequest() {
	return vi.fn().mockResolvedValue({ status: 200, data: {} });
}

/**
 * Creates a mock for browser session getHeaders
 */
export function createMockGetHeaders() {
	return vi.fn().mockResolvedValue({
		headers: { 'Content-Type': 'application/json' }
	});
}

/**
 * Creates a mock for address autocomplete service
 */
export function createMockAddressAutocomplete() {
	return {
		searchAddress: vi.fn().mockResolvedValue({ status: 200, data: { suggestions: [] } }),
		getAddress: vi.fn().mockResolvedValue({ status: 200, data: {} })
	};
}

/**
 * Creates a mock for promo code service
 */
export function createMockPromoCode() {
	return {
		addPromoCode: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } }),
		removeAllPromoCodes: vi.fn().mockResolvedValue({ status: 200, data: { items: [] } })
	};
}

/**
 * Creates a mock for order service
 * All methods return success by default
 */
export function createMockOrder() {
	return {
		placeOrderWithCreditCard: vi.fn().mockResolvedValue({
			success: true,
			order: { id: 'order123' },
			redirectUrl: null
		}),
		placeOrderWithSavedCard: vi.fn().mockResolvedValue({
			success: true,
			order: { id: 'order456' },
			redirectUrl: null
		}),
		placeOrderWithPayPal: vi.fn().mockResolvedValue({
			success: true,
			order: { id: 'order789' },
			redirectUrl: 'https://example.com/confirm'
		}),
		placeOrderWithC2P: vi.fn().mockResolvedValue({
			success: true,
			order: { id: 'order999' },
			redirectUrl: null
		})
	};
}

/**
 * Creates a mock for PayPal service
 */
export function createMockPayPal() {
	return {
		loadPayPalSdk: vi.fn().mockResolvedValue({
			Buttons: vi.fn(() => ({
				render: vi.fn().mockResolvedValue(undefined)
			}))
		}),
		renderPayPalButton: vi.fn().mockResolvedValue(undefined),
		paypalStartOrder: vi.fn().mockResolvedValue({
			status: 200,
			data: { payment_method: { attributes: { paypal_token: 'token123' } } }
		}),
		paypalAuthorizePayment: vi.fn().mockResolvedValue({
			status: 200,
			data: { authorized: true }
		}),
		paypalCompleteOrder: vi.fn().mockResolvedValue({
			status: 200,
			data: { id: 'order789', status: 'completed' }
		}),
		createPayPalSdkUrl: vi.fn(
			(config) => `https://www.paypal.com/sdk/js?client-id=${config.clientId}`
		),
		isPayPalSdkLoaded: vi.fn().mockReturnValue(false)
	};
}

/**
 * Creates a mock for Mastercard Click-to-Pay service
 */
export function createMockMastercardC2P() {
	return {
		initializeMastercardC2P: vi.fn().mockResolvedValue({ status: 'success' }),
		validateEmail: vi.fn().mockResolvedValue({
			status: 200,
			data: {
				otp_destination: { emails: ['test@example.com'], phones: [] },
				network: 'MASTERCARD'
			}
		}),
		verifyOtp: vi.fn().mockResolvedValue({
			status: 200,
			data: { payment_method_options: [{ id: 'card1', last4: '1234' }] }
		}),
		getCards: vi.fn().mockResolvedValue({ status: 200, data: { cards: [] } })
	};
}

/**
 * Creates a mock for config utility
 */
export function createMockConfig(overrides = {}) {
	return {
		appId: 'test-app-id',
		apiServer: 'https://api.firmly.com',
		ccServer: 'https://cc.firmly.com',
		telemetryServer: 'https://telemetry.firmly.com',
		domain: 'test-store.com',
		browserId: 'browser-123',
		deviceId: 'device-456',
		sessionId: 'session-789',
		traceId: 'trace-001',
		appName: 'dropin-service',
		appVersion: '1.0.0',
		buildDomainUrl: vi.fn((endpoint, domain) => {
			const d = domain || 'test-store.com';
			return `https://${d}/api/${endpoint}`;
		}),
		...overrides
	};
}

/**
 * Creates a mock for browser fetch utility
 */
export function createMockBrowserFetch() {
	return {
		browserFetch: vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: vi.fn().mockResolvedValue({ data: {} })
		}),
		setFetchErrorHandler: vi.fn()
	};
}

/**
 * Creates a mock for session manager utility
 */
export function createMockSessionManager() {
	return {
		sessionManager: {
			isBrowser: vi.fn().mockReturnValue(true),
			getStoredSession: vi.fn().mockReturnValue(null),
			setStoredSession: vi.fn(),
			isSessionValid: vi.fn().mockReturnValue(false),
			getDeviceId: vi.fn().mockReturnValue('device-123'),
			initializeSessionId: vi
				.fn()
				.mockReturnValue({ sessionId: 'test-session-id', isNew: false })
		}
	};
}

/**
 * Creates a mock for storage manager utility
 */
export function createMockStorageManager() {
	return {
		saveToStorage: vi.fn().mockReturnValue(true),
		loadFromStorage: vi.fn().mockReturnValue(null),
		removeFromStorage: vi.fn().mockReturnValue(true)
	};
}

/**
 * Creates a mock for initialization state utility
 */
export function createMockInitializationState() {
	return {
		initializationState: {
			setState: vi.fn(),
			complete: vi.fn(),
			addError: vi.fn(),
			getState: vi.fn().mockReturnValue('idle')
		},
		INITIALIZATION_STATES: {
			IDLE: 'idle',
			STARTING: 'starting',
			SDK_READY: 'sdk_ready',
			DROPIN_READY: 'dropin_ready',
			COMPLETED: 'completed',
			ERROR: 'error'
		}
	};
}

/**
 * Creates a mock for browser session service
 */
export function createMockBrowserSession() {
	return {
		fetchBrowserSession: vi.fn().mockResolvedValue({
			browser_id: 'browser-123',
			device_id: 'device-456'
		}),
		getHeaders: vi.fn().mockResolvedValue({
			headers: { 'Content-Type': 'application/json' }
		})
	};
}

/**
 * Creates a mock for JWE utility
 */
export function createMockJWE() {
	return {
		importJWKKey: vi.fn().mockResolvedValue({}),
		encryptPayload: vi.fn().mockResolvedValue('encrypted_jwe_token')
	};
}

/**
 * Creates a mock for domain service
 */
export function createMockDomain() {
	return {
		getDomainConfig: vi.fn().mockResolvedValue({ status: 200, data: {} }),
		validateDomain: vi.fn().mockResolvedValue({ status: 200, data: { valid: true } }),
		fetchProductDetails: vi.fn().mockResolvedValue({ status: 200, data: { product: {} } })
	};
}

/**
 * Creates a mock for attribution service
 */
export function createMockAttribution() {
	return {
		setAttribution: vi.fn().mockResolvedValue({ status: 200, data: {} }),
		setCustomProperties: vi.fn().mockResolvedValue({ status: 200, data: {} })
	};
}

/**
 * Creates a mock for browser API service
 */
export function createMockBrowserApi() {
	return {
		initialize: vi.fn().mockResolvedValue({ success: true }),
		setDomain: vi.fn(),
		setAppVersion: vi.fn()
	};
}

/**
 * Creates a mock for checkout state
 */
export function createMockCheckoutState() {
	const mockCheckoutInstance = {
		domain: 'test.com',
		setCart: vi.fn(),
		addC2PCards: vi.fn(),
		cart: { items: [] },
		shippingAddress: {},
		billingAddress: {},
		email: '',
		phone: ''
	};

	return {
		getCheckout: vi.fn(() => mockCheckoutInstance)
	};
}

/**
 * Creates a mock for Click-to-Pay state
 */
export function createMockClickToPayState() {
	return {
		getClickToPay: vi.fn(() => ({
			isInitialized: false,
			cards: [],
			selectedCard: null
		})),
		initializeClickToPay: vi.fn()
	};
}
