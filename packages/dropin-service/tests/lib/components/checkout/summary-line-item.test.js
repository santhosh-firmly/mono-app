import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SummaryLineItem from '$lib/components/checkout/summary-line-item.svelte';

describe('Summary Line Item', () => {
	afterEach(() => {
		cleanup();
	});

	const defaultProps = {
		image: 'https://via.placeholder.com/80',
		title: 'Test Product',
		description: 'Size: M, Color: Blue',
		price: 29.99,
		quantity: 2
	};

	it('renders item title', () => {
		const { getByText } = render(SummaryLineItem, {
			props: defaultProps
		});

		expect(getByText('Test Product')).toBeInTheDocument();
	});

	it('renders item description when provided', () => {
		const { getByText } = render(SummaryLineItem, {
			props: defaultProps
		});

		expect(getByText('Size: M, Color: Blue')).toBeInTheDocument();
	});

	it('does not render description when not provided', () => {
		const { queryByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				description: undefined
			}
		});

		expect(queryByText('Size: M, Color: Blue')).not.toBeInTheDocument();
	});

	it('renders formatted price', () => {
		const { getByText } = render(SummaryLineItem, {
			props: defaultProps
		});

		expect(getByText(/\$29\.99/)).toBeInTheDocument();
	});

	it('renders quantity text when onQuantityChange is not provided', () => {
		const { getByText } = render(SummaryLineItem, {
			props: defaultProps
		});

		expect(getByText('Qty: 2')).toBeInTheDocument();
	});

	it('renders quantity selector when onQuantityChange is provided', () => {
		const { container, queryByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				onQuantityChange: vi.fn()
			}
		});

		// Should not show static quantity text
		expect(queryByText('Qty: 2')).not.toBeInTheDocument();

		// Should have quantity selector buttons
		const buttons = container.querySelectorAll('button');
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('renders image with correct src', () => {
		const { container } = render(SummaryLineItem, {
			props: defaultProps
		});

		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', 'https://via.placeholder.com/80');
	});

	it('renders image with title as alt text', () => {
		const { container } = render(SummaryLineItem, {
			props: defaultProps
		});

		const img = container.querySelector('img');
		expect(img).toHaveAttribute('alt', 'Test Product');
	});

	it('applies flex layout', () => {
		const { container } = render(SummaryLineItem, {
			props: defaultProps
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('gap-x-4');
	});

	it('disables quantity selector when disabled is true', () => {
		const { container } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				onQuantityChange: vi.fn(),
				disabled: true
			}
		});

		const buttons = container.querySelectorAll('button');
		buttons.forEach((button) => {
			expect(button).toBeDisabled();
		});
	});

	it('does not render description when empty string', () => {
		const { container } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				description: ''
			}
		});

		expect(container.textContent).not.toContain('Size:');
	});

	it('renders with zero quantity', () => {
		const { getByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				quantity: 0
			}
		});

		expect(getByText('Qty: 0')).toBeInTheDocument();
	});

	it('shows removal state when pendingRemoval is true', () => {
		const { getByText, container } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true
			}
		});

		expect(getByText(/item removed/i)).toBeInTheDocument();
		const wrapper = container.querySelector('.line-item-container');
		expect(wrapper).toHaveClass('border-dashed');
	});

	it('shows undo button in removal state', () => {
		const onUndo = vi.fn();
		const { getByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true,
				onUndo
			}
		});

		const undoButton = getByText(/undo/i);
		expect(undoButton).toBeInTheDocument();
	});

	it('calls onUndo when undo button is clicked', async () => {
		const onUndo = vi.fn();
		const { getByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true,
				onUndo
			}
		});

		const undoButton = getByText(/undo/i);
		await undoButton.click();

		expect(onUndo).toHaveBeenCalledTimes(1);
	});

	it('shows countdown timer when removalCountdown is set', () => {
		const { getByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true,
				removalCountdown: 5,
				onUndo: vi.fn()
			}
		});

		expect(getByText('5s')).toBeInTheDocument();
	});

	it('shows spinner when isUndoing is true', () => {
		const { container } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true,
				isUndoing: true,
				onUndo: vi.fn()
			}
		});

		const spinner = container.querySelector('.animate-spin');
		expect(spinner).toBeInTheDocument();
	});

	it('hides undo button when isUndoing is true', () => {
		const { queryByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true,
				isUndoing: true,
				onUndo: vi.fn()
			}
		});

		expect(queryByText(/undo/i)).not.toBeInTheDocument();
	});

	it('hides quantity when hideQuantity is true', () => {
		const { queryByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				hideQuantity: true
			}
		});

		expect(queryByText(/Qty:/i)).not.toBeInTheDocument();
	});

	it('applies opacity to image when pendingRemoval is true', () => {
		const { container } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true
			}
		});

		const imageContainer = container.querySelector('.size-16');
		expect(imageContainer).toHaveClass('opacity-40');
	});

	it('shows truncated title in removal state', () => {
		const { getByText } = render(SummaryLineItem, {
			props: {
				...defaultProps,
				pendingRemoval: true,
				onUndo: vi.fn()
			}
		});

		const titleElement = getByText('Test Product');
		expect(titleElement).toHaveClass('line-clamp-1');
	});
});
