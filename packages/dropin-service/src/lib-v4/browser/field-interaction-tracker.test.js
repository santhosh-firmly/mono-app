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
			expect(summary.fields.email.interacted).toBe(true);
		});

		it('should increment focus count on each focus', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false);
			onFieldFocus('email');
			onFieldBlur('email', '', false);
			onFieldFocus('email');

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.focus_count).toBe(3);
		});

		it('should track different fields separately', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.interacted).toBe(true);
			expect(summary.fields.shipping_full_name.interacted).toBe(true);
			expect(summary.total_fields_interacted).toBe(2);
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
			expect(summary.fields.email.abandoned).toBe(true);
			expect(summary.fields.email.abandonment_type).toBe('focused_empty');
		});

		it('should mark field as abandoned when incomplete', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test', false); // Missing @ symbol

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.abandoned).toBe(true);
			expect(summary.fields.email.abandonment_type).toBe('incomplete');
		});

		it('should not mark field as abandoned when complete', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test@example.com', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.abandoned).toBe(false);
			expect(summary.fields.email.completed).toBe(true);
		});

		it('should track validation error state', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'invalid', true);

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.had_validation_errors).toBe(true);
		});

		it('should not mark optional field as abandoned when empty', () => {
			onFieldFocus('shipping_address2');
			onFieldBlur('shipping_address2', '', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields.shipping_address2.abandoned).toBe(false);
		});

		it('should accumulate time across multiple focus/blur cycles', () => {
			// First focus/blur
			onFieldFocus('email');
			onFieldBlur('email', '', false);

			// Second focus/blur
			onFieldFocus('email');
			onFieldBlur('email', '', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.total_time_ms).toBeGreaterThanOrEqual(0);
			expect(summary.fields.email.focus_count).toBe(2);
		});

		it('should track final value length', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test@example.com', false);

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.final_value_length).toBe(16);
		});
	});

	describe('onFieldCompleted', () => {
		it('should mark field as completed', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test', false); // Initially incomplete
			onFieldCompleted('email', 'test@example.com');

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.completed).toBe(true);
			expect(summary.fields.email.abandoned).toBe(false);
		});

		it('should clear abandonment state when completed', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false); // Abandoned

			const summaryBefore = getAbandonmentSummary();
			expect(summaryBefore.fields.email.abandoned).toBe(true);

			onFieldCompleted('email', 'test@example.com');

			const summaryAfter = getAbandonmentSummary();
			expect(summaryAfter.fields.email.abandoned).toBe(false);
			expect(summaryAfter.fields.email.abandonment_type).toBeNull();
		});
	});

	describe('PayPal tracking', () => {
		it('should track PayPal flow start', () => {
			onPayPalStarted();

			const summary = getAbandonmentSummary();
			expect(summary.fields.paypal_button.interacted).toBe(true);
		});

		it('should increment focus count on multiple PayPal starts', () => {
			onPayPalStarted();
			onPayPalAbandoned();
			onPayPalStarted();

			const summary = getAbandonmentSummary();
			expect(summary.fields.paypal_button.focus_count).toBe(2);
		});

		it('should track PayPal completion', () => {
			onPayPalStarted();
			onPayPalCompleted();

			const summary = getAbandonmentSummary();
			expect(summary.fields.paypal_button.completed).toBe(true);
			expect(summary.fields.paypal_button.abandoned).toBe(false);
		});

		it('should track PayPal abandonment on cancel', () => {
			onPayPalStarted();
			onPayPalAbandoned();

			const summary = getAbandonmentSummary();
			expect(summary.fields.paypal_button.abandoned).toBe(true);
			expect(summary.fields.paypal_button.abandonment_type).toBe('incomplete');
		});

		it('should not mark as abandoned if already completed', () => {
			onPayPalStarted();
			onPayPalCompleted();
			onPayPalAbandoned();

			const summary = getAbandonmentSummary();
			expect(summary.fields.paypal_button.abandoned).toBe(false);
		});
	});

	describe('getAbandonmentSummary', () => {
		it('should return empty summary when no interactions', () => {
			const summary = getAbandonmentSummary();

			expect(summary.sections_started).toEqual([]);
			expect(summary.sections_completed).toEqual([]);
			expect(summary.total_fields_interacted).toBe(0);
			expect(summary.total_fields_completed).toBe(0);
			expect(summary.total_fields_abandoned).toBe(0);
			expect(summary.furthest_section_reached).toBeNull();
		});

		it('should track sections started', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');

			const summary = getAbandonmentSummary();

			expect(summary.sections_started).toContain('contact');
			expect(summary.sections_started).toContain('shipping_address');
			expect(summary.total_fields_interacted).toBe(2);
		});

		it('should track sections completed when all required fields completed', () => {
			// Complete email section
			onFieldFocus('email');
			onFieldCompleted('email', 'test@example.com');

			const summary = getAbandonmentSummary();

			expect(summary.sections_completed).toContain('contact');
		});

		it('should not mark section as completed if required fields missing', () => {
			// Only complete one shipping field
			onFieldFocus('shipping_full_name');
			onFieldCompleted('shipping_full_name', 'John Doe');

			const summary = getAbandonmentSummary();

			expect(summary.sections_started).toContain('shipping_address');
			expect(summary.sections_completed).not.toContain('shipping_address');
		});

		it('should track furthest section reached', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');
			onFieldFocus('card_number');

			const summary = getAbandonmentSummary();

			expect(summary.furthest_section_reached).toBe('credit_card');
		});

		it('should count abandoned fields correctly', () => {
			onFieldFocus('email');
			onFieldBlur('email', '', false); // Abandoned

			onFieldFocus('shipping_full_name');
			onFieldCompleted('shipping_full_name', 'John Doe'); // Completed

			const summary = getAbandonmentSummary();

			expect(summary.total_fields_interacted).toBe(2);
			expect(summary.total_fields_completed).toBe(1);
			expect(summary.total_fields_abandoned).toBe(1);
		});

		it('should include per-field metrics', () => {
			onFieldFocus('email');
			onFieldBlur('email', 'test@example.com', false);

			const summary = getAbandonmentSummary();

			expect(summary.fields.email).toEqual({
				interacted: true,
				completed: true,
				abandoned: false,
				abandonment_type: null,
				total_time_ms: expect.any(Number),
				focus_count: 1,
				had_validation_errors: false,
				final_value_length: 16
			});
		});
	});

	describe('resetFieldState', () => {
		it('should clear all field state', () => {
			onFieldFocus('email');
			onFieldFocus('shipping_full_name');

			resetFieldState();

			const summary = getAbandonmentSummary();
			expect(summary.total_fields_interacted).toBe(0);
		});

		it('should allow tracking new interactions after reset', () => {
			onFieldFocus('email');
			resetFieldState();

			onFieldFocus('email');

			const summary = getAbandonmentSummary();
			expect(summary.fields.email.interacted).toBe(true);
			expect(summary.fields.email.focus_count).toBe(1);
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
