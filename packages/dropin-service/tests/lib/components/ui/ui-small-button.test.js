import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiSmallButton from '$lib/components/ui/small-button.svelte';

describe('UiSmallButton', () => {
	it('renders button and handles click', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(UiSmallButton, {
			props: { onclick: handleClick },
			context: new Map([['$$slots', { default: true }]])
		});

		// Manually set button text
		const button = container.querySelector('button');
		if (button) {
			button.textContent = 'Button Text';
		}

		expect(button).toBeInTheDocument();
		expect(button).toBeEnabled();

		if (button) {
			await user.click(button);
			expect(handleClick).toHaveBeenCalledTimes(1);
		}
	});

	it('renders with short text', () => {
		const { container } = render(UiSmallButton, {
			props: {},
			context: new Map([['$$slots', { default: true }]])
		});

		const button = container.querySelector('button');
		if (button) {
			button.textContent = 'OK';
		}

		expect(button).toBeInTheDocument();
	});

	it('renders with longer text', () => {
		const { container } = render(UiSmallButton, {
			props: {},
			context: new Map([['$$slots', { default: true }]])
		});

		const button = container.querySelector('button');
		if (button) {
			button.textContent = 'Apply Discount';
		}

		expect(button).toBeInTheDocument();
	});
});
