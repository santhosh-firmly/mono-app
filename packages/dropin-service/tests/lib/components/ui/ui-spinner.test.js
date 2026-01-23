import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import UiSpinner from '$lib/components/ui/spinner.svelte';

describe('UiSpinner', () => {
	it('renders spinner with default size', () => {
		const { container } = render(UiSpinner, {
			props: {
				width: 16,
				height: 16
			}
		});

		const spinner = container.querySelector('svg');

		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveClass('animate-spin');
	});

	it('renders spinner with custom size', () => {
		const { container } = render(UiSpinner, {
			props: {
				width: 32,
				height: 32
			}
		});

		const spinner = container.querySelector('svg');

		expect(spinner).toHaveAttribute('width', '32');
		expect(spinner).toHaveAttribute('height', '32');
	});

	it('applies custom class', () => {
		const { container } = render(UiSpinner, {
			props: {
				width: 16,
				height: 16,
				class: 'text-blue-500'
			}
		});

		const spinner = container.querySelector('svg');
		expect(spinner).toHaveClass('text-blue-500');
	});

	it('renders with default size when no props provided', () => {
		const { container } = render(UiSpinner);

		const spinner = container.querySelector('svg');
		expect(spinner).toHaveAttribute('width', '16');
		expect(spinner).toHaveAttribute('height', '16');
	});

	it('renders without custom class when not provided', () => {
		const { container } = render(UiSpinner, {
			props: {
				width: 24,
				height: 24
			}
		});

		const spinner = container.querySelector('svg');
		expect(spinner).toHaveClass('animate-spin');
		expect(spinner.className).not.toContain('undefined');
	});
});
