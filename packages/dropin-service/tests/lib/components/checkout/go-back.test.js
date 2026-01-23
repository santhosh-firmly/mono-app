import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import GoBack from '$lib/components/checkout/go-back.svelte';

describe('GoBack', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders with logo when logoUrl is provided', () => {
		const { container } = render(GoBack, {
			props: {
				logoUrl: 'https://via.placeholder.com/100x40',
				storeName: 'My Store',
				onclick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('src', 'https://via.placeholder.com/100x40');
		expect(logo).toHaveAttribute('alt', 'My Store');
	});

	it('renders store name when logoUrl is null', () => {
		const { getByText } = render(GoBack, {
			props: {
				logoUrl: null,
				storeName: 'Amazon Store',
				onclick: vi.fn()
			}
		});

		expect(getByText('Amazon Store')).toBeInTheDocument();
	});

	it('renders store name when logoUrl is not provided', () => {
		const { getByText } = render(GoBack, {
			props: {
				storeName: 'Test Store',
				onclick: vi.fn()
			}
		});

		expect(getByText('Test Store')).toBeInTheDocument();
	});

	it('calls onclick when clicked', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(GoBack, {
			props: {
				logoUrl: 'https://via.placeholder.com/100x40',
				storeName: 'My Store',
				onclick: handleClick
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('renders as a button element', () => {
		const { container } = render(GoBack, {
			props: {
				logoUrl: null,
				storeName: 'My Store',
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('group');
	});

	it('renders skeleton when isLoading is true', () => {
		const { container } = render(GoBack, {
			props: {
				isLoading: true,
				onclick: vi.fn()
			}
		});

		// Should render skeleton element instead of logo or store name
		const skeleton = container.querySelector('[class*="animate-pulse"]');
		expect(skeleton).toBeInTheDocument();
	});

	it('disables button when isLoading is true', () => {
		const { container } = render(GoBack, {
			props: {
				isLoading: true,
				storeName: 'My Store',
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveAttribute('disabled');
	});

	it('does not disable button when isLoading is false', () => {
		const { container } = render(GoBack, {
			props: {
				isLoading: false,
				storeName: 'My Store',
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).not.toHaveAttribute('disabled');
	});

	it('does not render logo or store name when isLoading', () => {
		const { container, queryByText } = render(GoBack, {
			props: {
				isLoading: true,
				logoUrl: 'https://via.placeholder.com/100x40',
				storeName: 'My Store',
				onclick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).not.toBeInTheDocument();
		expect(queryByText('My Store')).not.toBeInTheDocument();
	});

	it('renders as a clickable button', () => {
		const { container } = render(GoBack, {
			props: {
				storeName: 'My Store',
				onclick: vi.fn()
			}
		});

		// Check that the button has proper cursor styling
		const button = container.querySelector('button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass('cursor-pointer');
	});

	it('falls back to store name when image fails to load', async () => {
		const { container, getByText } = render(GoBack, {
			props: {
				logoUrl: 'https://invalid-url.com/broken-image.png',
				storeName: 'Fallback Store',
				onclick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).toBeInTheDocument();

		// Trigger onerror handler
		await fireEvent.error(logo);

		// After error, store name should be displayed instead of image
		expect(getByText('Fallback Store')).toBeInTheDocument();
	});

	describe('fullscreen mode', () => {
		it('renders without back button when isFullscreen is true', () => {
			const { container } = render(GoBack, {
				props: {
					isFullscreen: true,
					storeName: 'My Store',
					onclick: vi.fn()
				}
			});

			const button = container.querySelector('button');
			expect(button).not.toBeInTheDocument();
		});

		it('renders logo in fullscreen mode', () => {
			const { container } = render(GoBack, {
				props: {
					isFullscreen: true,
					logoUrl: 'https://via.placeholder.com/100x40',
					storeName: 'My Store',
					onclick: vi.fn()
				}
			});

			const logo = container.querySelector('img');
			expect(logo).toBeInTheDocument();
			expect(logo).toHaveAttribute('src', 'https://via.placeholder.com/100x40');
		});

		it('renders store name in fullscreen mode when no logo', () => {
			const { getByText } = render(GoBack, {
				props: {
					isFullscreen: true,
					storeName: 'Fullscreen Store',
					onclick: vi.fn()
				}
			});

			expect(getByText('Fullscreen Store')).toBeInTheDocument();
		});

		it('renders skeleton in fullscreen mode when loading', () => {
			const { container } = render(GoBack, {
				props: {
					isFullscreen: true,
					isLoading: true,
					onclick: vi.fn()
				}
			});

			const skeleton = container.querySelector('[class*="animate-pulse"]');
			expect(skeleton).toBeInTheDocument();
		});

		it('falls back to store name when image fails in fullscreen mode', async () => {
			const { container, getByText } = render(GoBack, {
				props: {
					isFullscreen: true,
					logoUrl: 'https://invalid-url.com/broken-image.png',
					storeName: 'Fullscreen Fallback',
					onclick: vi.fn()
				}
			});

			const logo = container.querySelector('img');
			expect(logo).toBeInTheDocument();

			await fireEvent.error(logo);

			expect(getByText('Fullscreen Fallback')).toBeInTheDocument();
		});

		it('renders div instead of button in fullscreen mode', () => {
			const { container } = render(GoBack, {
				props: {
					isFullscreen: true,
					storeName: 'My Store',
					onclick: vi.fn()
				}
			});

			const wrapper = container.querySelector('.flex.items-center');
			expect(wrapper).toBeInTheDocument();
			expect(wrapper.tagName).toBe('DIV');
		});

		it('does not render back icon in fullscreen mode', () => {
			const { container } = render(GoBack, {
				props: {
					isFullscreen: true,
					storeName: 'My Store',
					onclick: vi.fn()
				}
			});

			const icon = container.querySelector('[icon="fluent-mdl2:back"]');
			expect(icon).not.toBeInTheDocument();
		});
	});
});
