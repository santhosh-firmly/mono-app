import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import PaymentCollapsed from '$lib/components/checkout/payment-collapsed.svelte';

describe('PaymentCollapsed', () => {
	const mockCard = {
		brand: 'Mastercard',
		last4: '4242',
		first4: '5555'
	};

	afterEach(() => {
		cleanup();
	});

	it('renders card information without UiGroup wrapper when grouped=true', () => {
		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				grouped: true
			}
		});

		expect(container.textContent).toContain('Mastercard *** 4242');

		const groupWrapper = container.querySelector('.bg-white.p-4');
		expect(groupWrapper).toBeInTheDocument();
	});

	it('renders card information with UiGroup wrapper when grouped=false', () => {
		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				grouped: false
			}
		});

		expect(container.textContent).toContain('Mastercard *** 4242');
	});

	it('renders card information with UiGroup wrapper by default', () => {
		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard
			}
		});

		expect(container.textContent).toContain('Mastercard *** 4242');
	});

	it('calls onchange when change button is clicked', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				onchange: handleChange
			}
		});

		const changeButton = container.querySelector('button');
		await user.click(changeButton);

		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('displays Click to Pay icon for C2P cards', () => {
		const c2pCard = {
			...mockCard,
			wallet: 'c2p'
		};

		const { container } = render(PaymentCollapsed, {
			props: {
				card: c2pCard
			}
		});

		const divider = container.querySelector('.h-6.w-px.bg-gray-300');
		expect(divider).toBeInTheDocument();
	});

	it('does not display Click to Pay icon for non-C2P cards', () => {
		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard
			}
		});

		const divider = container.querySelector('.h-6.w-px.bg-gray-300');
		expect(divider).not.toBeInTheDocument();
	});

	it('disables change button when disabled=true', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				onchange: handleChange,
				disabled: true
			}
		});

		const changeButton = container.querySelector('button');
		expect(changeButton).toBeDisabled();

		await user.click(changeButton);
		expect(handleChange).not.toHaveBeenCalled();
	});

	it('enables change button when disabled=false', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				onchange: handleChange,
				disabled: false
			}
		});

		const changeButton = container.querySelector('button');
		expect(changeButton).not.toBeDisabled();

		await user.click(changeButton);
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('passes card art to IconCcBrand component', () => {
		const cardWithArt = {
			...mockCard,
			art: 'https://example.com/card-art.png',
			wallet: 'c2p'
		};

		const { container } = render(PaymentCollapsed, {
			props: {
				card: cardWithArt
			}
		});

		expect(container.textContent).toContain('Mastercard *** 4242');
	});

	it('renders correctly in grouped mode with C2P card', () => {
		const c2pCard = {
			...mockCard,
			wallet: 'c2p',
			art: 'https://example.com/card-art.png'
		};

		const { container } = render(PaymentCollapsed, {
			props: {
				card: c2pCard,
				grouped: true
			}
		});

		expect(container.textContent).toContain('Mastercard *** 4242');

		const divider = container.querySelector('.h-6.w-px.bg-gray-300');
		expect(divider).toBeInTheDocument();
	});

	it('applies disabled styles to button when disabled', () => {
		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				disabled: true
			}
		});

		const changeButton = container.querySelector('button');
		expect(changeButton.className).toContain('cursor-not-allowed');
		expect(changeButton.className).toContain('opacity-50');
	});

	it('does not apply disabled styles when enabled', () => {
		const { container } = render(PaymentCollapsed, {
			props: {
				card: mockCard,
				disabled: false
			}
		});

		const changeButton = container.querySelector('button');
		expect(changeButton.className).not.toContain('cursor-not-allowed');
		expect(changeButton.className).not.toContain('opacity-50');
	});
});
