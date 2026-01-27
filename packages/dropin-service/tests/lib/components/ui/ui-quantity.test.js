import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import Quantity from '$lib/components/ui/quantity.svelte';

describe('Quantity', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it('renders with default quantity', () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 1,
				onChange: handleChange
			}
		});

		const input = container.querySelector('input[type="number"]');

		expect(input).toHaveValue(1);
		expect(input).toBeEnabled();
	});

	it('renders with increased quantity', () => {
		const { container } = render(Quantity, {
			props: {
				quantity: 3,
				onChange: vi.fn()
			}
		});

		const input = container.querySelector('input[type="number"]');
		expect(input).toHaveValue(3);
	});

	it('shows trash icon at minimum quantity', () => {
		const { container } = render(Quantity, {
			props: {
				quantity: 1,
				onChange: vi.fn()
			}
		});

		const input = container.querySelector('input[type="number"]');
		expect(input).toHaveValue(1);

		const buttons = container.querySelectorAll('button');
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('is disabled when disabled prop is true', () => {
		const { container } = render(Quantity, {
			props: {
				quantity: 2,
				disabled: true,
				onChange: vi.fn()
			}
		});

		const input = container.querySelector('input[type="number"]');
		const buttons = container.querySelectorAll('button');

		expect(input).toBeDisabled();
		buttons.forEach((button) => {
			expect(button).toBeDisabled();
		});
	});

	it('increments quantity when plus button is clicked', async () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 1,
				onChange: handleChange,
				delay: 100
			}
		});

		const buttons = container.querySelectorAll('button');
		const plusButton = buttons[1];

		await fireEvent.click(plusButton);
		vi.advanceTimersByTime(100);

		expect(handleChange).toHaveBeenCalledWith(2);
	});

	it('decrements quantity when minus button is clicked', async () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 3,
				onChange: handleChange,
				delay: 100
			}
		});

		const buttons = container.querySelectorAll('button');
		const minusButton = buttons[0];

		await fireEvent.click(minusButton);
		vi.advanceTimersByTime(100);

		expect(handleChange).toHaveBeenCalledWith(2);
	});

	it('does not decrement below 0', async () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 0,
				onChange: handleChange,
				delay: 100
			}
		});

		const buttons = container.querySelectorAll('button');
		const minusButton = buttons[0];

		await fireEvent.click(minusButton);
		vi.advanceTimersByTime(100);

		expect(handleChange).not.toHaveBeenCalled();
	});

	it('handles input change', async () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 1,
				onChange: handleChange,
				delay: 100
			}
		});

		const input = container.querySelector('input[type="number"]');
		await fireEvent.change(input, { target: { value: '5' } });
		vi.advanceTimersByTime(100);

		expect(handleChange).toHaveBeenCalledWith(5);
	});

	it('ignores invalid input values', async () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 1,
				onChange: handleChange,
				delay: 100
			}
		});

		const input = container.querySelector('input[type="number"]');
		await fireEvent.change(input, { target: { value: 'abc' } });
		vi.advanceTimersByTime(100);

		expect(handleChange).not.toHaveBeenCalled();
	});

	it('debounces onChange calls', async () => {
		const handleChange = vi.fn();

		const { container } = render(Quantity, {
			props: {
				quantity: 1,
				onChange: handleChange,
				delay: 200
			}
		});

		const buttons = container.querySelectorAll('button');
		const plusButton = buttons[1];

		await fireEvent.click(plusButton);
		await fireEvent.click(plusButton);
		await fireEvent.click(plusButton);

		vi.advanceTimersByTime(200);

		expect(handleChange).toHaveBeenCalledTimes(1);
		expect(handleChange).toHaveBeenCalledWith(4);
	});

	it('has correct styling for disabled state', () => {
		const { container } = render(Quantity, {
			props: {
				quantity: 2,
				disabled: true,
				onChange: vi.fn()
			}
		});

		const wrapper = container.querySelector('.bg-gray-200');
		expect(wrapper).toBeInTheDocument();
	});

	it('has correct styling for enabled state', () => {
		const { container } = render(Quantity, {
			props: {
				quantity: 2,
				disabled: false,
				onChange: vi.fn()
			}
		});

		const wrapper = container.querySelector('.frosted');
		expect(wrapper).toBeInTheDocument();
	});
});
