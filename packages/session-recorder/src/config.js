/**
 * Default configuration for session recorder
 * Based on 2025 best practices and GDPR compliance requirements
 */

/**
 * Privacy-first masking configuration (GDPR compliant)
 * Defaults to maximum privacy - mask all potentially sensitive inputs
 */
export const DEFAULT_MASK_INPUT_OPTIONS = {
	password: true, // Always mask passwords
	email: true, // PII - Personal Identifiable Information
	tel: true, // PII - Phone numbers
	text: true, // May contain names, addresses, etc.
	textarea: true, // Often contains messages/comments
	number: true, // Could be credit cards, SSN, etc.
	search: true, // Search queries may contain PII
	url: true, // URLs may contain tokens/sensitive params
	select: true, // May contain addresses or sensitive options
	color: false, // Safe - no PII
	date: false, // Usually safe
	range: false // Safe - numeric ranges
};

/**
 * Performance-optimized sampling configuration
 * Reduces events by 60-80% while maintaining meaningful interactions
 */
export const DEFAULT_SAMPLING = {
	// Disable mousemove - reduces events by 60-80%!
	mousemove: false,

	// Only track meaningful mouse interactions
	mouseInteraction: {
		MouseUp: false,
		MouseDown: false,
		Click: true, // Important for user journey
		ContextMenu: false,
		DblClick: true, // Important for user journey
		Focus: true, // Important for form tracking
		Blur: true, // Important for form tracking
		TouchStart: false,
		TouchEnd: false
	},

	// Throttle scroll events - don't emit twice within 150ms
	scroll: 150,

	// Throttle media interaction events
	media: 800,

	// Only capture final input value (it's masked anyway)
	input: 'last'
};

/**
 * Default configuration object
 */
export const DEFAULT_CONFIG = {
	// Feature flags
	enabled: true,

	// Batching strategy (hybrid: time OR size OR events - whichever first)
	batchInterval: 5000, // 5 seconds (more frequent to reduce final batch size)
	maxBatchSize: 40960, // 40KB (conservative margin under 128KB Cloudflare Workers request body limit)
	maxEvents: 100, // Max events before flush (prevents memory bloat and large final payloads)

	// Privacy configuration (GDPR 2025 compliant)
	maskAllInputs: true, // Secure default
	maskInputOptions: DEFAULT_MASK_INPUT_OPTIONS,
	maskTextSelector: '[data-sensitive], .sensitive, .rr-mask',
	blockClass: 'rr-block',
	blockSelector: '[data-private], .credit-card-form',
	ignoreClass: 'rr-ignore',

	// rrweb checkout configuration (balance storage vs reliability)
	checkoutEveryNth: 100, // Full snapshot every 100 events (Sentry standard)
	checkoutEveryNms: 600000, // Full snapshot every 10 minutes

	// Performance optimization
	sampling: DEFAULT_SAMPLING,

	// Storage optimization
	inlineImages: false, // Don't inline images (reduces payload)
	inlineStylesheet: true, // Needed for accurate replay

	// Error handling (GDPR requires graceful failures)
	errorHandler: (error) => {
		console.error('Session recording error:', error);
		return false; // Don't throw errors
	},

	// Callbacks
	onError: null, // Custom error callback
	onBatchSent: null // (sessionId, eventCount, bytes) => {}
};

/**
 * Merges user config with defaults
 * @param {Object} userConfig - User-provided configuration
 * @returns {Object} Merged configuration
 */
export function mergeConfig(userConfig = {}) {
	return {
		...DEFAULT_CONFIG,
		...userConfig,
		maskInputOptions: {
			...DEFAULT_MASK_INPUT_OPTIONS,
			...(userConfig.maskInputOptions || {})
		},
		sampling: {
			...DEFAULT_SAMPLING,
			...(userConfig.sampling || {}),
			mouseInteraction:
				typeof userConfig.sampling?.mouseInteraction === 'object'
					? {
							...DEFAULT_SAMPLING.mouseInteraction,
							...userConfig.sampling.mouseInteraction
						}
					: (userConfig.sampling?.mouseInteraction ?? DEFAULT_SAMPLING.mouseInteraction)
		}
	};
}
