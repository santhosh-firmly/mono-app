/**
 * Field Interaction Tracker
 * Tracks field interactions for abandonment analysis.
 * All data is collected in memory and reported at session end.
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
			hadValidationErrors: false
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

	state.totalTimeMs += Date.now() - state.focusStartTime;
	state.focusStartTime = null;

	if (hadValidationError) {
		state.hadValidationErrors = true;
	}

	const isComplete = config.isComplete(currentValue);
	state.completed = isComplete;

	if (!isComplete && !config.optional) {
		state.abandoned = true;
		const valueLength = typeof currentValue === 'string' ? currentValue.length : 0;
		state.abandonmentType = valueLength === 0 ? 'focused_empty' : 'incomplete';
	} else {
		state.abandoned = false;
		state.abandonmentType = null;
	}
}

/**
 * Called when a field is successfully validated/completed
 * Clears any abandonment state for the field
 * @param {string} fieldName - The field identifier
 */
export function onFieldCompleted(fieldName) {
	const state = initFieldState(fieldName);
	const config = FIELD_CONFIG[fieldName];

	if (!config) return;

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
 * Gets abandonment metrics for session_end event
 * @returns {object} Flat abandonment metrics for analytics
 */
export function getAbandonmentSummary() {
	const sectionsStarted = new Set();
	const sectionsCompleted = new Set();
	const sectionAbandonedCounts = {
		contact: 0,
		shipping_address: 0,
		billing_address: 0,
		credit_card: 0,
		paypal: 0
	};

	let totalInteracted = 0;
	let totalCompleted = 0;
	let totalAbandoned = 0;
	let furthestSectionIndex = 0;

	for (const [fieldName, config] of Object.entries(FIELD_CONFIG)) {
		const state = fieldState[fieldName];

		if (state?.interacted) {
			totalInteracted++;
			sectionsStarted.add(config.group);

			const sectionIdx = SECTION_ORDER.indexOf(config.group) + 1;
			if (sectionIdx > furthestSectionIndex) {
				furthestSectionIndex = sectionIdx;
			}

			if (state.completed) totalCompleted++;
			if (state.abandoned) {
				totalAbandoned++;
				sectionAbandonedCounts[config.group]++;
			}
		}
	}

	for (const section of sectionsStarted) {
		const allCompleted = Object.entries(FIELD_CONFIG)
			.filter(([, config]) => config.group === section && !config.optional)
			.every(([fieldName]) => fieldState[fieldName]?.completed);

		if (allCompleted) {
			sectionsCompleted.add(section);
		}
	}

	return {
		fields_interacted: totalInteracted,
		fields_completed: totalCompleted,
		fields_abandoned: totalAbandoned,
		completion_rate:
			totalInteracted > 0 ? Math.round((totalCompleted / totalInteracted) * 100) : 0,
		furthest_section: furthestSectionIndex,
		reached_contact: sectionsStarted.has('contact') ? 1 : 0,
		reached_shipping: sectionsStarted.has('shipping_address') ? 1 : 0,
		reached_billing: sectionsStarted.has('billing_address') ? 1 : 0,
		reached_payment: sectionsStarted.has('credit_card') ? 1 : 0,
		reached_paypal: sectionsStarted.has('paypal') ? 1 : 0,
		completed_contact: sectionsCompleted.has('contact') ? 1 : 0,
		completed_shipping: sectionsCompleted.has('shipping_address') ? 1 : 0,
		completed_billing: sectionsCompleted.has('billing_address') ? 1 : 0,
		completed_payment: sectionsCompleted.has('credit_card') ? 1 : 0,
		completed_paypal: sectionsCompleted.has('paypal') ? 1 : 0,
		abandoned_at_contact: sectionAbandonedCounts.contact,
		abandoned_at_shipping: sectionAbandonedCounts.shipping_address,
		abandoned_at_billing: sectionAbandonedCounts.billing_address,
		abandoned_at_payment: sectionAbandonedCounts.credit_card,
		abandoned_at_paypal: sectionAbandonedCounts.paypal
	};
}

/**
 * Resets all field state (useful for testing)
 */
export function resetFieldState() {
	fieldState = {};
}

export { FIELD_CONFIG };
