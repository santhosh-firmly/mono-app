import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import FastCheckout from '$lib/components/checkout/fast-checkout.svelte';

describe('FastCheckout', () => {
	afterEach(() => {
		cleanup();
	});

	describe('rendering', () => {
		it('renders PayPal button container when specified in use array', () => {
			const { container } = render(FastCheckout, {
				props: {
					use: ['paypal']
				}
			});

			const paypalContainer = container.querySelector('.paypal-fast-checkout-container');
			expect(paypalContainer).toBeInTheDocument();
		});

		it('renders PayPal button container by default', () => {
			const { container } = render(FastCheckout);

			const paypalContainer = container.querySelector('.paypal-fast-checkout-container');
			expect(paypalContainer).toBeInTheDocument();
		});

		it('does not render PayPal container when use array is empty', () => {
			const { container } = render(FastCheckout, {
				props: {
					use: []
				}
			});

			const paypalContainer = container.querySelector('.paypal-fast-checkout-container');
			expect(paypalContainer).toBeFalsy();
		});

		it('renders separator text', () => {
			const { container } = render(FastCheckout, {
				props: {
					use: ['paypal']
				}
			});

			const separator = container.querySelector('.separator');
			expect(separator).toBeInTheDocument();
		});

		it('renders with flex column layout', () => {
			const { container } = render(FastCheckout, {
				props: {
					use: ['paypal']
				}
			});

			const wrapper = container.querySelector('div');
			expect(wrapper).toHaveClass('flex');
			expect(wrapper).toHaveClass('flex-col');
			expect(wrapper).toHaveClass('gap-4');
		});
	});

	describe('PayPal container', () => {
		it('renders PayPal container for SDK button injection', () => {
			const { container } = render(FastCheckout, {
				props: {
					use: ['paypal']
				}
			});

			const paypalContainer = container.querySelector('.paypal-fast-checkout-container');
			expect(paypalContainer).toBeInTheDocument();
		});

		it('does not render PayPal container when paypal is not in use array', () => {
			const { container } = render(FastCheckout, {
				props: {
					use: []
				}
			});

			const paypalContainer = container.querySelector('.paypal-fast-checkout-container');
			expect(paypalContainer).toBeFalsy();
		});
	});
});
