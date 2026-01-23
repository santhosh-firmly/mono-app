import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ShippingAddressCollapsed from '$lib/components/checkout/shipping-address-collapsed.svelte';

describe('ShippingAddressCollapsed', () => {
	afterEach(() => {
		cleanup();
	});

	const mockAddress = {
		first_name: 'John',
		last_name: 'Smith',
		address1: '123 Main Street',
		address2: 'Apt 4B',
		city: 'Seattle',
		state_or_province: 'WA',
		postal_code: '98101',
		phone: '2065550123',
		email: 'john.smith@example.com'
	};

	it('renders full name', () => {
		const { getByText } = render(ShippingAddressCollapsed, {
			props: { address: mockAddress }
		});
		expect(getByText('John Smith')).toBeTruthy();
	});

	it('renders address line', () => {
		const { container } = render(ShippingAddressCollapsed, {
			props: { address: mockAddress }
		});
		expect(container.textContent).toContain('123 Main Street');
		expect(container.textContent).toContain('Seattle');
		expect(container.textContent).toContain('WA');
		expect(container.textContent).toContain('98101');
	});

	it('renders formatted phone number', () => {
		const { container } = render(ShippingAddressCollapsed, {
			props: { address: mockAddress }
		});
		// Phone should be formatted as (206) 555-0123
		expect(container.textContent).toContain('(206) 555-0123');
	});

	it('does not show email by default', () => {
		const { container } = render(ShippingAddressCollapsed, {
			props: { address: mockAddress }
		});
		expect(container.textContent).not.toContain('john.smith@example.com');
	});

	it('shows email when showEmail is true', () => {
		const { getByText } = render(ShippingAddressCollapsed, {
			props: { address: mockAddress, showEmail: true }
		});
		expect(getByText('john.smith@example.com')).toBeTruthy();
	});

	it('handles address without phone', () => {
		const addressNoPhone = { ...mockAddress, phone: undefined };
		const { container } = render(ShippingAddressCollapsed, {
			props: { address: addressNoPhone }
		});
		expect(container.textContent).toContain('John Smith');
		expect(container.textContent).not.toContain('(206)');
	});

	it('handles address without address2', () => {
		const addressNoLine2 = { ...mockAddress, address2: undefined };
		const { container } = render(ShippingAddressCollapsed, {
			props: { address: addressNoLine2 }
		});
		expect(container.textContent).toContain('123 Main Street');
		expect(container.textContent).not.toContain('Apt 4B');
	});
});
