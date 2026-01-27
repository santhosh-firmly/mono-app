import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiButton from '$lib/components/ui/button.svelte';

describe('UiButton', () => {
	it('renders button and handles click', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(UiButton, { props: { onclick: handleClick } });
		const button = container.querySelector('button');

		expect(button).toBeInTheDocument();
		expect(button).toBeEnabled();

		if (button) {
			await user.click(button);
			expect(handleClick).toHaveBeenCalledTimes(1);
		}
	});

	it('applies custom color', () => {
		const { container } = render(UiButton, { props: { color: '#22C55E' } });
		const button = container.querySelector('button');

		expect(button).toHaveAttribute('style', expect.stringContaining('--color-action: #22C55E'));
	});

	it('is disabled when disabled prop is true', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(UiButton, { props: { disabled: true, onclick: handleClick } });
		const button = container.querySelector('button');

		expect(button).toBeDisabled();

		if (button) {
			await user.click(button);
		}
		expect(handleClick).not.toHaveBeenCalled();
	});
});
