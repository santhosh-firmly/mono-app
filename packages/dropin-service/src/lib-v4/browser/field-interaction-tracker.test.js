import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	onPayPalStarted,
	onPayPalCompleted,
	onPayPalAbandoned,
	getAbandonmentSummary,
	createFieldInteractionTracker,
	FIELD_CONFIG
} from './field-interaction-tracker.js';

const formatExpiry = (date) =>
	`${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getFullYear() % 100).padStart(2, '0')}`;

const getFutureExpiry = (monthsAhead = 1) => {
	const date = new Date();
	date.setMonth(date.getMonth() + monthsAhead);
	return formatExpiry(date);
};

const getPastExpiry = (monthsBehind = 1) => {
	const date = new Date();
	date.setMonth(date.getMonth() - monthsBehind);
	return formatExpiry(date);
};

describe('Field Interaction Tracker', () => {
	describe('onFieldFocus', () => {
		it('should mark field as interacted on focus', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should increment focus count on each focus', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false);
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false);
			tracker.onFieldFocus('email');

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should track different fields separately', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldFocus('shipping_full_name');

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(2);
		});

		it('should warn for unknown fields', () => {
			const tracker = createFieldInteractionTracker();
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			tracker.onFieldFocus('unknown_field');

			expect(consoleSpy).toHaveBeenCalledWith('[FieldTracker] Unknown field: unknown_field');

			consoleSpy.mockRestore();
		});
	});

	describe('onFieldBlur', () => {
		it('should mark field as abandoned when left empty', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false);

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(1);
		});

		it('should mark field as abandoned when incomplete', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', 'test', false); // Missing @ symbol

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(1);
		});

		it('should not mark field as abandoned when complete', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', 'test@example.com', false);

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(0);
			expect(summary.fields_completed).toBe(1);
		});

		it('should track validation error state', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', 'invalid', true);

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should not mark optional field as abandoned when empty', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('shipping_address2');
			tracker.onFieldBlur('shipping_address2', '', false);

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(0);
		});

		it('should accumulate time across multiple focus/blur cycles', () => {
			const tracker = createFieldInteractionTracker();
			// First focus/blur
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false);

			// Second focus/blur
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false);

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});
	});

	describe('onFieldCompleted', () => {
		it('should mark field as completed', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', 'test', false); // Initially incomplete
			tracker.onFieldCompleted('email');

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_completed).toBe(1);
			expect(summary.fields_abandoned).toBe(0);
		});

		it('should clear abandonment state when completed', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false); // Abandoned

			const summaryBefore = tracker.getAbandonmentSummary();
			expect(summaryBefore.fields_abandoned).toBe(1);

			tracker.onFieldCompleted('email');

			const summaryAfter = tracker.getAbandonmentSummary();
			expect(summaryAfter.fields_abandoned).toBe(0);
		});
	});

	describe('PayPal tracking', () => {
		it('should track PayPal flow start', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onPayPalStarted();

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
			expect(summary.reached_paypal).toBe(1);
		});

		it('should increment focus count on multiple PayPal starts', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onPayPalStarted();
			tracker.onPayPalAbandoned();
			tracker.onPayPalStarted();

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should track PayPal completion', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onPayPalStarted();
			tracker.onPayPalCompleted();

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_completed).toBe(1);
			expect(summary.completed_paypal).toBe(1);
		});

		it('should track PayPal abandonment on cancel', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onPayPalStarted();
			tracker.onPayPalAbandoned();

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(1);
		});

		it('should not mark as abandoned if already completed', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onPayPalStarted();
			tracker.onPayPalCompleted();
			tracker.onPayPalAbandoned();

			const summary = tracker.getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(0);
		});
	});

	describe('getAbandonmentSummary', () => {
		it('should return empty summary when no interactions', () => {
			const tracker = createFieldInteractionTracker();
			const summary = tracker.getAbandonmentSummary();

			expect(summary.fields_interacted).toBe(0);
			expect(summary.fields_completed).toBe(0);
			expect(summary.fields_abandoned).toBe(0);
			expect(summary.furthest_section).toBe(0);
		});

		it('should track sections started', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldFocus('shipping_full_name');

			const summary = tracker.getAbandonmentSummary();

			expect(summary.reached_contact).toBe(1);
			expect(summary.reached_shipping).toBe(1);
			expect(summary.fields_interacted).toBe(2);
		});

		it('should track sections completed when all required fields completed', () => {
			const tracker = createFieldInteractionTracker();
			// Complete email section
			tracker.onFieldFocus('email');
			tracker.onFieldCompleted('email');

			const summary = tracker.getAbandonmentSummary();

			expect(summary.completed_contact).toBe(1);
		});

		it('should not mark section as completed if required fields missing', () => {
			const tracker = createFieldInteractionTracker();
			// Only complete one shipping field
			tracker.onFieldFocus('shipping_full_name');
			tracker.onFieldCompleted('shipping_full_name');

			const summary = tracker.getAbandonmentSummary();

			expect(summary.reached_shipping).toBe(1);
			expect(summary.completed_shipping).toBe(0);
		});

		it('should track furthest section reached', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldFocus('shipping_full_name');
			tracker.onFieldFocus('card_number');

			const summary = tracker.getAbandonmentSummary();

			expect(summary.furthest_section).toBe(4);
		});

		it('should count abandoned fields correctly', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false); // Abandoned

			tracker.onFieldFocus('shipping_full_name');
			tracker.onFieldCompleted('shipping_full_name'); // Completed

			const summary = tracker.getAbandonmentSummary();

			expect(summary.fields_interacted).toBe(2);
			expect(summary.fields_completed).toBe(1);
			expect(summary.fields_abandoned).toBe(1);
			expect(summary.abandoned_at_contact).toBe(1);
			expect(summary.abandoned_at_shipping).toBe(0);
		});

		it('should calculate completion rate correctly', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', 'test@example.com', false);
			tracker.onFieldFocus('shipping_full_name');
			tracker.onFieldBlur('shipping_full_name', '', false);

			const summary = tracker.getAbandonmentSummary();

			expect(summary.fields_interacted).toBe(2);
			expect(summary.fields_completed).toBe(1);
			expect(summary.completion_rate).toBe(50);
			expect(summary.abandoned_at_contact).toBe(0);
			expect(summary.abandoned_at_shipping).toBe(1);
		});

		it('should track section-specific abandonment counts', () => {
			const tracker = createFieldInteractionTracker();
			// Abandon contact
			tracker.onFieldFocus('email');
			tracker.onFieldBlur('email', '', false);

			// Abandon multiple shipping fields
			tracker.onFieldFocus('shipping_full_name');
			tracker.onFieldBlur('shipping_full_name', '', false);
			tracker.onFieldFocus('shipping_address1');
			tracker.onFieldBlur('shipping_address1', '', false);

			// Abandon payment
			tracker.onFieldFocus('card_number');
			tracker.onFieldBlur('card_number', '', false);

			const summary = tracker.getAbandonmentSummary();

			expect(summary.abandoned_at_contact).toBe(1);
			expect(summary.abandoned_at_shipping).toBe(2);
			expect(summary.abandoned_at_billing).toBe(0);
			expect(summary.abandoned_at_payment).toBe(1);
			expect(summary.abandoned_at_paypal).toBe(0);
		});

		it('should track PayPal abandonment separately', () => {
			const tracker = createFieldInteractionTracker();
			tracker.onPayPalStarted();
			tracker.onPayPalAbandoned();

			const summary = tracker.getAbandonmentSummary();

			expect(summary.abandoned_at_paypal).toBe(1);
			expect(summary.abandoned_at_payment).toBe(0);
		});
	});

	describe('createFieldInteractionTracker', () => {
		it('should create isolated tracker instances', () => {
			const trackerA = createFieldInteractionTracker();
			const trackerB = createFieldInteractionTracker();

			trackerA.onFieldFocus('email');
			trackerA.onFieldCompleted('email');

			expect(trackerA.getAbandonmentSummary().fields_interacted).toBe(1);
			expect(trackerB.getAbandonmentSummary().fields_interacted).toBe(0);
		});
	});

	describe('FIELD_CONFIG', () => {
		it('should have all expected field groups', () => {
			const groups = new Set(Object.values(FIELD_CONFIG).map((c) => c.group));

			expect(groups).toContain('contact');
			expect(groups).toContain('shipping_address');
			expect(groups).toContain('billing_address');
			expect(groups).toContain('credit_card');
			expect(groups).toContain('paypal');
		});

		it('should validate email correctly', () => {
			const emailConfig = FIELD_CONFIG.email;

			expect(emailConfig.isComplete('test@example.com')).toBe(true);
			expect(emailConfig.isComplete('user@example.co')).toBe(true);
			expect(emailConfig.isComplete('a@b.c')).toBe(false);
			expect(emailConfig.isComplete('test')).toBeFalsy();
			expect(emailConfig.isComplete('')).toBeFalsy();
			expect(emailConfig.isComplete(null)).toBeFalsy();
		});

		it('should validate card number correctly', () => {
			const cardConfig = FIELD_CONFIG.card_number;

			expect(cardConfig.isComplete('4111111111111111')).toBe(true);
			expect(cardConfig.isComplete('4111 1111 1111 1111')).toBe(true);
			expect(cardConfig.isComplete('411111111111')).toBeFalsy();
			expect(cardConfig.isComplete('')).toBeFalsy();
		});

		it('should validate card expiry correctly', () => {
			const expiryConfig = FIELD_CONFIG.card_expiry;
			const futureExpiry = getFutureExpiry();
			const futureExpiryWithSlash = `${futureExpiry.slice(0, 2)}/${futureExpiry.slice(2)}`;
			const pastExpiry = getPastExpiry();

			expect(expiryConfig.isComplete(futureExpiryWithSlash)).toBe(true);
			expect(expiryConfig.isComplete(futureExpiry)).toBe(true);
			expect(expiryConfig.isComplete('13/25')).toBe(false);
			expect(expiryConfig.isComplete(pastExpiry)).toBe(false);
			expect(expiryConfig.isComplete('12/2')).toBeFalsy();
			expect(expiryConfig.isComplete('')).toBeFalsy();
		});

		it('should validate postal code correctly', () => {
			const postalConfig = FIELD_CONFIG.shipping_postal_code;

			expect(postalConfig.isComplete('12345')).toBe(true);
			expect(postalConfig.isComplete('12345-6789')).toBe(true);
			expect(postalConfig.isComplete('1234')).toBeFalsy();
			expect(postalConfig.isComplete('')).toBeFalsy();
		});

		it('should mark address2 as optional', () => {
			expect(FIELD_CONFIG.shipping_address2.optional).toBe(true);
			expect(FIELD_CONFIG.billing_address2.optional).toBe(true);
		});
	});
});
