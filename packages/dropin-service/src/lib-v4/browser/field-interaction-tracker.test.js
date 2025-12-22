import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	onFieldFocus,
	onFieldBlur,
	onFieldCompleted,
	onPayPalStarted,
	onPayPalCompleted,
	onPayPalAbandoned,
	getAbandonmentSummary,
	resetFieldState,
	FIELD_CONFIG
} from './field-interaction-tracker.js';

describe('Field Interaction Tracker', () => {
	beforeEach(() => {
		resetFieldState();
	});

	describe('onFieldFocus', () => {
		it('should mark field as interacted on focus', () => {
			onFieldFocus('email');

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should increment focus count on each focus', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false);
			onFieldFocus('email');
			onFieldBlur('email', '', false);
			onFieldFocus('email');

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should track different fields separately', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(2);
		});

		it('should warn for unknown fields', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			onFieldFocus('unknown_field');

			expect(consoleSpy).toHaveBeenCalledWith('[FieldTracker] Unknown field: unknown_field');

			consoleSpy.mockRestore();
		});
	});

	describe('onFieldBlur', () => {
		it('should mark field as abandoned when left empty', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(1);
		});

		it('should mark field as abandoned when incomplete', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test', false); // Missing @ symbol

			const summary = getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(1);
		});

		it('should not mark field as abandoned when complete', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test@example.com', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(0);
			expect(summary.fields_completed).toBe(1);
		});

		it('should track validation error state', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'invalid', true);

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should not mark optional field as abandoned when empty', () => {
			onFieldFocus('shipping_address2');
			onFieldBlur('shipping_address2', '', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(0);
		});

		it('should accumulate time across multiple focus/blur cycles', () => {
			// First focus/blur
			onFieldFocus('email');
			onFieldBlur('email', '', false);

			// Second focus/blur
			onFieldFocus('email');
			onFieldBlur('email', '', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});
	});

	describe('onFieldCompleted', () => {
		it('should mark field as completed', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test', false); // Initially incomplete
			onFieldCompleted('email');

			const summary = getAbandonmentSummary();
			expect(summary.fields_completed).toBe(1);
			expect(summary.fields_abandoned).toBe(0);
		});

		it('should clear abandonment state when completed', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false); // Abandoned

			const summaryBefore = getAbandonmentSummary();
			expect(summaryBefore.fields_abandoned).toBe(1);

			onFieldCompleted('email');

			const summaryAfter = getAbandonmentSummary();
			expect(summaryAfter.fields_abandoned).toBe(0);
		});
	});

	describe('PayPal tracking', () => {
		it('should track PayPal flow start', () => {
			onPayPalStarted();

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
			expect(summary.reached_paypal).toBe(1);
		});

		it('should increment focus count on multiple PayPal starts', () => {
			onPayPalStarted();
			onPayPalAbandoned();
			onPayPalStarted();

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
		});

		it('should track PayPal completion', () => {
			onPayPalStarted();
			onPayPalCompleted();

			const summary = getAbandonmentSummary();
			expect(summary.fields_completed).toBe(1);
			expect(summary.completed_paypal).toBe(1);
		});

		it('should track PayPal abandonment on cancel', () => {
			onPayPalStarted();
			onPayPalAbandoned();

			const summary = getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(1);
		});

		it('should not mark as abandoned if already completed', () => {
			onPayPalStarted();
			onPayPalCompleted();
			onPayPalAbandoned();

			const summary = getAbandonmentSummary();
			expect(summary.fields_abandoned).toBe(0);
		});
	});

	describe('getAbandonmentSummary', () => {
		it('should return empty summary when no interactions', () => {
			const summary = getAbandonmentSummary();

			expect(summary.fields_interacted).toBe(0);
			expect(summary.fields_completed).toBe(0);
			expect(summary.fields_abandoned).toBe(0);
			expect(summary.furthest_section).toBe(0);
		});

		it('should track sections started', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');

			const summary = getAbandonmentSummary();

			expect(summary.reached_contact).toBe(1);
			expect(summary.reached_shipping).toBe(1);
			expect(summary.fields_interacted).toBe(2);
		});

		it('should track sections completed when all required fields completed', () => {
			// Complete email section
			onFieldFocus('email');
			onFieldCompleted('email');

			const summary = getAbandonmentSummary();

			expect(summary.completed_contact).toBe(1);
		});

		it('should not mark section as completed if required fields missing', () => {
			// Only complete one shipping field
			onFieldFocus('shipping_full_name');
			onFieldCompleted('shipping_full_name');

			const summary = getAbandonmentSummary();

			expect(summary.reached_shipping).toBe(1);
			expect(summary.completed_shipping).toBe(0);
		});

		it('should track furthest section reached', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');
			onFieldFocus('card_number');

			const summary = getAbandonmentSummary();

			expect(summary.furthest_section).toBe(4);
		});

		it('should count abandoned fields correctly', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false); // Abandoned

			onFieldFocus('shipping_full_name');
			onFieldCompleted('shipping_full_name'); // Completed

			const summary = getAbandonmentSummary();

			expect(summary.fields_interacted).toBe(2);
			expect(summary.fields_completed).toBe(1);
			expect(summary.fields_abandoned).toBe(1);
			expect(summary.abandoned_at_contact).toBe(1);
			expect(summary.abandoned_at_shipping).toBe(0);
		});

		it('should calculate completion rate correctly', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test@example.com', false);
			onFieldFocus('shipping_full_name');
			onFieldBlur('shipping_full_name', '', false);

			const summary = getAbandonmentSummary();

			expect(summary.fields_interacted).toBe(2);
			expect(summary.fields_completed).toBe(1);
			expect(summary.completion_rate).toBe(50);
			expect(summary.abandoned_at_contact).toBe(0);
			expect(summary.abandoned_at_shipping).toBe(1);
		});

		it('should track section-specific abandonment counts', () => {
			// Abandon contact
			onFieldFocus('email');
			onFieldBlur('email', '', false);

			// Abandon multiple shipping fields
			onFieldFocus('shipping_full_name');
			onFieldBlur('shipping_full_name', '', false);
			onFieldFocus('shipping_address1');
			onFieldBlur('shipping_address1', '', false);

			// Abandon payment
			onFieldFocus('card_number');
			onFieldBlur('card_number', '', false);

			const summary = getAbandonmentSummary();

			expect(summary.abandoned_at_contact).toBe(1);
			expect(summary.abandoned_at_shipping).toBe(2);
			expect(summary.abandoned_at_billing).toBe(0);
			expect(summary.abandoned_at_payment).toBe(1);
			expect(summary.abandoned_at_paypal).toBe(0);
		});

		it('should track PayPal abandonment separately', () => {
			onPayPalStarted();
			onPayPalAbandoned();

			const summary = getAbandonmentSummary();

			expect(summary.abandoned_at_paypal).toBe(1);
			expect(summary.abandoned_at_payment).toBe(0);
		});
	});

	describe('resetFieldState', () => {
		it('should clear all field state', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');

			resetFieldState();

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(0);
		});

		it('should allow tracking new interactions after reset', () => {
			onFieldFocus('email');
			resetFieldState();

			onFieldFocus('email');

			const summary = getAbandonmentSummary();
			expect(summary.fields_interacted).toBe(1);
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
			expect(emailConfig.isComplete('a@b.c')).toBe(true);
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

			expect(expiryConfig.isComplete('12/25')).toBe(true);
			expect(expiryConfig.isComplete('1225')).toBe(true);
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
