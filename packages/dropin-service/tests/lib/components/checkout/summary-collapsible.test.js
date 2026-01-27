import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import SummaryCollapsible from '$lib/components/checkout/summary-collapsible.svelte';

const mockCollapsibleContent = createRawSnippet(() => ({
	render: () => '<div data-testid="collapsible-content">Collapsible Content</div>',
	setup: () => {}
}));

describe('SummaryCollapsible', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders toggle button', () => {
		const { getByRole } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		const button = getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('shows "Show" text when collapsed', () => {
		const { getByText } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		expect(getByText('Show')).toBeInTheDocument();
	});

	it('shows "Hide" text when expanded', async () => {
		const user = userEvent.setup();

		const { getByRole, getByText } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		const button = getByRole('button');
		await user.click(button);

		expect(getByText('Hide')).toBeInTheDocument();
	});

	it('toggles expanded state on click', async () => {
		const user = userEvent.setup();

		const { getByRole, getByText, queryByText } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		expect(getByText('Show')).toBeInTheDocument();

		const button = getByRole('button');
		await user.click(button);

		expect(getByText('Hide')).toBeInTheDocument();
		expect(queryByText('Show')).not.toBeInTheDocument();

		await user.click(button);

		expect(getByText('Show')).toBeInTheDocument();
	});

	it('renders toggle button with icon container', () => {
		const { getByText } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		const showText = getByText('Show');
		const iconContainer = showText.closest('.flex.items-center.gap-2');
		expect(iconContainer).toBeInTheDocument();
		expect(iconContainer).toHaveClass('text-xs');
	});

	it('shows expanded state after toggle click', async () => {
		const user = userEvent.setup();

		const { getByRole, getByText } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		const button = getByRole('button');
		await user.click(button);

		expect(getByText('Hide')).toBeInTheDocument();
		const iconContainer = getByText('Hide').closest('.flex.items-center.gap-2');
		expect(iconContainer).toBeInTheDocument();
	});

	it('applies custom class', () => {
		const { container } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent,
				class: 'custom-class'
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('custom-class');
	});

	it('renders with flex column layout', () => {
		const { container } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
	});

	it('renders button with cursor-pointer', () => {
		const { getByRole } = render(SummaryCollapsible, {
			props: {
				collapsibleContent: mockCollapsibleContent
			}
		});

		const button = getByRole('button');
		expect(button).toHaveClass('cursor-pointer');
	});
});
