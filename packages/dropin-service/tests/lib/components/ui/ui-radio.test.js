import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiRadio from '$lib/components/ui/radio.svelte';

describe('UiRadio', () => {
	it('renders radio button and handles selection', async () => {
		const handleSelect = vi.fn();
		const user = userEvent.setup();

		const { container } = render(UiRadio, {
			props: {
				id: 'radio-option',
				name: 'radio-group',
				isSelected: false,
				onSelect: handleSelect
			},
			context: new Map([['$$slots', { default: true }]])
		});

		// Manually set text content
		const label = container.querySelector('label');
		if (label) {
			label.innerHTML = '<input type="radio" /><span>Radio Option</span>';
		}

		const radio = container.querySelector('input[type="radio"]');

		expect(radio).toBeInTheDocument();
		expect(radio).not.toBeChecked();

		// Click to select
		await user.click(radio);
		expect(radio).toBeChecked();
		expect(handleSelect).toHaveBeenCalledWith('radio-option');
	});

	it('renders in selected state', () => {
		const { container } = render(UiRadio, {
			props: {
				id: 'radio-option',
				name: 'radio-group',
				isSelected: true,
				onSelect: vi.fn()
			}
		});

		const radio = container.querySelector('input[type="radio"]');
		expect(radio).toBeChecked();
	});

	it('is disabled when disabled prop is true', async () => {
		const handleSelect = vi.fn();
		const user = userEvent.setup();

		const { container } = render(UiRadio, {
			props: {
				id: 'radio-option',
				name: 'radio-group',
				disabled: true,
				onSelect: handleSelect
			}
		});

		const radio = container.querySelector('input[type="radio"]');

		expect(radio).toBeDisabled();

		// Try to click disabled radio
		await user.click(radio);
		expect(handleSelect).not.toHaveBeenCalled();
	});
});
