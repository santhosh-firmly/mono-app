import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import PaymentCvvConfirmation from '$lib/components/checkout/payment-cvv-confirmation.svelte';
import { createRawSnippet } from 'svelte';

describe('PaymentCvvConfirmation', () => {
	afterEach(() => {
		cleanup();
	});

	const mockCard = {
		id: 1,
		brand: 'Visa',
		first4: '4111',
		last4: '1234'
	};

	const mockSubmitButton = createRawSnippet(() => ({
		render: () => '<button type="button" data-testid="submit-button">Submit</button>'
	}));

	it('renders card information', () => {
		const { getByText } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				submitButton: mockSubmitButton
			}
		});
		expect(getByText(/Visa/)).toBeTruthy();
		expect(getByText(/1234/)).toBeTruthy();
	});

	it('renders CVV input field', () => {
		const { container } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				submitButton: mockSubmitButton
			}
		});
		const input = container.querySelector('input[placeholder="CVV"]');
		expect(input).toBeTruthy();
	});

	it('renders submit button snippet', () => {
		const { getByTestId } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				submitButton: mockSubmitButton
			}
		});
		expect(getByTestId('submit-button')).toBeTruthy();
	});

	it('displays CVV value when provided', () => {
		const { container } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				value: '123',
				submitButton: mockSubmitButton
			}
		});
		const input = container.querySelector('input[placeholder="CVV"]');
		expect(input.value).toBe('123');
	});

	it('displays error message when provided', () => {
		const { container } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				error: 'Invalid CVV',
				submitButton: mockSubmitButton
			}
		});
		const input = container.querySelector('input[placeholder="CVV"]');
		expect(input).toBeTruthy();
	});

	it('disables input when loading', () => {
		const { container } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				value: '123',
				loading: true,
				submitButton: mockSubmitButton
			}
		});
		const input = container.querySelector('input[placeholder="CVV"]');
		expect(input.disabled).toBe(true);
	});

	it('shows cancel/change card link', () => {
		const { getByText } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				submitButton: mockSubmitButton
			}
		});
		expect(getByText(/different card/i)).toBeTruthy();
	});

	it('calls onCancel when cancel link is clicked', async () => {
		const onCancel = vi.fn();
		const { getByText } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				onCancel,
				submitButton: mockSubmitButton
			}
		});
		const cancelButton = getByText(/different card/i);
		await fireEvent.click(cancelButton);
		expect(onCancel).toHaveBeenCalled();
	});

	it('calls onCvvChange when CVV input value changes', async () => {
		const onCvvChange = vi.fn();
		const { container } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				onCvvChange,
				submitButton: mockSubmitButton
			}
		});
		const input = container.querySelector('input[placeholder="CVV"]');
		await fireEvent.input(input, { target: { value: '456' } });
		expect(onCvvChange).toHaveBeenCalledWith('456');
	});

	it('disables cancel button when loading', () => {
		const { getByText } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				value: '123',
				loading: true,
				submitButton: mockSubmitButton
			}
		});
		const cancelButton = getByText(/different card/i);
		expect(cancelButton.disabled).toBe(true);
	});

	it('renders with 4-digit CVV support', () => {
		const { container } = render(PaymentCvvConfirmation, {
			props: {
				card: mockCard,
				value: '1234',
				submitButton: mockSubmitButton
			}
		});
		const input = container.querySelector('input[placeholder="CVV"]');
		expect(input.value).toBe('1234');
		expect(input.getAttribute('maxlength')).toBe('4');
	});
});
