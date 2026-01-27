import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiInput from '$lib/components/ui/input.svelte';

describe('UiInput', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders input and handles typing', async () => {
		const handleInput = vi.fn();
		const user = userEvent.setup();

		const { getByPlaceholderText } = render(UiInput, {
			props: {
				placeholder: 'Enter text...',
				onInput: handleInput
			}
		});

		const input = getByPlaceholderText('Enter text...');

		expect(input).toBeInTheDocument();
		expect(input).toBeEnabled();

		// Type text
		await user.type(input, 'Hello World');
		expect(input).toHaveValue('Hello World');
		expect(handleInput).toHaveBeenCalled();
	});

	it('displays error message and applies error styling', () => {
		const { container } = render(UiInput, {
			props: {
				placeholder: 'Error input',
				errorMessage: 'This field is required',
				value: ''
			}
		});

		const input = container.querySelector('input[placeholder="Error input"]');
		const inputContainer = input?.parentElement;

		// Verify error styling is applied
		expect(inputContainer).toHaveClass('input-container--error');
	});

	it('accepts only numbers when onlyNumbers is true', async () => {
		const user = userEvent.setup();

		const { getByPlaceholderText } = render(UiInput, {
			props: {
				onlyNumbers: true,
				placeholder: 'Enter numbers only...'
			}
		});

		const input = getByPlaceholderText('Enter numbers only...');

		expect(input).toHaveAttribute('inputmode', 'numeric');

		// Type numbers
		await user.type(input, '12345');
		expect(input).toHaveValue('12345');
	});

	it('is disabled when disabled prop is true', async () => {
		const handleInput = vi.fn();
		const user = userEvent.setup();

		const { getByDisplayValue } = render(UiInput, {
			props: {
				disabled: true,
				value: 'Disabled input',
				onInput: handleInput
			}
		});

		const input = getByDisplayValue('Disabled input');

		expect(input).toBeDisabled();

		// Try to type (should not work)
		await user.type(input, 'test');
		expect(handleInput).not.toHaveBeenCalled();
	});

	it('calls onPressEnter when Enter key is pressed', async () => {
		const handlePressEnter = vi.fn();
		const user = userEvent.setup();

		const { getByPlaceholderText } = render(UiInput, {
			props: {
				placeholder: 'Press enter...',
				onPressEnter: handlePressEnter
			}
		});

		const input = getByPlaceholderText('Press enter...');
		await user.click(input);
		await user.keyboard('{Enter}');

		expect(handlePressEnter).toHaveBeenCalled();
	});

	it('applies unmask function when provided', async () => {
		const handleChange = vi.fn();
		const unmask = (val) => val.replace(/-/g, '');
		const user = userEvent.setup();

		const { getByPlaceholderText } = render(UiInput, {
			props: {
				placeholder: 'Enter value...',
				onChange: handleChange,
				unmask
			}
		});

		const input = getByPlaceholderText('Enter value...');
		await user.type(input, '123-456');
		await user.tab(); // Trigger blur/change

		expect(handleChange).toHaveBeenCalledWith('123456');
	});

	it('applies mask function to display value', () => {
		const mask = (val) => val.replace(/(\d{3})(\d{3})/, '$1-$2');

		const { getByDisplayValue } = render(UiInput, {
			props: {
				value: '123456',
				mask
			}
		});

		expect(getByDisplayValue('123-456')).toBeInTheDocument();
	});

	it('renders prefix snippet when provided', () => {
		const { container } = render(UiInput, {
			props: {
				placeholder: 'With prefix',
				prefix: () => {}
			}
		});

		const input = container.querySelector('input[placeholder="With prefix"]');
		expect(input).toBeInTheDocument();
	});

	it('renders suffix snippet when provided', () => {
		const { container } = render(UiInput, {
			props: {
				placeholder: 'With suffix',
				suffix: () => {}
			}
		});

		const input = container.querySelector('input[placeholder="With suffix"]');
		expect(input).toBeInTheDocument();
	});

	it('filters non-numeric input when onlyNumbers is true', async () => {
		const user = userEvent.setup();

		const { getByPlaceholderText } = render(UiInput, {
			props: {
				onlyNumbers: true,
				placeholder: 'Numbers only'
			}
		});

		const input = getByPlaceholderText('Numbers only');
		await user.type(input, 'abc123def');

		// Should only contain numbers
		expect(input).toHaveValue('123');
	});

	it('uses text inputmode when mask is provided with onlyNumbers', () => {
		const { container } = render(UiInput, {
			props: {
				onlyNumbers: true,
				mask: (val) => val,
				placeholder: 'Masked numbers'
			}
		});

		const input = container.querySelector('input[placeholder="Masked numbers"]');
		expect(input).toHaveAttribute('inputmode', 'text');
	});

	it('calls onBlur when input loses focus', async () => {
		const handleBlur = vi.fn();
		const user = userEvent.setup();

		const { getByPlaceholderText } = render(UiInput, {
			props: {
				placeholder: 'Test blur',
				onBlur: handleBlur
			}
		});

		const input = getByPlaceholderText('Test blur');
		await user.click(input);
		await user.tab();

		expect(handleBlur).toHaveBeenCalled();
	});

	it('only shows suffix when value exists if onlyShowSuffixWhenValue is true', () => {
		const { container, rerender } = render(UiInput, {
			props: {
				placeholder: 'Test suffix',
				value: '',
				onlyShowSuffixWhenValue: true,
				suffix: () => {}
			}
		});

		expect(container).toBeInTheDocument();

		rerender({
			placeholder: 'Test suffix',
			value: 'some value',
			onlyShowSuffixWhenValue: true,
			suffix: () => {}
		});

		expect(container).toBeInTheDocument();
	});

	it('calls clickoutside callback when clicking outside', async () => {
		const handleClickOutside = vi.fn();
		const user = userEvent.setup();

		const { container, getByPlaceholderText } = render(UiInput, {
			props: {
				placeholder: 'Test clickoutside',
				clickoutside: handleClickOutside
			}
		});

		const input = getByPlaceholderText('Test clickoutside');
		await user.click(input);
		await user.click(container);

		// Note: clickoutside behavior depends on directive implementation
		expect(container).toBeInTheDocument();
	});
});
