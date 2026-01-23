import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ShippingAddressList from '$lib/components/checkout/shipping-address-list.svelte';

describe('ShippingAddressList', () => {
	afterEach(() => {
		cleanup();
	});

	const mockAddresses = [
		{
			id: 1,
			first_name: 'John',
			last_name: 'Smith',
			phone: '2065550123',
			address1: '123 Main Street',
			city: 'Seattle',
			state_or_province: 'WA',
			postal_code: '98101'
		},
		{
			id: 2,
			first_name: 'Sarah',
			last_name: 'Johnson',
			phone: '5035551234',
			address1: '456 Park Avenue',
			city: 'Portland',
			state_or_province: 'OR',
			postal_code: '97201'
		}
	];

	it('shows add new address button when list is empty', () => {
		const { getByText } = render(ShippingAddressList, {
			props: {
				addresses: []
			}
		});
		expect(getByText(/add.*address/i)).toBeTruthy();
	});

	it('renders list of addresses', () => {
		const { getAllByText } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses
			}
		});
		const johnElements = getAllByText(/John/i);
		const sarahElements = getAllByText(/Sarah/i);
		expect(johnElements.length).toBeGreaterThan(0);
		expect(sarahElements.length).toBeGreaterThan(0);
	});

	it('highlights selected address', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				selectedAddress: mockAddresses[0]
			}
		});
		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs.length).toBe(mockAddresses.length);
	});

	it('disables selection when disabled prop is true', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				disabled: true
			}
		});
		const radioInputs = container.querySelectorAll('input[type="radio"]');
		radioInputs.forEach((input) => {
			expect(input.disabled).toBe(true);
		});
	});

	it('shows add new address button with existing addresses', () => {
		const { getByText } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses
			}
		});
		expect(getByText(/add.*address/i)).toBeTruthy();
	});

	it('calls onSelect when an address is clicked', async () => {
		const user = userEvent.setup();
		const handleSelect = vi.fn();

		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				onSelect: handleSelect
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		await user.click(radioInputs[0]);

		expect(handleSelect).toHaveBeenCalledWith(mockAddresses[0]);
	});

	it('calls onAddNewAddress when add button is clicked', async () => {
		const user = userEvent.setup();
		const handleAddNew = vi.fn();

		const { getByText } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				onAddNewAddress: handleAddNew
			}
		});

		await user.click(getByText(/add.*address/i));

		expect(handleAddNew).toHaveBeenCalledTimes(1);
	});

	it('shows selected radio for matching address', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				selectedAddress: mockAddresses[1]
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs[1].checked).toBe(true);
	});

	it('displays address2 when present', () => {
		const addressWithAddress2 = [
			{
				...mockAddresses[0],
				address2: 'Apt 4B'
			}
		];

		const { getByText } = render(ShippingAddressList, {
			props: {
				addresses: addressWithAddress2
			}
		});

		expect(getByText(/Apt 4B/)).toBeInTheDocument();
	});

	it('formats phone number with mask', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses
			}
		});

		// Phone should be formatted as (206) 555-0123
		expect(container.textContent).toContain('(206) 555-0123');
	});

	it('disables add new address button when disabled', () => {
		const { getByText } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				disabled: true
			}
		});

		const addButton = getByText(/add.*address/i);
		expect(addButton).toHaveClass('cursor-not-allowed');
	});

	it('displays email when present in address', () => {
		const addressWithEmail = [
			{
				...mockAddresses[0],
				email: 'john@example.com'
			}
		];

		const { getByText } = render(ShippingAddressList, {
			props: {
				addresses: addressWithEmail
			}
		});

		expect(getByText('john@example.com')).toBeInTheDocument();
	});

	it('correctly identifies non-selected address', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				selectedAddress: mockAddresses[0]
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs[0].checked).toBe(true);
		expect(radioInputs[1].checked).toBe(false);
	});

	it('does not display address2 when empty', () => {
		const addressWithoutAddress2 = [
			{
				...mockAddresses[0],
				address2: ''
			}
		];

		const { container } = render(ShippingAddressList, {
			props: {
				addresses: addressWithoutAddress2
			}
		});

		expect(container.textContent).not.toContain('  ·');
	});

	it('does not display address2 when null', () => {
		const addressWithNullAddress2 = [
			{
				...mockAddresses[0],
				address2: null
			}
		];

		const { container } = render(ShippingAddressList, {
			props: {
				addresses: addressWithNullAddress2
			}
		});

		expect(container.textContent).toContain('123 Main Street');
	});

	it('does not display address2 when undefined', () => {
		const addressWithUndefinedAddress2 = [
			{
				id: 1,
				first_name: 'John',
				last_name: 'Smith',
				phone: '2065550123',
				address1: '123 Main Street',
				city: 'Seattle',
				state_or_province: 'WA',
				postal_code: '98101'
			}
		];

		const { container } = render(ShippingAddressList, {
			props: {
				addresses: addressWithUndefinedAddress2
			}
		});

		expect(container.textContent).toContain('123 Main Street');
	});

	it('no address is selected when selectedAddress is null', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				selectedAddress: null
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs[0].checked).toBe(false);
		expect(radioInputs[1].checked).toBe(false);
	});

	it('no address is selected when selectedAddress is undefined', () => {
		const { container } = render(ShippingAddressList, {
			props: {
				addresses: mockAddresses,
				selectedAddress: undefined
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		expect(radioInputs[0].checked).toBe(false);
		expect(radioInputs[1].checked).toBe(false);
	});
});
