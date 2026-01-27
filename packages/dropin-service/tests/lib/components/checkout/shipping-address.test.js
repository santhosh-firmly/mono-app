import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import ShippingAddress from '$lib/components/checkout/shipping-address.svelte';
import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

describe('ShippingAddress', () => {
	afterEach(() => {
		cleanup();
	});

	const mockFilledAddress = {
		first_name: 'John',
		last_name: 'Smith',
		address1: '123 Main Street',
		city: 'Seattle',
		state_or_province: 'WA',
		postal_code: '98101',
		phone: '2065550123'
	};

	const mockSavedAddresses = [
		{
			id: 1,
			first_name: 'John',
			last_name: 'Doe',
			phone: '5551234567',
			address1: '123 Main St',
			city: 'San Francisco',
			state_or_province: 'CA',
			postal_code: '94102',
			email: 'john@example.com'
		}
	];

	describe('Form Mode', () => {
		it('renders address form by default', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm()
				}
			});
			const addressInput = container.querySelector('input[autocomplete*="address"]');
			expect(addressInput).toBeTruthy();
		});
	});

	describe('List Mode', () => {
		it('renders saved addresses list', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: mockSavedAddresses
				}
			});
			expect(container.textContent).toContain('John');
			const radioInputs = container.querySelectorAll('input[type="radio"]');
			expect(radioInputs.length).toBe(1);
		});

		it('falls back to form when no addresses', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: [],
					form: useCheckoutForm()
				}
			});
			const addressInput = container.querySelector('input[autocomplete*="address"]');
			expect(addressInput).toBeTruthy();
		});

		it('calls onSelectSavedAddress when a saved address is selected', async () => {
			const handleSelectSavedAddress = vi.fn();
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: mockSavedAddresses,
					onSelectSavedAddress: handleSelectSavedAddress
				}
			});

			const radioInput = container.querySelector('input[type="radio"]');
			await fireEvent.click(radioInput);
			expect(handleSelectSavedAddress).toHaveBeenCalled();
		});

		it('calls onAddNewAddress when add new address is clicked', async () => {
			const handleAddNewAddress = vi.fn();
			const { getByText } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: mockSavedAddresses,
					onAddNewAddress: handleAddNewAddress
				}
			});

			const addButton = getByText(/add new/i);
			await fireEvent.click(addButton);
			expect(handleAddNewAddress).toHaveBeenCalled();
		});

		it('renders with disabled state', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: mockSavedAddresses,
					disabled: true
				}
			});

			const radioInputs = container.querySelectorAll('input[type="radio"]');
			expect(radioInputs.length).toBe(1);
		});
	});

	describe('Collapsed Mode', () => {
		it('renders collapsed address view', () => {
			const { getByText } = render(ShippingAddress, {
				props: {
					mode: 'collapsed',
					selectedAddress: mockFilledAddress
				}
			});
			expect(getByText('John Smith')).toBeTruthy();
		});

		it('shows icon button in collapsed mode', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'collapsed',
					selectedAddress: mockFilledAddress
				}
			});
			const button = container.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.querySelector('svg')).toBeTruthy();
		});

		it('shows email when showEmail is true', () => {
			const addressWithEmail = { ...mockFilledAddress, email: 'john@example.com' };
			const { getByText } = render(ShippingAddress, {
				props: {
					mode: 'collapsed',
					selectedAddress: addressWithEmail,
					showEmail: true
				}
			});
			expect(getByText('john@example.com')).toBeTruthy();
		});

		it('calls onExpand when icon button is clicked', async () => {
			const handleExpand = vi.fn();
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'collapsed',
					selectedAddress: mockFilledAddress,
					onExpand: handleExpand
				}
			});

			const changeButton = container.querySelector('button');
			await fireEvent.click(changeButton);
			expect(handleExpand).toHaveBeenCalled();
		});
	});

	describe('default callbacks', () => {
		it('handles select saved address with default callback', async () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: mockSavedAddresses
				}
			});

			const radioInput = container.querySelector('input[type="radio"]');
			await fireEvent.click(radioInput);
		});

		it('handles add new address with default callback', async () => {
			const { getByText } = render(ShippingAddress, {
				props: {
					mode: 'list',
					savedAddresses: mockSavedAddresses
				}
			});

			const addButton = getByText(/add new/i);
			await fireEvent.click(addButton);
		});

		it('handles expand with default callback', async () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'collapsed',
					selectedAddress: mockFilledAddress
				}
			});

			const changeButton = container.querySelector('button');
			await fireEvent.click(changeButton);
		});

		it('handles input address completion with default callback', async () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm()
				}
			});

			const addressInput = container.querySelector('input[autocomplete*="address"]');
			if (addressInput) {
				await fireEvent.input(addressInput, { target: { value: '123 Main' } });
			}
		});
	});

	describe('Form Mode with props', () => {
		it('renders form with autocomplete suggestions', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm(),
					addressCompletions: [{ id: '1', value: '123 Main St' }],
					isAutocompleteLoading: false
				}
			});
			const addressInput = container.querySelector('input[autocomplete*="address"]');
			expect(addressInput).toBeTruthy();
		});

		it('renders form with external error', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm(),
					externalError: 'Address validation failed'
				}
			});
			expect(container).toBeInTheDocument();
		});

		it('renders form in manual mode', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm(),
					forceManualMode: true
				}
			});
			const addressInput = container.querySelector('input[autocomplete*="address"]');
			expect(addressInput).toBeTruthy();
		});

		it('calls onInputAddressCompletion when typing in address field', async () => {
			const handleInputAddressCompletion = vi.fn();

			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm(),
					onInputAddressCompletion: handleInputAddressCompletion
				}
			});

			const addressInput = container.querySelector('input[autocomplete*="address"]');
			if (addressInput) {
				await fireEvent.input(addressInput, { target: { value: '123 Main' } });
				expect(handleInputAddressCompletion).toHaveBeenCalled();
			}
		});

		it('renders form with autocomplete completions prop', () => {
			const addressCompletions = [
				{ id: '1', value: '123 Main St, Seattle, WA' },
				{ id: '2', value: '456 Oak Ave, Portland, OR' }
			];

			const { container } = render(ShippingAddress, {
				props: {
					mode: 'form',
					form: useCheckoutForm({ address: '123 Main' }),
					addressCompletions,
					onSelectAddressCompletion: vi.fn()
				}
			});

			expect(container).toBeInTheDocument();
		});

		it('renders form when mode is collapsed but no selectedAddress', () => {
			const { container } = render(ShippingAddress, {
				props: {
					mode: 'collapsed',
					selectedAddress: null,
					form: useCheckoutForm()
				}
			});
			const addressInput = container.querySelector('input[autocomplete*="address"]');
			expect(addressInput).toBeTruthy();
		});
	});
});
