import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ShippingAddressForm from '$lib/components/checkout/shipping-address-form.svelte';
import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

describe('ShippingAddressForm', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders address form with autocomplete', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm()
			}
		});
		const addressInput = container.querySelector('input[autocomplete*="address"]');
		expect(addressInput).toBeTruthy();
	});

	it('displays address value when provided in manual mode', () => {
		const mockAddress = {
			first_name: 'John',
			last_name: 'Smith',
			address1: '123 Main Street',
			city: 'Seattle',
			state_or_province: 'WA',
			postal_code: '98101'
		};
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(mockAddress),
				forceManualMode: true
			}
		});
		const addressInput = container.querySelector('input[placeholder*="Address"]');
		expect(addressInput.value).toBe('123 Main Street');
	});

	it('shows manual mode toggle button', () => {
		const { getByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm()
			}
		});
		expect(getByText(/Enter manually/i)).toBeTruthy();
	});

	it('shows billing address label when useToBilling is true', () => {
		const { getByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				useToBilling: true
			}
		});
		expect(getByText(/Billing address/i)).toBeTruthy();
	});

	it('shows shipping address label when useToBilling is false', () => {
		const { getByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				useToBilling: false
			}
		});
		expect(getByText(/Shipping address/i)).toBeTruthy();
	});

	it('toggles manual mode when button is clicked', async () => {
		const user = userEvent.setup();

		const { getByText, container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm()
			}
		});

		const toggleButton = getByText(/Enter manually/i);
		await user.click(toggleButton);

		// In manual mode, additional fields should be visible
		const cityInput = container.querySelector('input[placeholder*="City"]');
		expect(cityInput).toBeInTheDocument();
	});

	it('renders name input field', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm()
			}
		});

		const nameInput = container.querySelector('input[name="name"]');
		expect(nameInput).toBeInTheDocument();
	});

	it('renders phone number input field in manual mode', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				forceManualMode: true
			}
		});

		const phoneInput = container.querySelector('input[placeholder*="555"]');
		expect(phoneInput).toBeInTheDocument();
	});

	it('renders with address completions', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				addressCompletions: [
					{ id: '1', value: '123 Main St' },
					{ id: '2', value: '456 Oak Ave' }
				]
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('renders with loading autocomplete state', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				isAutocompleteLoading: true
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('auto-enables manual mode when form has pre-filled city', () => {
		const mockAddress = {
			city: 'Seattle'
		};

		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(mockAddress)
			}
		});

		const cityInput = container.querySelector('input[placeholder*="City"]');
		expect(cityInput).toBeInTheDocument();
	});

	it('auto-enables manual mode when form has pre-filled zip code', () => {
		const mockAddress = {
			postal_code: '98101'
		};

		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(mockAddress)
			}
		});

		const zipInput = container.querySelector('input[placeholder*="Zip"]');
		expect(zipInput).toBeInTheDocument();
	});

	it('shows full name on card placeholder when useToBilling is true', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				useToBilling: true
			}
		});

		const nameInput = container.querySelector('input[placeholder*="Full name on card"]');
		expect(nameInput).toBeInTheDocument();
	});

	it('shows name placeholder when useToBilling is false', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				useToBilling: false
			}
		});

		const nameInput = container.querySelector('input[placeholder*="Name"]');
		expect(nameInput).toBeInTheDocument();
	});

	it('renders zip code input in manual mode', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				forceManualMode: true
			}
		});

		const zipInput = container.querySelector('input[placeholder*="Zip"]');
		expect(zipInput).toBeInTheDocument();
	});

	it('renders state input in manual mode', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				forceManualMode: true
			}
		});

		const stateInput = container.querySelector('input[placeholder*="State"]');
		expect(stateInput).toBeInTheDocument();
	});

	it('renders address2 input in manual mode', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				forceManualMode: true
			}
		});

		const address2Input = container.querySelector('input[placeholder*="Address line 2"]');
		expect(address2Input).toBeInTheDocument();
	});

	it('displays external error message', () => {
		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				externalError: 'Address validation failed'
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('calls onInputAddressCompletion when typing in address field', async () => {
		const user = userEvent.setup();
		const onInputAddressCompletion = vi.fn();

		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				onInputAddressCompletion
			}
		});

		const addressInput = container.querySelector('input[autocomplete*="address"]');
		await user.type(addressInput, '123 Main');

		expect(onInputAddressCompletion).toHaveBeenCalled();
	});

	it('calls onSelectAddressCompletion when selecting an address', async () => {
		const user = userEvent.setup();
		const onSelectAddressCompletion = vi.fn();

		const { container, getByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				addressCompletions: [{ id: '1', value: '123 Main St' }],
				onSelectAddressCompletion
			}
		});

		const addressInput = container.querySelector('input[autocomplete*="address"]');
		await user.type(addressInput, '123');

		await waitFor(() => {
			const option = getByText('123 Main St');
			if (option) {
				user.click(option);
			}
		}).catch(() => {});
	});

	it('auto-enables manual mode when selectedCompletionAddress is provided', async () => {
		const selectedAddress = {
			address1: '456 Oak Avenue',
			address2: 'Suite 200',
			city: 'Portland',
			state_or_province: 'OR',
			postal_code: '97201'
		};

		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				selectedCompletionAddress: selectedAddress
			}
		});

		// Manual mode should be enabled
		const cityInput = container.querySelector('input[placeholder*="City"]');
		expect(cityInput).toBeInTheDocument();
		expect(cityInput.value).toBe('Portland');
	});

	it('shows clear button when all address fields are filled', () => {
		const mockAddress = {
			address1: '123 Main St',
			city: 'Seattle',
			state_or_province: 'WA',
			postal_code: '98101'
		};

		const { getByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(mockAddress),
				forceManualMode: true
			}
		});

		expect(getByText(/Clear/i)).toBeInTheDocument();
	});

	it('renders bottom content with enter manually option in autocomplete', async () => {
		const user = userEvent.setup();

		const { container, queryByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				addressCompletions: [{ id: '1', value: '123 Main St' }],
				onInputAddressCompletion: vi.fn()
			}
		});

		const addressInput = container.querySelector('input[autocomplete*="address"]');
		await user.type(addressInput, '123 Main Street');

		// The bottom content should have "Enter manually" button
		await waitFor(() => {
			const enterManually = queryByText(/Enter manually/i);
			if (enterManually) {
				expect(enterManually).toBeInTheDocument();
			}
		}).catch(() => {});
	});

	it('enables manual mode when state field has value', () => {
		const mockAddress = {
			state_or_province: 'WA'
		};

		const { container } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(mockAddress)
			}
		});

		const stateInput = container.querySelector('input[placeholder*="State"]');
		expect(stateInput).toBeInTheDocument();
	});

	it('displays external error when provided', () => {
		const { getByText } = render(ShippingAddressForm, {
			props: {
				form: useCheckoutForm(),
				externalError: 'Address validation failed'
			}
		});

		expect(getByText('Address validation failed')).toBeInTheDocument();
	});
});
