/**
 * Default configuration for session recorder
 * Simple, privacy-first configuration using data-sensitive attribute
 */

export const DEFAULT_SAMPLING = {
	mousemove: false, // Disable mousemove to reduce events by 60-80%
	mouseInteraction: {
		Click: true,
		DblClick: true,
		Focus: true,
		Blur: true
	},
	scroll: 150, // Throttle scroll events to 150ms
	input: 'last' // Only capture final input value
};

export const DEFAULT_CONFIG = {
	enabled: true,

	// Application metadata
	appName: null, // Optional application name for better identification in backend

	// Batching strategy
	batchInterval: 10000, // 10 seconds
	maxBatchSize: 500 * 1024, // 500KB - better chunk size for POST requests
	maxEvents: 500, // Max events before flush

	// Privacy options
	// When true, all text and inputs are replaced with asterisks
	maskAll: false,

	// Mask all input fields by default for privacy (passwords, credit cards, etc.)
	maskAllInputs: true,

	// Single selector that masks both text content and input values
	// Applied to both maskTextSelector and maskInputSelector in rrweb
	maskSelector: '[data-sensitive], [data-sensitive] *', // Mask elements with data-sensitive attribute and all children

	blockSelector: null, // No blocking by default

	// rrweb options
	checkoutEveryNth: 100, // Full snapshot every 100 events
	checkoutEveryNms: 600000, // Full snapshot every 10 minutes
	inlineStylesheet: true, // Required for accurate replay
	sampling: DEFAULT_SAMPLING,

	// Callbacks
	onError: null,
	onBatchSent: null
};

export function mergeConfig(userConfig = {}) {
	return {
		...DEFAULT_CONFIG,
		...userConfig,
		sampling: {
			...DEFAULT_SAMPLING,
			...(userConfig.sampling || {}),
			mouseInteraction: userConfig.sampling?.mouseInteraction
				? { ...DEFAULT_SAMPLING.mouseInteraction, ...userConfig.sampling.mouseInteraction }
				: DEFAULT_SAMPLING.mouseInteraction
		}
	};
}
