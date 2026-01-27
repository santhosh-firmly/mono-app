import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Purchase from '$lib/components/checkout/purchase.svelte';

describe('Purchase', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders place order button with total price', () => {
		const { getByText } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				disabled: false,
				onSubmit: vi.fn()
			}
		});

		expect(getByText(/Place order/i)).toBeInTheDocument();
		expect(getByText(/\$99\.99/)).toBeInTheDocument();
	});

	it('calls onSubmit when button is clicked', async () => {
		const handleSubmit = vi.fn();
		const user = userEvent.setup();

		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				disabled: false,
				onSubmit: handleSubmit
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(handleSubmit).toHaveBeenCalledTimes(1);
	});

	it('disables button when disabled prop is true', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				disabled: true,
				onSubmit: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toBeDisabled();
	});

	it('disables button when loading', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				loading: true,
				onSubmit: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toBeDisabled();
	});

	it('shows spinner when loading', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				loading: true,
				onSubmit: vi.fn()
			}
		});

		const spinner = container.querySelector('svg.animate-spin');
		expect(spinner).toBeInTheDocument();
	});

	it('displays encryption message when not success', () => {
		const { getByText } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				disabled: false,
				onSubmit: vi.fn()
			}
		});

		expect(getByText(/encrypted/i)).toBeInTheDocument();
	});

	it('hides encryption message when success', () => {
		const { queryByText } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				success: true,
				onSubmit: vi.fn()
			}
		});

		expect(queryByText(/encrypted/i)).not.toBeInTheDocument();
	});

	it('renders custom button text when provided', () => {
		const { getByText } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				buttonText: 'Complete Purchase',
				onSubmit: vi.fn()
			}
		});

		expect(getByText(/Complete Purchase/)).toBeInTheDocument();
	});

	it('renders without total price when undefined', () => {
		const { getByText, container } = render(Purchase, {
			props: {
				onSubmit: vi.fn()
			}
		});

		expect(getByText(/Place order/i)).toBeInTheDocument();
		expect(container.textContent).not.toContain('$');
	});

	it('shows success animation when success is true', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				success: true,
				onSubmit: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).not.toBeInTheDocument();
	});

	it('handles click without onSubmit callback', async () => {
		const user = userEvent.setup();

		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99
			}
		});

		const button = container.querySelector('button');
		await user.click(button);
		expect(button).toBeInTheDocument();
	});

	it('applies disabled styles when disabled', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				disabled: true,
				onSubmit: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveClass('cursor-not-allowed');
		expect(button).toHaveClass('bg-black/40');
	});

	it('applies loading styles when loading', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				loading: true,
				onSubmit: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveClass('w-14');
		expect(button).toHaveClass('rounded-full');
	});

	it('applies full width when not loading', () => {
		const { container } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				loading: false,
				onSubmit: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveClass('w-full');
	});

	it('displays error message when error prop is provided', () => {
		const { getByText } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				error: 'Credit card declined',
				onSubmit: vi.fn()
			}
		});

		expect(getByText('Credit card declined')).toBeInTheDocument();
	});

	it('does not display error message when error prop is empty', () => {
		const { queryByText } = render(Purchase, {
			props: {
				totalPrice: 99.99,
				error: '',
				onSubmit: vi.fn()
			}
		});

		expect(queryByText('Credit card declined')).not.toBeInTheDocument();
	});
});
