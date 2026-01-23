import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import Sidebar, { TRANSITION_DURATION } from '$lib/components/buy-now/layout/sidebar.svelte';

describe('BuyNow Sidebar Layout', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders container when visible', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const overlay = container.querySelector('.bg-black\\/50');
			expect(overlay).toBeInTheDocument();
		});
	});

	it('exports TRANSITION_DURATION constant', () => {
		expect(TRANSITION_DURATION).toBe(300);
	});

	it('renders with fixed positioning', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const fixedDiv = container.querySelector('.fixed');
			expect(fixedDiv).toBeInTheDocument();
		});
	});

	it('aligns content to the right', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const rightAligned = container.querySelector('.justify-end');
			expect(rightAligned).toBeInTheDocument();
		});
	});

	it('has semi-transparent background overlay', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const overlayDiv = container.querySelector('.bg-black\\/50');
			expect(overlayDiv).toBeInTheDocument();
		});
	});

	it('has white background for sidebar content', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const sidebarContent = container.querySelector('.bg-white');
			expect(sidebarContent).toBeInTheDocument();
		});
	});

	it('has shadow styling', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const shadowDiv = container.querySelector('.shadow-xl');
			expect(shadowDiv).toBeInTheDocument();
		});
	});

	it('has overflow-y-auto for scrollable content', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const scrollDiv = container.querySelector('.overflow-y-auto');
			expect(scrollDiv).toBeInTheDocument();
		});
	});

	it('sets visible to true on mount', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const overlay = container.querySelector('.bg-black\\/50');
			expect(overlay).toBeInTheDocument();
		});
	});

	it('closes when clicking outside', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const overlay = container.querySelector('.bg-black\\/50');
			expect(overlay).toBeInTheDocument();
		});

		const overlay = container.querySelector('.bg-black\\/50');
		await fireEvent.click(overlay);

		await waitFor(
			() => {
				const overlayAfterClick = container.querySelector('.bg-black\\/50');
				expect(overlayAfterClick).not.toBeInTheDocument();
			},
			{ timeout: TRANSITION_DURATION + 100 }
		);
	});

	it('has responsive width', async () => {
		const { container } = render(Sidebar, {
			props: {
				children: () => {},
				visible: true
			}
		});

		await waitFor(() => {
			const responsiveDiv = container.querySelector('.max-sm\\:w-full');
			expect(responsiveDiv).toBeInTheDocument();
		});
	});
});
