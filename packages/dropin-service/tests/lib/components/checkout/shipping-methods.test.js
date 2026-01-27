import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import ShippingMethods from '$lib/components/checkout/shipping-methods.svelte';

describe('ShippingMethods', () => {
	afterEach(() => {
		cleanup();
	});

	const mockShippingMethods = [
		{
			sku: 'standard',
			name: 'Standard Shipping',
			description: '3-5 business days',
			price: { value: 5.99, formatted: '$5.99' }
		},
		{
			sku: 'express',
			name: 'Express Shipping',
			description: '1-2 business days',
			price: { value: 12.99, formatted: '$12.99' }
		}
	];

	it('shows loading skeleton', () => {
		const { container } = render(ShippingMethods, {
			props: {
				shippingMethods: [],
				isLoading: true
			}
		});
		const skeleton = container.querySelector('.animate-pulse');
		expect(skeleton).toBeTruthy();
	});

	it('shows message when no methods available', () => {
		const { getByText } = render(ShippingMethods, {
			props: {
				shippingMethods: [],
				isLoading: false
			}
		});
		expect(getByText(/Complete.*shipping.*form/i)).toBeTruthy();
	});

	it('renders list of shipping methods', () => {
		const { getByText } = render(ShippingMethods, {
			props: {
				shippingMethods: mockShippingMethods
			}
		});
		expect(getByText(/3-5 business days/i)).toBeTruthy();
		expect(getByText(/1-2 business days/i)).toBeTruthy();
	});

	it('renders radio inputs for methods', () => {
		const { container } = render(ShippingMethods, {
			props: {
				shippingMethods: mockShippingMethods,
				selectedShippingMethod: 'standard'
			}
		});
		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs.length).toBe(mockShippingMethods.length);
	});

	it('shows updating state', () => {
		const { container } = render(ShippingMethods, {
			props: {
				shippingMethods: mockShippingMethods,
				isUpdating: true
			}
		});
		const inputs = container.querySelectorAll('input[type="radio"]');
		inputs.forEach((input) => {
			expect(input.disabled).toBe(true);
		});
	});

	it('calls onSelect when a shipping method is selected', async () => {
		const handleSelect = vi.fn();
		const { container } = render(ShippingMethods, {
			props: {
				shippingMethods: mockShippingMethods,
				onSelect: handleSelect
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		await fireEvent.click(radioInputs[1]);

		expect(handleSelect).toHaveBeenCalledWith('express');
	});

	it('handles selectedShippingMethod as object with sku property', () => {
		const { container } = render(ShippingMethods, {
			props: {
				shippingMethods: mockShippingMethods,
				selectedShippingMethod: { sku: 'express' }
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs[1].checked).toBe(true);
	});

	it('displays shipping prices correctly', () => {
		const { getByText } = render(ShippingMethods, {
			props: {
				shippingMethods: mockShippingMethods
			}
		});

		expect(getByText('$5.99')).toBeTruthy();
		expect(getByText('$12.99')).toBeTruthy();
	});
});
