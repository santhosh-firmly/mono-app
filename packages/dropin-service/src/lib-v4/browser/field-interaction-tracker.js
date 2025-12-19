/**
 * Field Interaction Tracker
 * Tracks field-level interactions for abandonment analysis.
 *
 * This module tracks field interactions in memory and provides a comprehensive
 * abandonment summary via `getAbandonmentSummary()` for the session_end event.
 * No real-time events are fired - all data is collected at session end for accuracy.
 */

/**
 * Field configuration with completion validation functions
 * Each field has a group and an isComplete function to determine if the field value is valid
 */
const FIELD_CONFIG = {
	// Contact
	email: { group: 'contact', isComplete: (v) => v && v.includes('@') && v.length >= 5 },

	// Shipping Address
	shipping_full_name: {
		group: 'shipping_address',
		isComplete: (v) => v && v.trim().length >= 2
	},
	shipping_address1: {
		group: 'shipping_address',
		isComplete: (v) => v && v.trim().length >= 3
	},
	shipping_address2: {
		group: 'shipping_address',
		isComplete: () => true,
		optional: true
	},
	shipping_city: {
		group: 'shipping_address',
		isComplete: (v) => v && v.trim().length >= 2
	},
	shipping_state: {
		group: 'shipping_address',
		isComplete: (v) => v && v.trim().length >= 2
	},
	shipping_postal_code: {
		group: 'shipping_address',
		isComplete: (v) => v && v.replace(/\D/g, '').length >= 5
	},
	shipping_phone: {
		group: 'shipping_address',
		isComplete: (v) => v && v.replace(/\D/g, '').length >= 10
	},

	// Billing Address
	billing_full_name: {
		group: 'billing_address',
		isComplete: (v) => v && v.trim().length >= 2
	},
	billing_address1: {
		group: 'billing_address',
		isComplete: (v) => v && v.trim().length >= 3
	},
	billing_address2: {
		group: 'billing_address',
		isComplete: () => true,
		optional: true
	},
	billing_city: {
		group: 'billing_address',
		isComplete: (v) => v && v.trim().length >= 2
	},
	billing_state: {
		group: 'billing_address',
		isComplete: (v) => v && v.trim().length >= 2
	},
	billing_postal_code: {
		group: 'billing_address',
		isComplete: (v) => v && v.replace(/\D/g, '').length >= 5
	},

	// Credit Card
	card_number: {
		group: 'credit_card',
		isComplete: (v) => v && v.replace(/\D/g, '').length >= 15
	},
	card_expiry: {
		group: 'credit_card',
		isComplete: (v) => v && v.replace(/\D/g, '').length === 4
	},
	card_cvv: {
		group: 'credit_card',
		isComplete: (v) => v && v.replace(/\D/g, '').length >= 3
	},

	// PayPal
	paypal_button: {
		group: 'paypal',
		isComplete: () => true
	}
};

// Section order for determining furthest section reached
const SECTION_ORDER = ['contact', 'shipping_address', 'billing_address', 'credit_card', 'paypal'];

// In-memory state for the session
let fieldState = {};

/**
 * Initialize or get field state
 * @param {string} fieldName - The field identifier
 * @returns {object} The field state object
 */
function initFieldState(fieldName) {
	if (!fieldState[fieldName]) {
		fieldState[fieldName] = {
			interacted: false,
			completed: false,
			abandoned: false,
			abandonmentType: null,
			focusStartTime: null,
			totalTimeMs: 0,
			focusCount: 0,
			hadValidationErrors: false,
			finalValueLength: 0
		};
	}
	return fieldState[fieldName];
}

/**
 * Called when a field receives focus
 * Tracks interaction state in memory (no event fired)
 * @param {string} fieldName - The field identifier (e.g., 'email', 'shipping_address1')
 */
export function onFieldFocus(fieldName) {
	const state = initFieldState(fieldName);
	const config = FIELD_CONFIG[fieldName];

	if (!config) {
		console.warn(`[FieldTracker] Unknown field: ${fieldName}`);
		return;
	}

	state.focusStartTime = Date.now();
	state.focusCount++;
	state.interacted = true;
}

/**
 * Called when a field loses focus
 * Tracks time spent and abandonment state in memory (no event fired)
 * @param {string} fieldName - The field identifier
 * @param {string} currentValue - The current field value
 * @param {boolean} hadValidationError - Whether validation failed on this blur
 */
export function onFieldBlur(fieldName, currentValue, hadValidationError = false) {
	const state = initFieldState(fieldName);
	const config = FIELD_CONFIG[fieldName];

	if (!config || !state.focusStartTime) return;

	// Calculate time spent on this focus session
	const timeSpentMs = Date.now() - state.focusStartTime;
	state.totalTimeMs += timeSpentMs;
	state.focusStartTime = null;

	// Update validation error state
	if (hadValidationError) {
		state.hadValidationErrors = true;
	}

	// Check completion status
	const valueLength = typeof currentValue === 'string' ? currentValue.length : 0;
	state.finalValueLength = valueLength;

	const isComplete = config.isComplete(currentValue);
	state.completed = isComplete;

	// Determine abandonment type (only for required fields)
	if (!isComplete && !config.optional) {
		state.abandoned = true;
		if (valueLength === 0) {
			state.abandonmentType = 'focused_empty';
		} else {
			state.abandonmentType = 'incomplete';
		}
	} else {
		state.abandoned = false;
		state.abandonmentType = null;
	}
}

/**
 * Called when a field is successfully validated/completed
 * Clears any abandonment state for the field
 * @param {string} fieldName - The field identifier
 * @param {string} currentValue - The current field value (optional, for length tracking)
 */
export function onFieldCompleted(fieldName, currentValue = '') {
	const state = initFieldState(fieldName);
	const config = FIELD_CONFIG[fieldName];

	if (!config) return;

	const valueLength = typeof currentValue === 'string' ? currentValue.length : 0;
	state.finalValueLength = valueLength;
	state.completed = true;
	state.abandoned = false;
	state.abandonmentType = null;
}

/**
 * Called when PayPal flow is initiated
 * Tracks interaction state in memory (no event fired)
 */
export function onPayPalStarted() {
	const state = initFieldState('paypal_button');
	state.interacted = true;
	state.focusStartTime = Date.now();
	state.focusCount++;
}

/**
 * Called when PayPal flow completes successfully
 */
export function onPayPalCompleted() {
	const state = initFieldState('paypal_button');
	state.completed = true;
	state.abandoned = false;
	if (state.focusStartTime) {
		state.totalTimeMs += Date.now() - state.focusStartTime;
		state.focusStartTime = null;
	}
}

/**
 * Called when PayPal flow is cancelled or fails
 */
export function onPayPalAbandoned() {
	const state = initFieldState('paypal_button');
	if (state.interacted && !state.completed) {
		state.abandoned = true;
		state.abandonmentType = 'incomplete';
		if (state.focusStartTime) {
			state.totalTimeMs += Date.now() - state.focusStartTime;
			state.focusStartTime = null;
		}
	}
}

/**
 * Gets comprehensive abandonment summary for session_end event
 * @returns {object} Summary of all field interactions and abandonment data
 */
export function getAbandonmentSummary() {
	const sectionsStarted = new Set();
	const sectionsCompleted = new Set();
	const fields = {};

	let totalInteracted = 0;
	let totalCompleted = 0;
	let totalAbandoned = 0;
	let furthestSection = null;

	for (const [fieldName, config] of Object.entries(FIELD_CONFIG)) {
		const state = fieldState[fieldName];

		if (state && state.interacted) {
			totalInteracted++;
			sectionsStarted.add(config.group);

			// Track furthest section
			const sectionIdx = SECTION_ORDER.indexOf(config.group);
			const currentFurthestIdx = furthestSection ? SECTION_ORDER.indexOf(furthestSection) : -1;
			if (sectionIdx > currentFurthestIdx) {
				furthestSection = config.group;
			}

			if (state.completed) {
				totalCompleted++;
			}

			if (state.abandoned) {
				totalAbandoned++;
			}

			fields[fieldName] = {
				interacted: state.interacted,
				completed: state.completed,
				abandoned: state.abandoned,
				abandonment_type: state.abandonmentType,
				total_time_ms: state.totalTimeMs,
				focus_count: state.focusCount,
				had_validation_errors: state.hadValidationErrors,
				final_value_length: state.finalValueLength
			};
		}
	}

	// Determine which sections are fully completed
	// A section is complete when all required fields in it are completed
	for (const section of sectionsStarted) {
		const sectionFields = Object.entries(FIELD_CONFIG).filter(
			([, config]) => config.group === section && !config.optional
		);

		const allCompleted = sectionFields.every(([fieldName]) => {
			const state = fieldState[fieldName];
			return state && state.completed;
		});

		if (allCompleted && sectionFields.length > 0) {
			sectionsCompleted.add(section);
		}
	}

	return {
		sections_started: Array.from(sectionsStarted),
		sections_completed: Array.from(sectionsCompleted),
		fields,
		total_fields_interacted: totalInteracted,
		total_fields_completed: totalCompleted,
		total_fields_abandoned: totalAbandoned,
		furthest_section_reached: furthestSection
	};
}

/**
 * Resets all field state (useful for testing or new sessions)
 */
export function resetFieldState() {
	fieldState = {};
}

/**
 * Export FIELD_CONFIG for testing purposes
 */
export { FIELD_CONFIG };
