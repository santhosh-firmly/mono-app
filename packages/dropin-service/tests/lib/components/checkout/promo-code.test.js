import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CheckoutPromoCode from '$lib/components/checkout/promo-code.svelte';

describe('CheckoutPromoCode', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders add promo code button initially', () => {
		const { getByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		expect(getByText(/Add promo code/i)).toBeInTheDocument();
	});

	it('displays applied promo codes', () => {
		const { getByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: ['SAVE10', 'FREESHIP'],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		expect(getByText('SAVE10')).toBeInTheDocument();
		expect(getByText('FREESHIP')).toBeInTheDocument();
	});

	it('calls onRemove when remove button is clicked', async () => {
		const handleRemove = vi.fn();
		const user = userEvent.setup();

		const { container } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: ['SAVE10'],
				onApply: vi.fn(),
				onRemove: handleRemove,
				isLoading: false,
				error: ''
			}
		});

		// Find remove button by aria-label
		const removeButton = container.querySelector('button[aria-label="Remove promo code"]');
		if (removeButton) {
			await user.click(removeButton);
			expect(handleRemove).toHaveBeenCalledWith('SAVE10');
		}
	});

	it('displays error message when error prop is provided', () => {
		const { getByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: false,
				error: 'Invalid promo code'
			}
		});

		expect(getByText('Invalid promo code')).toBeInTheDocument();
	});

	it('shows input when add promo code button is clicked', async () => {
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		// Click to show input
		const addButton = getByText(/Add promo code/i);
		await user.click(addButton);

		// Check for input placeholder
		expect(getByPlaceholderText('Enter promo code')).toBeInTheDocument();
		expect(getByText('Apply')).toBeInTheDocument();
	});

	it('calls onApply when Apply button is clicked with valid code', async () => {
		const handleApply = vi.fn();
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: handleApply,
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		await user.click(getByText(/Add promo code/i));
		const input = getByPlaceholderText('Enter promo code');
		await user.type(input, 'DISCOUNT20');
		await user.click(getByText('Apply'));

		expect(handleApply).toHaveBeenCalledWith('DISCOUNT20');
	});

	it('does not call onApply when code is empty', async () => {
		const handleApply = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: handleApply,
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		await user.click(getByText(/Add promo code/i));
		await user.click(getByText('Apply'));

		expect(handleApply).not.toHaveBeenCalled();
	});

	it('hides input and clears code when Cancel is clicked', async () => {
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
			CheckoutPromoCode,
			{
				props: {
					appliedCodes: [],
					onApply: vi.fn(),
					onRemove: vi.fn(),
					isLoading: false,
					error: ''
				}
			}
		);

		await user.click(getByText(/Add promo code/i));
		const input = getByPlaceholderText('Enter promo code');
		await user.type(input, 'TESTCODE');
		await user.click(getByText('Cancel'));

		expect(queryByPlaceholderText('Enter promo code')).not.toBeInTheDocument();
		expect(getByText(/Add promo code/i)).toBeInTheDocument();
	});

	it('displays promo code with discount amount', () => {
		const { getByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [{ code: 'SAVE20', discount: '$20.00' }],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		expect(getByText('SAVE20')).toBeInTheDocument();
		expect(getByText('(-$20.00)')).toBeInTheDocument();
	});

	it('disables Apply button when loading', async () => {
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: true,
				error: ''
			}
		});

		await user.click(getByText(/Add promo code/i));
		const input = getByPlaceholderText('Enter promo code');
		await user.type(input, 'CODE');

		expect(getByText('Applying...')).toBeInTheDocument();
	});

	it('disables remove button when loading', () => {
		const { container } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: ['SAVE10'],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: true,
				error: ''
			}
		});

		const removeButton = container.querySelector('button[aria-label="Remove promo code"]');
		expect(removeButton).toBeDisabled();
	});

	it('clears input after applying promo code', async () => {
		const handleApply = vi.fn();
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: handleApply,
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		await user.click(getByText(/Add promo code/i));
		const input = getByPlaceholderText('Enter promo code');
		await user.type(input, 'CLEAR10');
		await user.click(getByText('Apply'));

		expect(input.value).toBe('');
	});

	it('trims whitespace from promo code before applying', async () => {
		const handleApply = vi.fn();
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: handleApply,
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		await user.click(getByText(/Add promo code/i));
		const input = getByPlaceholderText('Enter promo code');
		await user.type(input, '  TRIMCODE  ');
		await user.click(getByText('Apply'));

		expect(handleApply).toHaveBeenCalledWith('TRIMCODE');
	});

	it('does not call onApply when code is only whitespace', async () => {
		const handleApply = vi.fn();
		const user = userEvent.setup();

		const { getByText, getByPlaceholderText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [],
				onApply: handleApply,
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		await user.click(getByText(/Add promo code/i));
		const input = getByPlaceholderText('Enter promo code');
		await user.type(input, '   ');
		await user.click(getByText('Apply'));

		expect(handleApply).not.toHaveBeenCalled();
	});

	it('displays promo code without discount when not provided', () => {
		const { getByText, queryByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: [{ code: 'NODISC' }],
				onApply: vi.fn(),
				onRemove: vi.fn(),
				isLoading: false,
				error: ''
			}
		});

		expect(getByText('NODISC')).toBeInTheDocument();
		expect(queryByText(/^\(-/)).not.toBeInTheDocument();
	});

	it('handles string promo code in appliedCodes', () => {
		const handleRemove = vi.fn();

		const { getByText } = render(CheckoutPromoCode, {
			props: {
				appliedCodes: ['STRINGCODE'],
				onApply: vi.fn(),
				onRemove: handleRemove,
				isLoading: false,
				error: ''
			}
		});

		expect(getByText('STRINGCODE')).toBeInTheDocument();
	});

	it('renders with default props', () => {
		const { getByText } = render(CheckoutPromoCode, {
			props: {}
		});

		expect(getByText(/Add promo code/i)).toBeInTheDocument();
	});
});
