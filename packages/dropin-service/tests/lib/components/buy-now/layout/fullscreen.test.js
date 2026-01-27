import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import Fullscreen from '$lib/components/buy-now/layout/fullscreen.svelte';

describe('BuyNow Fullscreen Layout', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders container after mount', async () => {
		const { container } = render(Fullscreen, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const fixedDiv = container.querySelector('.fixed');
			expect(fixedDiv).toBeInTheDocument();
		});
	});

	it('renders with fixed positioning', async () => {
		const { container } = render(Fullscreen, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const fixedDiv = container.querySelector('.fixed');
			expect(fixedDiv).toBeInTheDocument();
		});
	});

	it('covers full screen with inset-0', async () => {
		const { container } = render(Fullscreen, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const fullscreenDiv = container.querySelector('.inset-0');
			expect(fullscreenDiv).toBeInTheDocument();
		});
	});

	it('has overflow scroll', async () => {
		const { container } = render(Fullscreen, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const scrollDiv = container.querySelector('.overflow-scroll');
			expect(scrollDiv).toBeInTheDocument();
		});
	});

	it('has z-index for layering', async () => {
		const { container } = render(Fullscreen, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const zIndexDiv = container.querySelector('.z-40');
			expect(zIndexDiv).toBeInTheDocument();
		});
	});
});
