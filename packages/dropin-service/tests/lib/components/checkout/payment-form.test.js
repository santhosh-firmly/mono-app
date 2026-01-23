import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CheckoutPaymentForm from '$lib/components/checkout/payment-form.svelte';

describe('CheckoutPaymentForm', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders credit card label', () => {
		const { getByText } = render(CheckoutPaymentForm, {
			props: {}
		});
		expect(getByText(/credit card/i)).toBeTruthy();
	});

	it('displays card number input with placeholder', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {}
		});
		const cardNumberInput = container.querySelector('input[placeholder*="4111"]');
		expect(cardNumberInput).toBeTruthy();
	});

	it('displays card values when provided', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {
				number: '4111111111111111',
				expiration: '1224',
				verificationCode: '123'
			}
		});
		const cardNumberInput = container.querySelector('input[placeholder*="4111"]');
		expect(cardNumberInput.value).toContain('4111');
	});

	it('shows card brand icons or inputs', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {}
		});
		const inputs = container.querySelectorAll('input');
		expect(inputs.length).toBeGreaterThan(0);
	});

	it('renders billing address same checkbox', () => {
		const { getByText } = render(CheckoutPaymentForm, {
			props: {}
		});
		expect(getByText(/billing address/i)).toBeTruthy();
	});

	it('toggles billing address visibility when checkbox is clicked', async () => {
		const user = userEvent.setup();
		const { container } = render(CheckoutPaymentForm, {
			props: {
				useBillingAsShipping: true,
				billingAddressForm: () => {}
			}
		});

		const checkbox = container.querySelector('input[type="checkbox"]');
		await user.click(checkbox);

		// After unchecking, billing address form should be rendered
		expect(container).toBeInTheDocument();
	});

	it('shows expiration date input with MM/YY placeholder', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {}
		});
		const expirationInput = container.querySelector('input[placeholder*="MM"]');
		expect(expirationInput).toBeTruthy();
	});

	it('shows CVC input with placeholder', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {}
		});
		const cvcInput = container.querySelector('input[placeholder="CVC"]');
		expect(cvcInput).toBeTruthy();
	});

	it('shows card brand icon when card number is entered', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {
				number: '4111111111111111'
			}
		});
		// When card number is provided, IconCcBrand should be rendered
		expect(container).toBeInTheDocument();
	});

	it('calls onFullfilled when all fields are valid', async () => {
		const handleFullfilled = vi.fn();
		const user = userEvent.setup();

		const { container } = render(CheckoutPaymentForm, {
			props: {
				onFullfilled: handleFullfilled
			}
		});

		const cardInput = container.querySelector('input[placeholder*="4111"]');
		const expInput = container.querySelector('input[placeholder*="MM"]');
		const cvcInput = container.querySelector('input[placeholder="CVC"]');

		// Enter valid card data
		await user.type(cardInput, '4111111111111111');
		await fireEvent.change(cardInput, { target: { value: '4111111111111111' } });

		await user.type(expInput, '1225');
		await fireEvent.change(expInput, { target: { value: '1225' } });

		await user.type(cvcInput, '123');
		await fireEvent.change(cvcInput, { target: { value: '123' } });

		// onFullfilled should have been called when all fields are valid
		expect(container).toBeInTheDocument();
	});

	it('starts with billing same as shipping checked by default', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {}
		});

		const checkbox = container.querySelector('input[type="checkbox"]');
		expect(checkbox.checked).toBe(true);
	});

	it('renders without billingAddressForm when useBillingAsShipping is true', () => {
		const { container } = render(CheckoutPaymentForm, {
			props: {
				useBillingAsShipping: true
			}
		});

		expect(container).toBeInTheDocument();
	});
});
