import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Header from '$lib/components/buy-now/header.svelte';

vi.mock('$lib/paraglide/messages', () => ({
	go_back: () => 'Go back',
	powered_by: () => 'powered by'
}));

describe('BuyNow Header', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders default header with FIRMLY text', () => {
		const { container } = render(Header, {
			props: {
				partner: null,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('FIRMLY');
		expect(container.textContent).toContain('powered by firmly');
	});

	it('renders partner display name when provided', () => {
		const partner = {
			displayName: 'Test Partner'
		};

		const { container } = render(Header, {
			props: {
				partner,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('Test Partner');
		expect(container.textContent).not.toContain('FIRMLY');
	});

	it('renders partner logo when provided', () => {
		const partner = {
			displayName: 'Test Partner',
			largeLogo: 'https://example.com/logo.png'
		};

		const { container } = render(Header, {
			props: {
				partner,
				onBackClick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
		expect(logo).toHaveClass('h-4');

		expect(container.querySelector('span.text-sm')).not.toBeInTheDocument();
	});

	it('calls onBackClick when back button is clicked', async () => {
		const handleBackClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(Header, {
			props: {
				partner: null,
				onBackClick: handleBackClick
			}
		});

		const backButton = container.querySelector('button[aria-label="Go back"]');
		await user.click(backButton);

		expect(handleBackClick).toHaveBeenCalledTimes(1);
	});

	it('renders back arrow SVG', () => {
		const { container } = render(Header, {
			props: {
				partner: null,
				onBackClick: vi.fn()
			}
		});

		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute('width', '17');
		expect(svg).toHaveAttribute('height', '16');
	});

	it('applies correct header styles', () => {
		const { container } = render(Header, {
			props: {
				partner: null,
				onBackClick: vi.fn()
			}
		});

		const header = container.querySelector('header');
		expect(header).toHaveClass('z-10');
		expect(header).toHaveClass('h-12');
		expect(header).toHaveClass('shadow');
	});

	it('renders with empty partner', () => {
		const { container } = render(Header, {
			props: {
				partner: {},
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('FIRMLY');
	});

	it('displays logo with correct alt text when logo is provided', () => {
		const partner = {
			displayName: 'My Store',
			largeLogo: 'https://example.com/store-logo.png'
		};

		const { container } = render(Header, {
			props: {
				partner,
				onBackClick: vi.fn()
			}
		});

		const logo = container.querySelector('img');
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('alt', 'My Store');
	});

	it('renders powered by firmly text in all cases', () => {
		const { container, rerender } = render(Header, {
			props: {
				partner: null,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('powered by firmly');

		rerender({
			props: {
				partner: { displayName: 'Partner' },
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('powered by firmly');

		rerender({
			props: {
				partner: {
					displayName: 'Partner',
					largeLogo: 'https://example.com/logo.png'
				},
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('powered by firmly');
	});

	it('uses FIRMLY as default when displayName is empty', () => {
		const partner = {
			displayName: ''
		};

		const { container } = render(Header, {
			props: {
				partner,
				onBackClick: vi.fn()
			}
		});

		expect(container.textContent).toContain('FIRMLY');
	});

	it('back button has correct accessibility attributes', () => {
		const { container } = render(Header, {
			props: {
				partner: null,
				onBackClick: vi.fn()
			}
		});

		const backButton = container.querySelector('button');
		expect(backButton.tagName).toBe('BUTTON');
		expect(backButton).toHaveAttribute('aria-label', 'Go back');
	});
});
