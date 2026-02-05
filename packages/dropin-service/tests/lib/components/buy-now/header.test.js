import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Header from '$lib/components/buy-now/header.svelte';

vi.mock('$lib/paraglide/messages', () => ({
	return_to: ({ partner }) => `Return to ${partner}`
}));

describe('BuyNow Header', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders default header with FIRMLY text', () => {
		const { container } = render(Header, {
			props: {
				presentation: null,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('FIRMLY');
	});

	it('renders partner display name when provided', () => {
		const presentation = {
			displayName: 'Test Partner'
		};

		const { container } = render(Header, {
			props: {
				presentation,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('Test Partner');
	});

	it('renders partner logo when provided', () => {
		const presentation = {
			displayName: 'Test Partner',
			largeLogo: 'https://example.com/logo.png'
		};

		const { container } = render(Header, {
			props: {
				presentation,
				onBackClick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
		expect(logo).toHaveClass('h-8');
	});

	it('calls onBackClick when back button is clicked', async () => {
		const handleBackClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(Header, {
			props: {
				presentation: null,
				onBackClick: handleBackClick
			}
		});

		const backButton = container.querySelector('button');
		await user.click(backButton);

		expect(handleBackClick).toHaveBeenCalledTimes(1);
	});

	it('renders return to button with partner name', () => {
		const presentation = {
			displayName: 'My Store'
		};

		const { container } = render(Header, {
			props: {
				presentation,
				onBackClick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button.textContent).toContain('Return to My Store');
	});

	it('applies correct container styles', () => {
		const { container } = render(Header, {
			props: {
				presentation: null,
				onBackClick: vi.fn()
			}
		});

		const headerDiv = container.firstChild;
		expect(headerDiv).toHaveClass('z-10');
		expect(headerDiv).toHaveClass('bg-white');
	});

	it('renders with empty presentation', () => {
		const { container } = render(Header, {
			props: {
				presentation: {},
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('FIRMLY');
	});

	it('displays logo with correct alt text when logo is provided', () => {
		const presentation = {
			displayName: 'My Store',
			largeLogo: 'https://example.com/store-logo.png'
		};

		const { container } = render(Header, {
			props: {
				presentation,
				onBackClick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('alt', 'My Store');
	});

	it('uses FIRMLY as default when displayName is empty', () => {
		const presentation = {
			displayName: ''
		};

		const { container } = render(Header, {
			props: {
				presentation,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('FIRMLY');
	});

	it('back button has correct accessibility attributes', () => {
		const { container } = render(Header, {
			props: {
				presentation: null,
				onBackClick: vi.fn()
			}
		});

		const backButton = container.querySelector('button');
		expect(backButton.tagName).toBe('BUTTON');
		expect(backButton).toHaveAttribute('aria-label', 'Return to FIRMLY');
	});

	it('renders gradient overlay for blur effect', () => {
		const { container } = render(Header, {
			props: {
				presentation: null,
				onBackClick: vi.fn()
			}
		});

		const gradientOverlay = container.querySelector('.translate-y-full');
		expect(gradientOverlay).toBeInTheDocument();
		expect(gradientOverlay).toHaveClass('pointer-events-none');
	});
});
