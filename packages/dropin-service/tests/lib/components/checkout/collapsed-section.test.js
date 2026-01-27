import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CollapsedSection from '$lib/components/checkout/collapsed-section.svelte';

describe('CollapsedSection', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders icon button', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const button = container.querySelector('button');
		expect(button).toBeInTheDocument();
	});

	it('calls onchange when icon button is clicked', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				onchange: handleChange
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('renders with UiGroup wrapper when grouped is false (default)', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				grouped: false
			}
		});

		const innerDiv = container.querySelector('.col-span-2');
		expect(innerDiv).toBeInTheDocument();
	});

	it('renders without UiGroup wrapper when grouped is true', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				grouped: true
			}
		});

		const outerDiv = container.querySelector('.col-span-2.bg-white');
		expect(outerDiv).toBeInTheDocument();
	});

	it('applies custom class when provided', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				class: 'custom-class'
			}
		});

		const elementWithCustomClass = container.querySelector('.custom-class');
		expect(elementWithCustomClass).toBeInTheDocument();
	});

	it('applies custom class in grouped mode', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				grouped: true,
				class: 'my-custom-class'
			}
		});

		const element = container.querySelector('.my-custom-class');
		expect(element).toBeInTheDocument();
	});

	it('renders button with correct styling', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveClass('cursor-pointer');
		expect(button).toHaveClass('rounded-md');
		expect(button).toHaveClass('border');
		expect(button).toHaveClass('border-gray-300');
		expect(button).toHaveClass('bg-white');
		expect(button).toHaveClass('p-1.5');
	});

	it('renders button with type button', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveAttribute('type', 'button');
	});

	it('renders with flex layout', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const flexContainer = container.querySelector('.flex.flex-row');
		expect(flexContainer).toBeInTheDocument();
	});

	it('renders content in a full-width container', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const contentWrapper = container.querySelector('.w-full');
		expect(contentWrapper).toBeInTheDocument();
	});

	it('renders with padding', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const paddedElement = container.querySelector('.p-4');
		expect(paddedElement).toBeInTheDocument();
	});

	it('renders icon button in both grouped and ungrouped modes', () => {
		const { container: containerGrouped } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				grouped: true
			}
		});
		expect(containerGrouped.querySelector('button')).toBeInTheDocument();
		cleanup();

		const { container: containerUngrouped } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				grouped: false
			}
		});
		expect(containerUngrouped.querySelector('button')).toBeInTheDocument();
	});

	it('calls onchange when icon button is clicked in grouped mode', async () => {
		const handleChange = vi.fn();
		const user = userEvent.setup();

		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				onchange: handleChange,
				grouped: true
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('uses default empty onchange function when not provided', async () => {
		const user = userEvent.setup();

		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(button).toBeInTheDocument();
	});

	it('uses default empty onchange function in grouped mode', async () => {
		const user = userEvent.setup();

		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				grouped: true
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(button).toBeInTheDocument();
	});

	it('renders icon inside button by default', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content'
			}
		});

		const button = container.querySelector('button');
		const svg = button.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders icon inside button when icon prop is switch', () => {
		const { container } = render(CollapsedSection, {
			props: {
				children: () => 'Content',
				icon: 'switch'
			}
		});

		const button = container.querySelector('button');
		const svg = button.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});
});
