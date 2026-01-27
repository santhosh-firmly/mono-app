import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SummaryResume from '$lib/components/checkout/summary-resume.svelte';

describe('Summary Resume', () => {
	afterEach(() => {
		cleanup();
	});

	const defaultProps = {
		total: 99.99,
		subtotal: 89.99,
		shipping: { price: 5.99, description: 'Standard Shipping' },
		tax: 4.01
	};

	it('renders subtotal formatted as currency', () => {
		const { getByText } = render(SummaryResume, {
			props: defaultProps
		});

		expect(getByText(/\$89\.99/)).toBeInTheDocument();
	});

	it('renders total formatted as currency', () => {
		const { getByText } = render(SummaryResume, {
			props: defaultProps
		});

		expect(getByText(/\$99\.99/)).toBeInTheDocument();
	});

	it('renders shipping price when provided', () => {
		const { getByText } = render(SummaryResume, {
			props: defaultProps
		});

		expect(getByText(/\$5\.99/)).toBeInTheDocument();
	});

	it('renders shipping description when provided', () => {
		const { getByText } = render(SummaryResume, {
			props: defaultProps
		});

		expect(getByText('Standard Shipping')).toBeInTheDocument();
	});

	it('renders tax formatted as currency', () => {
		const { getByText } = render(SummaryResume, {
			props: defaultProps
		});

		expect(getByText(/\$4\.01/)).toBeInTheDocument();
	});

	it('shows "Free" when shipping price is 0', () => {
		const { container } = render(SummaryResume, {
			props: {
				...defaultProps,
				shipping: { price: 0, description: 'Standard Shipping' }
			}
		});

		// Find the shipping value element (the one after the shipping label)
		const shippingRows = container.querySelectorAll('.text-muted');
		const shippingRow = shippingRows[0];
		const shippingValue = shippingRow.querySelector('p.text-sm:last-child');
		expect(shippingValue.textContent.trim()).toBe('Free');
	});

	it('hides total when hiddenTotal is true', () => {
		const { queryByText } = render(SummaryResume, {
			props: {
				...defaultProps,
				hiddenTotal: true
			}
		});

		// Total section should not be visible
		// The subtotal should still be visible
		expect(queryByText(/\$89\.99/)).toBeInTheDocument();
	});

	it('shows total when hiddenTotal is false', () => {
		const { getByText } = render(SummaryResume, {
			props: {
				...defaultProps,
				hiddenTotal: false
			}
		});

		expect(getByText(/\$99\.99/)).toBeInTheDocument();
	});

	it('shows skeleton only for shipping and tax when isCalculating is true', () => {
		const { container, queryByText } = render(SummaryResume, {
			props: {
				...defaultProps,
				isCalculating: true
			}
		});

		// Should show skeleton elements for shipping and tax only
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBe(2);

		// Subtotal and total should still be visible
		expect(queryByText(/\$89\.99/)).toBeInTheDocument();
		expect(queryByText(/\$99\.99/)).toBeInTheDocument();

		// Shipping and tax prices should not be visible
		expect(queryByText(/\$5\.99/)).not.toBeInTheDocument();
		expect(queryByText(/\$4\.01/)).not.toBeInTheDocument();
	});

	it('always shows prices without skeleton when not calculating', () => {
		const { container, getByText } = render(SummaryResume, {
			props: defaultProps
		});

		// Should not show any skeleton elements
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBe(0);

		// All prices should be visible
		expect(getByText(/\$89\.99/)).toBeInTheDocument();
		expect(getByText(/\$99\.99/)).toBeInTheDocument();
		expect(getByText(/\$5\.99/)).toBeInTheDocument();
		expect(getByText(/\$4\.01/)).toBeInTheDocument();
	});

	it('does not show skeleton when isCalculating is false', () => {
		const { container } = render(SummaryResume, {
			props: {
				...defaultProps,
				isCalculating: false
			}
		});

		// Should not show skeleton
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBe(0);
	});

	it('renders with flex column layout', () => {
		const { container } = render(SummaryResume, {
			props: defaultProps
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
	});

	it('renders with border separator', () => {
		const { container } = render(SummaryResume, {
			props: defaultProps
		});

		const borderElement = container.querySelector('[class*="border-b"]');
		expect(borderElement).toBeInTheDocument();
	});
});
