import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiCheckbox from '$lib/components/ui/checkbox.svelte';

describe('UiCheckbox', () => {
	it('renders checkbox with title and toggles state', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container, getByText } = render(UiCheckbox, {
			props: {
				isChecked: false,
				title: 'Checkbox Label',
				onChange: handleChange
			}
		});

		const checkbox = container.querySelector('input[type="checkbox"]');
		const label = getByText('Checkbox Label');

		expect(checkbox).toBeInTheDocument();
		expect(checkbox).not.toBeChecked();
		expect(label).toBeInTheDocument();

		// Click to check
		await user.click(checkbox);
		expect(checkbox).toBeChecked();
		expect(handleChange).toHaveBeenCalledWith(true);

		// Click to uncheck
		await user.click(checkbox);
		expect(checkbox).not.toBeChecked();
		expect(handleChange).toHaveBeenCalledWith(false);
	});

	it('renders with checked state', () => {
		const { container } = render(UiCheckbox, {
			props: {
				isChecked: true,
				title: 'Checkbox Label',
				onChange: vi.fn()
			}
		});

		const checkbox = container.querySelector('input[type="checkbox"]');
		expect(checkbox).toBeChecked();
	});

	it('renders with subtitle', async () => {
		const user = userEvent.setup();
		const { getByText, getByLabelText } = render(UiCheckbox, {
			props: {
				isChecked: false,
				title: 'Checkbox Label',
				subtitle: 'Additional information about this option',
				onChange: vi.fn()
			}
		});

		// The subtitle is initially collapsed, need to expand it first
		const expandButton = getByLabelText('Toggle expanded');
		expect(expandButton).toBeInTheDocument();

		await user.click(expandButton);

		const subtitle = getByText('Additional information about this option');
		expect(subtitle).toBeInTheDocument();
	});

	it('is disabled when disabled prop is true', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container } = render(UiCheckbox, {
			props: {
				isChecked: false,
				title: 'Checkbox Label',
				disabled: true,
				onChange: handleChange
			}
		});

		const checkbox = container.querySelector('input[type="checkbox"]');
		expect(checkbox).toBeDisabled();

		// Try to click disabled checkbox
		await user.click(checkbox);
		expect(handleChange).not.toHaveBeenCalled();
	});
});
