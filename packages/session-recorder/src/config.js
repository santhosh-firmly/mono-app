/**
 * Default configuration for session recorder
 */

export const DEFAULT_MASK_INPUT_OPTIONS = {
	password: true,
	email: true,
	tel: true,
	text: true,
	textarea: true,
	number: true,
	search: true,
	url: true,
	select: true,
	color: false,
	date: false,
	range: false
};

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

	// Batching strategy
	batchInterval: 10000, // 10 seconds
	maxBatchSize: 500 * 1024, // 500KB - better chunk size for POST requests
	maxEvents: 500, // Max events before flush

	// Privacy (GDPR compliant)
	maskAllInputs: true,
	maskInputOptions: DEFAULT_MASK_INPUT_OPTIONS,
	blockClass: 'sensitive-data',
	maskTextClass: 'sensitive-data',

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
		maskInputOptions: {
			...DEFAULT_MASK_INPUT_OPTIONS,
			...(userConfig.maskInputOptions || {})
		},
		sampling: {
			...DEFAULT_SAMPLING,
			...(userConfig.sampling || {}),
			mouseInteraction: userConfig.sampling?.mouseInteraction
				? { ...DEFAULT_SAMPLING.mouseInteraction, ...userConfig.sampling.mouseInteraction }
				: DEFAULT_SAMPLING.mouseInteraction
		},
		maskTextClass: userConfig.maskTextClass || DEFAULT_CONFIG.maskTextClass
	};
}
