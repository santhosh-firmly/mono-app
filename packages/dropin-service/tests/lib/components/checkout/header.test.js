import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Header from '$lib/components/checkout/header.svelte';

describe('Checkout Header', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders items quantity and total price', () => {
		const { getByText } = render(Header, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		expect(getByText(/\$99\.99/)).toBeInTheDocument();
		expect(getByText(/3 items/i)).toBeInTheDocument();
	});

	it('renders singular item text when quantity is 1', () => {
		const { getByText } = render(Header, {
			props: {
				itemsQuantity: 1,
				totalPrice: 29.99
			}
		});

		expect(getByText(/1 item/i)).toBeInTheDocument();
	});

	it('renders header element with correct classes', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99
			}
		});

		const header = container.querySelector('header');
		expect(header).toBeInTheDocument();
		expect(header).toHaveClass('h-12');
		expect(header).toHaveClass('flex');
		expect(header).toHaveClass('items-center');
		expect(header).toHaveClass('justify-between');
	});

	it('applies custom class', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99,
				class: 'custom-class'
			}
		});

		const header = container.querySelector('header');
		expect(header).toHaveClass('custom-class');
	});

	it('renders toggle button for summary', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		expect(toggleButton).toBeInTheDocument();
	});

	it('shows close text when toggle button is clicked', async () => {
		const user = userEvent.setup();

		const { container, getByText } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				summary: () => {}
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		await user.click(toggleButton);

		expect(getByText(/close/i)).toBeInTheDocument();
	});

	it('renders toggle button with arrow indicator', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		expect(toggleButton).toBeInTheDocument();
	});

	it('toggles summary visibility when clicking toggle button twice', async () => {
		const user = userEvent.setup();

		const { container, getByText, queryByText } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				summary: () => {}
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');

		await user.click(toggleButton);
		expect(getByText(/close/i)).toBeInTheDocument();

		await user.click(toggleButton);
		await waitFor(() => {
			expect(queryByText(/close/i)).not.toBeInTheDocument();
		});
	});

	it('shows background overlay when summary is opened', async () => {
		const user = userEvent.setup();

		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				summary: () => {}
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		await user.click(toggleButton);

		const background = document.getElementById('background');
		expect(background).toBeInTheDocument();
	});

	it('closes summary when clicking on background element', async () => {
		const user = userEvent.setup();

		const { container, getByText, queryByText } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				summary: () => {}
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		await user.click(toggleButton);

		expect(getByText(/close/i)).toBeInTheDocument();

		const background = document.getElementById('background');
		expect(background).toBeInTheDocument();

		await user.click(background);
		await waitFor(() => {
			expect(queryByText(/close/i)).not.toBeInTheDocument();
		});
	});

	it('does not show summary overlay without summary prop', async () => {
		const user = userEvent.setup();

		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		await user.click(toggleButton);

		const background = document.getElementById('background');
		expect(background).not.toBeInTheDocument();
	});

	it('applies light theme styles when background color is light', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				colors: {
					background: '#ffffff',
					primary: '#0066cc'
				}
			}
		});

		const header = container.querySelector('header');
		expect(header?.getAttribute('style')).toContain('--color-background: #ffffff');
		expect(header?.getAttribute('style')).toContain('--color-text: #000000');
		expect(header?.getAttribute('style')).toContain('--color-primary: #0066cc');
	});

	it('applies dark theme styles when background color is dark', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				colors: {
					background: '#000000'
				}
			}
		});

		const header = container.querySelector('header');
		expect(header?.getAttribute('style')).toContain('--color-background: #000000');
		expect(header?.getAttribute('style')).toContain('--color-text: #ffffff');
	});

	it('does not apply custom styles when colors prop is not provided', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99
			}
		});

		const header = container.querySelector('header');
		expect(header?.getAttribute('style')).toBe('');
	});

	it('opens summary using openSummary() method', async () => {
		const { component, getByText } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				summary: () => {}
			}
		});

		component.openSummary();

		await waitFor(() => {
			expect(getByText(/close/i)).toBeInTheDocument();
		});
	});

	it('shows mini overview with product image when enabled', () => {
		const { container, getByText } = render(Header, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99,
				showMiniOverview: true,
				productImage: 'https://example.com/product.jpg'
			}
		});

		const miniOverview = container.querySelector('div[style*="background-image"]');
		expect(miniOverview).toBeInTheDocument();
		expect(miniOverview?.getAttribute('style')).toContain('https://example.com/product.jpg');
		expect(getByText('3')).toBeInTheDocument();
	});

	it('shows question mark in badge when itemsQuantity is 0', () => {
		const { getByText } = render(Header, {
			props: {
				itemsQuantity: 0,
				totalPrice: 0,
				showMiniOverview: true,
				productImage: 'https://example.com/product.jpg'
			}
		});

		expect(getByText('?')).toBeInTheDocument();
	});

	it('hides mini overview when summary is opened', async () => {
		const user = userEvent.setup();

		const { container } = render(Header, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99,
				showMiniOverview: true,
				productImage: 'https://example.com/product.jpg',
				summary: () => {}
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		expect(container.querySelector('div[style*="background-image"]')).toBeInTheDocument();

		await user.click(toggleButton);

		await waitFor(() => {
			expect(
				container.querySelector('div[style*="background-image"]')
			).not.toBeInTheDocument();
		});
	});

	it('does not show mini overview when productImage is not provided', () => {
		const { container } = render(Header, {
			props: {
				itemsQuantity: 3,
				totalPrice: 99.99,
				showMiniOverview: true,
				productImage: ''
			}
		});

		const miniOverview = container.querySelector('div[style*="background-image"]');
		expect(miniOverview).not.toBeInTheDocument();
	});

	it('does not close summary when clicking inside summary content', async () => {
		const user = userEvent.setup();

		const { container, getByText } = render(Header, {
			props: {
				itemsQuantity: 2,
				totalPrice: 59.99,
				summary: () => {}
			}
		});

		const toggleButton = container.querySelector('button[class*="justify-end"]');
		await user.click(toggleButton);

		const summaryContent = container.querySelector('div[class*="cursor-default"]');
		expect(summaryContent).toBeInTheDocument();

		await user.click(summaryContent);

		expect(getByText(/close/i)).toBeInTheDocument();
	});
});
