import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import LineItem from '$lib/components/checkout/line-item.svelte';

describe('LineItem', () => {
	afterEach(() => {
		cleanup();
	});

	const defaultProps = {
		id: 'item-1',
		name: 'Test Product',
		description: 'Size: Medium',
		imageUrl: 'https://example.com/image.jpg',
		quantity: 2,
		price: { value: 25.99, symbol: '$' },
		onQuantityChange: vi.fn(),
		onRemove: vi.fn()
	};

	it('renders product name', () => {
		const { getByText } = render(LineItem, { props: defaultProps });

		expect(getByText('Test Product')).toBeInTheDocument();
	});

	it('renders product description', () => {
		const { getByText } = render(LineItem, { props: defaultProps });

		expect(getByText('Size: Medium')).toBeInTheDocument();
	});

	it('renders unit price', () => {
		const { getByText } = render(LineItem, { props: defaultProps });

		expect(getByText('$25.99 each')).toBeInTheDocument();
	});

	it('renders calculated line price', () => {
		const { getByText } = render(LineItem, { props: defaultProps });

		expect(getByText('$51.98')).toBeInTheDocument();
	});

	it('renders formatted line price when provided', () => {
		const { getByText } = render(LineItem, {
			props: {
				...defaultProps,
				linePrice: { formatted: '$50.00' }
			}
		});

		expect(getByText('$50.00')).toBeInTheDocument();
	});

	it('renders quantity', () => {
		const { getByText } = render(LineItem, { props: defaultProps });

		expect(getByText('2')).toBeInTheDocument();
	});

	it('calls onQuantityChange when increment is clicked', async () => {
		const handleQuantityChange = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				onQuantityChange: handleQuantityChange
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		await user.click(incrementButton);

		expect(handleQuantityChange).toHaveBeenCalledWith('item-1', 3);
	});

	it('calls onQuantityChange when decrement is clicked', async () => {
		const handleQuantityChange = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				onQuantityChange: handleQuantityChange
			}
		});

		const decrementButton = getByLabelText('Decrease quantity');
		await user.click(decrementButton);

		expect(handleQuantityChange).toHaveBeenCalledWith('item-1', 1);
	});

	it('disables decrement at minimum quantity', () => {
		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				quantity: 1,
				minQuantity: 1
			}
		});

		const decrementButton = getByLabelText('Decrease quantity');
		expect(decrementButton).toBeDisabled();
	});

	it('disables increment at maximum quantity', () => {
		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				quantity: 99,
				maxQuantity: 99
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		expect(incrementButton).toBeDisabled();
	});

	it('calls onRemove when remove button is clicked', async () => {
		const handleRemove = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				onRemove: handleRemove
			}
		});

		const removeButton = getByLabelText('Remove item');
		await user.click(removeButton);

		expect(handleRemove).toHaveBeenCalledWith('item-1');
	});

	it('renders with reduced opacity when removing', () => {
		const { container } = render(LineItem, {
			props: {
				...defaultProps,
				isRemoving: true
			}
		});

		const lineItemDiv = container.querySelector('.opacity-50');
		expect(lineItemDiv).toBeInTheDocument();
	});

	it('disables buttons when loading', () => {
		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				isLoading: true
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		const decrementButton = getByLabelText('Decrease quantity');
		const removeButton = getByLabelText('Remove item');

		expect(incrementButton).toBeDisabled();
		expect(decrementButton).toBeDisabled();
		expect(removeButton).toBeDisabled();
	});

	it('renders placeholder when no image provided', () => {
		const { container } = render(LineItem, {
			props: {
				...defaultProps,
				imageUrl: ''
			}
		});

		const placeholderIcon = container.querySelector('.text-gray-400');
		expect(placeholderIcon).toBeInTheDocument();
	});

	it('renders image when imageUrl provided', () => {
		const { container } = render(LineItem, { props: defaultProps });

		const image = container.querySelector('img');
		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute('alt', 'Test Product');
	});

	it('uses custom minQuantity', () => {
		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				quantity: 5,
				minQuantity: 5
			}
		});

		const decrementButton = getByLabelText('Decrease quantity');
		expect(decrementButton).toBeDisabled();
	});

	it('uses custom maxQuantity', () => {
		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				quantity: 10,
				maxQuantity: 10
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		expect(incrementButton).toBeDisabled();
	});

	it('does not render description when not provided', () => {
		const { queryByText } = render(LineItem, {
			props: {
				...defaultProps,
				description: ''
			}
		});

		expect(queryByText('Size: Medium')).not.toBeInTheDocument();
	});

	it('renders with formatted unit price when provided', () => {
		const { getByText } = render(LineItem, {
			props: {
				...defaultProps,
				price: { value: 25.99, symbol: '$', formatted: '$25.99' }
			}
		});

		expect(getByText('$25.99 each')).toBeInTheDocument();
	});

	it('does not call onQuantityChange when incrementing at max quantity', async () => {
		const handleQuantityChange = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				quantity: 99,
				maxQuantity: 99,
				onQuantityChange: handleQuantityChange
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		await user.click(incrementButton);

		expect(handleQuantityChange).not.toHaveBeenCalled();
	});

	it('does not call onQuantityChange when decrementing at min quantity', async () => {
		const handleQuantityChange = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				quantity: 1,
				minQuantity: 1,
				onQuantityChange: handleQuantityChange
			}
		});

		const decrementButton = getByLabelText('Decrease quantity');
		await user.click(decrementButton);

		expect(handleQuantityChange).not.toHaveBeenCalled();
	});

	it('does not call onRemove when already removing', async () => {
		const handleRemove = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				isRemoving: true,
				onRemove: handleRemove
			}
		});

		const removeButton = getByLabelText('Remove item');
		await user.click(removeButton);

		expect(handleRemove).not.toHaveBeenCalled();
	});

	it('does not call onQuantityChange when loading', async () => {
		const handleQuantityChange = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				...defaultProps,
				isLoading: true,
				onQuantityChange: handleQuantityChange
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		await user.click(incrementButton);

		expect(handleQuantityChange).not.toHaveBeenCalled();
	});

	it('renders with default props', () => {
		const { container } = render(LineItem, {
			props: {
				name: 'Product',
				price: { value: 10 }
			}
		});

		expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
	});

	it('handles increment and decrement with default callbacks', async () => {
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				name: 'Product',
				price: { value: 10 },
				quantity: 5
			}
		});

		const incrementButton = getByLabelText('Increase quantity');
		const decrementButton = getByLabelText('Decrease quantity');

		// Should not throw when clicked with default callbacks
		await user.click(incrementButton);
		await user.click(decrementButton);
	});

	it('handles remove with default callback', async () => {
		const user = userEvent.setup();

		const { getByLabelText } = render(LineItem, {
			props: {
				name: 'Product',
				price: { value: 10 }
			}
		});

		const removeButton = getByLabelText('Remove item');

		// Should not throw when clicked with default callback
		await user.click(removeButton);
	});
});
