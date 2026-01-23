import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ShippingEmail from '$lib/components/checkout/shipping-email.svelte';
import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

describe('ShippingEmail', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders email input field', () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm()
			}
		});
		const emailInput = container.querySelector('input[autocomplete*="email"]');
		expect(emailInput).toBeTruthy();
	});

	it('displays email value when provided', () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm({ email: 'test@example.com' })
			}
		});
		const emailInput = container.querySelector('input[autocomplete*="email"]');
		expect(emailInput.value).toBe('test@example.com');
	});

	it('shows validating spinner when validating', () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm(),
				isValidating: true
			}
		});
		const spinner = container.querySelector('.animate-spin');
		expect(spinner).toBeTruthy();
	});

	it('shows C2P alert when c2pInitialized is true', () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm(),
				c2pInitialized: true
			}
		});
		const alert = container.querySelector('.rounded-lg.bg-gray-100');
		expect(alert).toBeTruthy();
		const c2pText = container.textContent;
		expect(c2pText).toContain('Click to Pay');

		// Check that the Click to Pay link is present and has correct href
		const c2pLink = container.querySelector(
			'a[href="https://www.mastercard.com/global/click-to-pay/en-us/privacy-notice.html"]'
		);
		expect(c2pLink).toBeTruthy();
		expect(c2pLink.textContent).toBe('Click to Pay');
		expect(c2pLink).toHaveAttribute('target', '_blank');
	});

	it('does not show C2P alert when c2pInitialized is false', () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm(),
				c2pInitialized: false
			}
		});
		const alert = container.querySelector('.rounded-lg.bg-gray-100');
		expect(alert).toBeFalsy();
	});

	it('toggles show more content when button is clicked', async () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm(),
				c2pInitialized: true
			}
		});

		// Initially, expanded content should not be visible
		let expandedText = container.textContent;
		expect(expandedText).not.toContain('one-time passcode');

		// Click the show more button
		const alert = container.querySelector('.rounded-lg.bg-gray-100');
		const button = alert.querySelector('button');
		expect(button).toBeTruthy();
		await button.click();

		// Now expanded content should be visible
		expandedText = container.textContent;
		expect(expandedText).toContain('one-time passcode');
	});

	it('shows show more button when C2P is initialized', () => {
		const { container } = render(ShippingEmail, {
			props: {
				form: useCheckoutForm(),
				c2pInitialized: true
			}
		});

		const alert = container.querySelector('.rounded-lg.bg-gray-100');
		const button = alert.querySelector('button');
		expect(button).toBeTruthy();
	});
});
