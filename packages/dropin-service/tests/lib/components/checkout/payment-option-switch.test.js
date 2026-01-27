import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import PaymentOptionSwitch from '$lib/components/checkout/payment-option-switch.svelte';

describe('PaymentOptionSwitch', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders payment tabs', () => {
		const { getAllByRole } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {}
			}
		});
		const buttons = getAllByRole('button');
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('shows card payment form by default', () => {
		const { getAllByRole } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {}
			}
		});
		const buttons = getAllByRole('button');
		expect(buttons.length).toBe(2);
	});

	it('renders payment method options', () => {
		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {}
			}
		});
		expect(getByText(/Card/)).toBeTruthy();
		expect(getByText(/PayPal/)).toBeTruthy();
	});

	it('calls onMethodChange when card option is clicked', async () => {
		const user = userEvent.setup();
		const onMethodChange = vi.fn();

		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				onMethodChange
			}
		});

		const cardButton = getByText('Card').closest('button');
		await user.click(cardButton);

		expect(onMethodChange).toHaveBeenCalledWith('card');
	});

	it('calls onMethodChange when paypal option is clicked', async () => {
		const user = userEvent.setup();
		const onMethodChange = vi.fn();

		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				onMethodChange
			}
		});

		const paypalButton = getByText('PayPal').closest('button');
		await user.click(paypalButton);

		expect(onMethodChange).toHaveBeenCalledWith('paypal');
	});

	it('highlights selected card option', () => {
		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				selectedMethod: 'card'
			}
		});

		const cardButton = getByText('Card').closest('button');
		expect(cardButton).toHaveClass('border-primary');
	});

	it('highlights selected paypal option', () => {
		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				selectedMethod: 'paypal'
			}
		});

		const paypalButton = getByText('PayPal').closest('button');
		expect(paypalButton).toHaveClass('border-primary');
	});

	it('hides PayPal option when showPaypal is false', () => {
		const { queryByText, getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				showPaypal: false
			}
		});

		expect(getByText('Card')).toBeInTheDocument();
		expect(queryByText('PayPal')).not.toBeInTheDocument();
	});

	it('shows only one button when showPaypal is false', () => {
		const { getAllByRole } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				showPaypal: false
			}
		});

		const buttons = getAllByRole('button');
		expect(buttons.length).toBe(1);
	});

	it('switches content when method changes', async () => {
		const user = userEvent.setup();

		const { getByText, container } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				selectedMethod: 'card'
			}
		});

		const paypalButton = getByText('PayPal').closest('button');
		await user.click(paypalButton);

		expect(container).toBeInTheDocument();
	});

	it('applies non-selected styling to inactive option', () => {
		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				selectedMethod: 'card'
			}
		});

		const paypalButton = getByText('PayPal').closest('button');
		expect(paypalButton).toHaveClass('border-gray-300');
	});

	it('removes non-selected styling from selected option', () => {
		const { getByText } = render(PaymentOptionSwitch, {
			props: {
				card: () => {},
				paypal: () => {},
				selectedMethod: 'card'
			}
		});

		const cardButton = getByText('Card').closest('button');
		expect(cardButton).not.toHaveClass('border-gray-300');
	});
});
