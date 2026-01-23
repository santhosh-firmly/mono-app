import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ShippingEmailMessage from '$lib/components/checkout/shipping-email-message.svelte';

describe('ShippingEmailMessage', () => {
	afterEach(() => {
		cleanup();
	});

	describe('rendering', () => {
		it('renders the alert container', () => {
			const { container } = render(ShippingEmailMessage);

			const alert = container.querySelector('[class*="bg-"]');
			expect(alert).toBeInTheDocument();
		});

		it('renders privacy notice link', () => {
			const { container } = render(ShippingEmailMessage);

			const link = container.querySelector('a[href*="mastercard.com"]');
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('target', '_blank');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		});

		it('renders expand button', () => {
			const { container } = render(ShippingEmailMessage);

			const button = container.querySelector('button[aria-label]');
			expect(button).toBeInTheDocument();
		});

		it('has aria-expanded attribute on button', () => {
			const { container } = render(ShippingEmailMessage);

			const button = container.querySelector('button[aria-expanded]');
			expect(button).toBeInTheDocument();
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('expand/collapse behavior', () => {
		it('expands when button is clicked', async () => {
			const user = userEvent.setup();
			const { container } = render(ShippingEmailMessage);

			const button = container.querySelector('button[aria-expanded]');
			expect(button).toHaveAttribute('aria-expanded', 'false');

			await user.click(button);

			expect(button).toHaveAttribute('aria-expanded', 'true');
		});

		it('collapses when button is clicked again', async () => {
			const user = userEvent.setup();
			const { container } = render(ShippingEmailMessage);

			const button = container.querySelector('button[aria-expanded]');

			// Expand
			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'true');

			// Collapse
			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('toggles aria-expanded on double click', async () => {
			const user = userEvent.setup();
			const { container } = render(ShippingEmailMessage);

			const button = container.querySelector('button[aria-expanded]');

			// Click to expand
			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'true');

			// Click again to collapse
			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'false');

			// Click again to expand
			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});
	});
});
