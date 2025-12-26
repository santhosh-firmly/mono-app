/**
 * Field Interaction Tracker
 * Tracks field interactions for abandonment analysis.
 * All data is collected in memory and reported at session end.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const digitsOnly = (value) => (typeof value === 'string' ? value.replace(/\D/g, '') : '');

const isValidEmail = (value) => {
	if (typeof value !== 'string') return false;
	const trimmed = value.trim();
	if (!trimmed) return false;
	return EMAIL_REGEX.test(trimmed);
};

const isValidCardExpiry = (value) => {
	const digits = digitsOnly(value);
	if (digits.length !== 4) return false;
	const month = Number.parseInt(digits.slice(0, 2), 10);
	const year = Number.parseInt(digits.slice(2), 10);
	if (Number.isNaN(month) || Number.isNaN(year)) return false;
	if (month < 1 || month > 12) return false;
	const now = new Date();
	const currentYear = now.getFullYear() % 100;
	const currentMonth = now.getMonth() + 1;
	if (year < currentYear) return false;
	if (year === currentYear && month < currentMonth) return false;
	return true;
};

/**
 * Field configuration with completion validation functions
 * Each field has a group and an isComplete function to determine if the field value is valid
 */
const FIELD_CONFIG = {
	// Contact
	email: { group: 'contact', isComplete: (v) => isValidEmail(v) },

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
		isComplete: (v) => digitsOnly(v).length >= 5
	},
	shipping_phone: {
		group: 'shipping_address',
		isComplete: (v) => digitsOnly(v).length >= 10
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
		isComplete: (v) => digitsOnly(v).length >= 5
	},

	// Credit Card
	card_number: {
		group: 'credit_card',
		isComplete: (v) => digitsOnly(v).length >= 15
	},
	card_expiry: {
		group: 'credit_card',
		isComplete: (v) => isValidCardExpiry(v)
	},
	card_cvv: {
		group: 'credit_card',
		isComplete: (v) => digitsOnly(v).length >= 3
	},

	// PayPal
	paypal_button: {
		group: 'paypal',
		isComplete: () => true
	}
};

// Section order for determining furthest section reached
const SECTION_ORDER = ['contact', 'shipping_address', 'billing_address', 'credit_card', 'paypal'];

const DEFAULT_SECTION_FIELDS = buildSectionFieldMap(FIELD_CONFIG);

export class FieldInteractionTracker {
	constructor(fieldConfig, sectionOrder, sectionFields) {
		this.fieldConfig = fieldConfig;
		this.sectionOrder = sectionOrder;
		this.sectionFields = sectionFields;
		this.fieldState = {};
	}

	initFieldState(fieldName) {
		if (!this.fieldState[fieldName]) {
			this.fieldState[fieldName] = {
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
		return this.fieldState[fieldName];
	}

	onFieldFocus(fieldName) {
		const config = this.fieldConfig[fieldName];
		if (!config) {
			console.warn(`[FieldTracker] Unknown field: ${fieldName}`);
			return;
		}
		const state = this.initFieldState(fieldName);
		state.focusStartTime = Date.now();
		state.focusCount++;
		state.interacted = true;
	}

	onFieldBlur(fieldName, currentValue, hadValidationError = false) {
		const config = this.fieldConfig[fieldName];
		const state = this.fieldState[fieldName];
		if (!config || !state?.focusStartTime) {
			return;
		}
		state.totalTimeMs += Date.now() - state.focusStartTime;
		state.focusStartTime = null;
		if (hadValidationError) {
			state.hadValidationErrors = true;
		}
		const isComplete = Boolean(config.isComplete(currentValue));
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

	onFieldCompleted(fieldName) {
		const config = this.fieldConfig[fieldName];
		if (!config) {
			return;
		}
		const state = this.initFieldState(fieldName);
		state.completed = true;
		state.abandoned = false;
		state.abandonmentType = null;
	}

	onPayPalStarted() {
		this.onFieldFocus('paypal_button');
	}

	onPayPalCompleted() {
		const state = this.initFieldState('paypal_button');
		state.completed = true;
		state.abandoned = false;
		state.abandonmentType = null;
		if (state.focusStartTime) {
			state.totalTimeMs += Date.now() - state.focusStartTime;
			state.focusStartTime = null;
		}
	}

	onPayPalAbandoned() {
		const state = this.initFieldState('paypal_button');
		if (state.interacted && !state.completed) {
			state.abandoned = true;
			state.abandonmentType = 'incomplete';
			if (state.focusStartTime) {
				state.totalTimeMs += Date.now() - state.focusStartTime;
				state.focusStartTime = null;
			}
		}
	}

	getAbandonmentSummary() {
		const sectionsStarted = new Set();
		const sectionsCompleted = new Set();
		const sectionAbandonedCounts = this.sectionOrder.reduce((acc, section) => {
			acc[section] = 0;
			return acc;
		}, {});
		let totalInteracted = 0;
		let totalCompleted = 0;
		let totalAbandoned = 0;
		let furthestSectionIndex = 0;
		for (const [fieldName, config] of Object.entries(this.fieldConfig)) {
			const state = this.fieldState[fieldName];
			if (state?.interacted) {
				totalInteracted++;
				sectionsStarted.add(config.group);
				const sectionIdx = this.sectionOrder.indexOf(config.group) + 1;
				if (sectionIdx > furthestSectionIndex) {
					furthestSectionIndex = sectionIdx;
				}
				if (state.completed) totalCompleted++;
				if (state.abandoned) {
					totalAbandoned++;
					if (sectionAbandonedCounts[config.group] === undefined) {
						sectionAbandonedCounts[config.group] = 0;
					}
					sectionAbandonedCounts[config.group]++;
				}
			}
		}
		for (const section of sectionsStarted) {
			const fields = this.sectionFields[section] ?? [];
			const allCompleted = fields
				.filter((field) => !field.optional)
				.every((field) => this.fieldState[field.name]?.completed);
			if (allCompleted && fields.length) {
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
			abandoned_at_contact: sectionAbandonedCounts.contact ?? 0,
			abandoned_at_shipping: sectionAbandonedCounts.shipping_address ?? 0,
			abandoned_at_billing: sectionAbandonedCounts.billing_address ?? 0,
			abandoned_at_payment: sectionAbandonedCounts.credit_card ?? 0,
			abandoned_at_paypal: sectionAbandonedCounts.paypal ?? 0
		};
	}

	reset() {
		this.fieldState = {};
	}
}

function buildSectionFieldMap(fieldConfig) {
	return Object.entries(fieldConfig).reduce((acc, [fieldName, config]) => {
		if (!acc[config.group]) {
			acc[config.group] = [];
		}
		acc[config.group].push({ name: fieldName, optional: Boolean(config.optional) });
		return acc;
	}, {});
}

export function createFieldInteractionTracker(
	fieldConfig = FIELD_CONFIG,
	sectionOrder = SECTION_ORDER
) {
	const sectionFields =
		fieldConfig === FIELD_CONFIG ? DEFAULT_SECTION_FIELDS : buildSectionFieldMap(fieldConfig);
	return new FieldInteractionTracker(fieldConfig, sectionOrder, sectionFields);
}

const defaultTracker = createFieldInteractionTracker();

export const onPayPalStarted = () => defaultTracker.onPayPalStarted();
export const onPayPalCompleted = () => defaultTracker.onPayPalCompleted();
export const onPayPalAbandoned = () => defaultTracker.onPayPalAbandoned();
export const getAbandonmentSummary = () => defaultTracker.getAbandonmentSummary();

export const onFieldFocus = (fieldName) => defaultTracker.onFieldFocus(fieldName);
export const onFieldBlur = (fieldName, currentValue, hadValidationError = false) =>
	defaultTracker.onFieldBlur(fieldName, currentValue, hadValidationError);
export const onFieldCompleted = (fieldName) => defaultTracker.onFieldCompleted(fieldName);

export { FIELD_CONFIG };
