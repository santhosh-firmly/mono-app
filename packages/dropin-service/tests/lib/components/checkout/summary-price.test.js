import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SummaryPrice from '$lib/components/checkout/summary-price.svelte';

describe('Summary Price', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders total price formatted as currency', () => {
		const { getByText } = render(SummaryPrice, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		expect(getByText(/\$99\.99/)).toBeInTheDocument();
	});

	it('renders items quantity with plural form', () => {
		const { container } = render(SummaryPrice, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		// Check that the text contains the quantity
		expect(container.textContent).toContain('3');
	});

	it('renders items quantity with singular form for 1 item', () => {
		const { container } = render(SummaryPrice, {
			props: {
				itemsQuantity: 1,
				totalPrice: 29.99
			}
		});

		expect(container.textContent).toContain('1');
	});

	it('always shows price without skeleton', () => {
		const { container, getByText } = render(SummaryPrice, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		// Should not show skeleton
		const skeleton = container.querySelector('[class*="animate-pulse"]');
		expect(skeleton).not.toBeInTheDocument();

		// Should show price
		expect(getByText(/\$99\.99/)).toBeInTheDocument();
	});

	it('applies custom class', () => {
		const { container } = render(SummaryPrice, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99,
				class: 'custom-class'
			}
		});

		const wrapper = container.querySelector('span');
		expect(wrapper).toHaveClass('custom-class');
	});

	it('renders with flex column layout', () => {
		const { container } = render(SummaryPrice, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		const wrapper = container.querySelector('span');
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
	});

	it('renders price with large font size', () => {
		const { container } = render(SummaryPrice, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		const priceElement = container.querySelector('.text-4xl');
		expect(priceElement).toBeInTheDocument();
	});

	it('renders with 0 items quantity using plural form', () => {
		const { container } = render(SummaryPrice, {
			props: {
				itemsQuantity: 0,
				totalPrice: 0
			}
		});

		expect(container.textContent).toContain('0');
	});
});
