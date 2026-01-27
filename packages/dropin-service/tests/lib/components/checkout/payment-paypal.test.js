import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import CheckoutPaymentPaypal from '$lib/components/checkout/payment-paypal.svelte';

describe('CheckoutPaymentPaypal', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders PayPal button container', () => {
		const { container } = render(CheckoutPaymentPaypal, {
			props: {}
		});
		const paypalContainer = container.querySelector('.paypal-payment-container');
		expect(paypalContainer).toBeTruthy();
	});

	it('displays PayPal branding', () => {
		const { getAllByText } = render(CheckoutPaymentPaypal, {
			props: {}
		});
		const paypalElements = getAllByText(/PayPal/i);
		expect(paypalElements.length).toBeGreaterThan(0);
	});

	it('shows redirect message when not connected', () => {
		const { getByText } = render(CheckoutPaymentPaypal, {
			props: { connected: false }
		});
		expect(getByText(/redirected to Paypal/i)).toBeTruthy();
	});

	it('shows connected state when authorized', () => {
		const { getByText, container } = render(CheckoutPaymentPaypal, {
			props: { connected: true }
		});
		expect(getByText(/Connected/i)).toBeTruthy();
		const paypalContainer = container.querySelector('.paypal-payment-container');
		expect(paypalContainer).toBeFalsy();
	});
});
