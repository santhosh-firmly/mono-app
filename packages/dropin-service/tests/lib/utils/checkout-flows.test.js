import { describe, it, expect } from 'vitest';
import { CHECKOUT_FLOWS, getAvailableFlows } from '$lib/utils/checkout-flows.js';

describe('checkout-flows', () => {
	describe('CHECKOUT_FLOWS', () => {
		it('has simple flow defined', () => {
			expect(CHECKOUT_FLOWS.simple).toBeDefined();
			expect(CHECKOUT_FLOWS.simple.id).toBe('simple');
			expect(CHECKOUT_FLOWS.simple.name).toBe('Simple Checkout');
		});

		it('has withPromo flow defined', () => {
			expect(CHECKOUT_FLOWS.withPromo).toBeDefined();
			expect(CHECKOUT_FLOWS.withPromo.id).toBe('withPromo');
			expect(CHECKOUT_FLOWS.withPromo.featureConfig.promoCodes).toBe(true);
		});

		it('has clickToPay flow defined', () => {
			expect(CHECKOUT_FLOWS.clickToPay).toBeDefined();
			expect(CHECKOUT_FLOWS.clickToPay.id).toBe('clickToPay');
			expect(CHECKOUT_FLOWS.clickToPay.featureConfig.clickToPay).toBe(true);
		});

		it('has clickToPayWithCvv flow defined', () => {
			expect(CHECKOUT_FLOWS.clickToPayWithCvv).toBeDefined();
			expect(CHECKOUT_FLOWS.clickToPayWithCvv.id).toBe('clickToPayWithCvv');
			expect(CHECKOUT_FLOWS.clickToPayWithCvv.featureConfig.clickToPay).toBe(true);
		});

		it('has paypal flow defined', () => {
			expect(CHECKOUT_FLOWS.paypal).toBeDefined();
			expect(CHECKOUT_FLOWS.paypal.id).toBe('paypal');
			expect(CHECKOUT_FLOWS.paypal.featureConfig.paypal).toBe(true);
		});
	});

	describe('flow structure', () => {
		const flowIds = Object.keys(CHECKOUT_FLOWS);

		it.each(flowIds)('%s has required properties', (flowId) => {
			const flow = CHECKOUT_FLOWS[flowId];

			expect(flow.id).toBe(flowId);
			expect(flow.name).toBeDefined();
			expect(typeof flow.name).toBe('string');
			expect(flow.description).toBeDefined();
			expect(typeof flow.description).toBe('string');
			expect(flow.featureConfig).toBeDefined();
			expect(flow.steps).toBeDefined();
			expect(Array.isArray(flow.steps)).toBe(true);
		});

		it.each(flowIds)('%s has valid feature config', (flowId) => {
			const { featureConfig } = CHECKOUT_FLOWS[flowId];

			expect(typeof featureConfig.promoCodes).toBe('boolean');
			expect(typeof featureConfig.paypal).toBe('boolean');
			expect(typeof featureConfig.clickToPay).toBe('boolean');
		});

		it.each(flowIds)('%s has valid steps', (flowId) => {
			const { steps } = CHECKOUT_FLOWS[flowId];
			const validActions = [
				'type',
				'click',
				'clickByText',
				'wait',
				'waitForElement',
				'waitForText'
			];

			steps.forEach((step) => {
				expect(validActions).toContain(step.action);

				if (step.action === 'type') {
					expect(step.selector).toBeDefined();
					expect(step.value).toBeDefined();
				}

				if (step.action === 'click') {
					expect(step.selector).toBeDefined();
				}

				if (step.action === 'clickByText') {
					expect(step.tagName).toBeDefined();
					expect(step.text).toBeDefined();
				}

				if (step.action === 'wait') {
					expect(typeof step.ms).toBe('number');
				}

				if (step.action === 'waitForElement') {
					expect(step.selector).toBeDefined();
				}

				if (step.action === 'waitForText') {
					expect(step.text).toBeDefined();
				}
			});
		});

		it.each(flowIds)('%s ends with waitForText for Thank You', (flowId) => {
			const { steps } = CHECKOUT_FLOWS[flowId];
			const lastStep = steps[steps.length - 1];

			expect(lastStep.action).toBe('waitForText');
			expect(lastStep.text).toBe('Thank You!');
		});
	});

	describe('simple flow', () => {
		const flow = CHECKOUT_FLOWS.simple;

		it('disables all optional features', () => {
			expect(flow.featureConfig.promoCodes).toBe(false);
			expect(flow.featureConfig.paypal).toBe(false);
			expect(flow.featureConfig.clickToPay).toBe(false);
		});

		it('fills shipping info', () => {
			const shippingFields = flow.steps.filter(
				(s) => s.action === 'type' && s.selector?.includes('shipping')
			);
			expect(shippingFields.length).toBeGreaterThan(0);
		});

		it('fills card info', () => {
			const cardNumber = flow.steps.find((s) => s.selector?.includes('4111'));
			const expiration = flow.steps.find((s) => s.selector?.includes('MM / YY'));
			const cvv = flow.steps.find((s) => s.selector?.includes('CVC'));

			expect(cardNumber).toBeDefined();
			expect(expiration).toBeDefined();
			expect(cvv).toBeDefined();
		});

		it('submits form', () => {
			const submitStep = flow.steps.find(
				(s) => s.action === 'click' && s.selector?.includes('submit')
			);
			expect(submitStep).toBeDefined();
		});
	});

	describe('withPromo flow', () => {
		const flow = CHECKOUT_FLOWS.withPromo;

		it('enables promo codes feature', () => {
			expect(flow.featureConfig.promoCodes).toBe(true);
		});

		it('clicks promo code button', () => {
			const promoClick = flow.steps.find(
				(s) => s.action === 'clickByText' && s.text?.includes('promotion')
			);
			expect(promoClick).toBeDefined();
		});

		it('types promo code SAVE20', () => {
			const promoType = flow.steps.find((s) => s.value === 'SAVE20');
			expect(promoType).toBeDefined();
		});

		it('applies promo code', () => {
			const applyClick = flow.steps.find(
				(s) => s.action === 'clickByText' && s.text === 'Apply'
			);
			expect(applyClick).toBeDefined();
		});
	});

	describe('clickToPay flow', () => {
		const flow = CHECKOUT_FLOWS.clickToPay;

		it('enables clickToPay feature', () => {
			expect(flow.featureConfig.clickToPay).toBe(true);
		});

		it('uses c2p email', () => {
			const emailStep = flow.steps.find((s) => s.value === 'c2p@example.com');
			expect(emailStep).toBeDefined();
		});

		it('fills OTP digits', () => {
			const otpSteps = flow.steps.filter(
				(s) => s.action === 'type' && s.selector?.includes('OTP digit')
			);
			expect(otpSteps.length).toBe(6);
		});

		it('selects saved card', () => {
			const cardSelect = flow.steps.find((s) => s.selector?.includes('saved-card'));
			expect(cardSelect).toBeDefined();
		});
	});

	describe('clickToPayWithCvv flow', () => {
		const flow = CHECKOUT_FLOWS.clickToPayWithCvv;

		it('requires CVV entry', () => {
			const cvvStep = flow.steps.find((s) => s.selector?.includes('CVV'));
			expect(cvvStep).toBeDefined();
		});

		it('clicks Place order button', () => {
			const placeOrderClick = flow.steps.find(
				(s) => s.action === 'clickByText' && s.text === 'Place order'
			);
			expect(placeOrderClick).toBeDefined();
		});
	});

	describe('paypal flow', () => {
		const flow = CHECKOUT_FLOWS.paypal;

		it('enables paypal feature', () => {
			expect(flow.featureConfig.paypal).toBe(true);
		});

		it('clicks paypal button', () => {
			const paypalClick = flow.steps.find((s) => s.selector?.includes('paypal'));
			expect(paypalClick).toBeDefined();
		});

		it('has fewer steps than other flows', () => {
			expect(flow.steps.length).toBeLessThan(CHECKOUT_FLOWS.simple.steps.length);
		});
	});

	describe('getAvailableFlows', () => {
		it('returns array of all flows', () => {
			const flows = getAvailableFlows();

			expect(Array.isArray(flows)).toBe(true);
			expect(flows.length).toBe(Object.keys(CHECKOUT_FLOWS).length);
		});

		it('returns flows with correct structure', () => {
			const flows = getAvailableFlows();

			flows.forEach((flow) => {
				expect(flow.id).toBeDefined();
				expect(flow.name).toBeDefined();
				expect(flow.description).toBeDefined();
				expect(flow.featureConfig).toBeDefined();
				expect(flow.steps).toBeDefined();
			});
		});

		it('includes all defined flows', () => {
			const flows = getAvailableFlows();
			const flowIds = flows.map((f) => f.id);

			expect(flowIds).toContain('simple');
			expect(flowIds).toContain('withPromo');
			expect(flowIds).toContain('clickToPay');
			expect(flowIds).toContain('clickToPayWithCvv');
			expect(flowIds).toContain('paypal');
		});
	});
});
