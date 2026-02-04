import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import Popup from '$lib/components/buy-now/layout/popup.svelte';

describe('BuyNow Popup Layout', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders container after mount', async () => {
		const { container } = render(Popup, {
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
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const fixedDiv = container.querySelector('.fixed');
			expect(fixedDiv).toBeInTheDocument();
		});
	});

	it('has semi-transparent background overlay with blur', async () => {
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const overlayDiv = container.querySelector('.bg-black\\/50');
			expect(overlayDiv).toBeInTheDocument();
			expect(overlayDiv).toHaveClass('backdrop-blur-sm');
		});
	});

	it('centers content', async () => {
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const centeredDiv = container.querySelector('.items-center.justify-center');
			expect(centeredDiv).toBeInTheDocument();
		});
	});

	it('has modal container with rounded corners', async () => {
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const modalDiv = container.querySelector('.rounded-lg');
			expect(modalDiv).toBeInTheDocument();
		});
	});

	it('has white background for modal content', async () => {
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const modalDiv = container.querySelector('.bg-white');
			expect(modalDiv).toBeInTheDocument();
		});
	});

	it('has shadow styling', async () => {
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const shadowDiv = container.querySelector('.shadow-xl');
			expect(shadowDiv).toBeInTheDocument();
		});
	});

	it('has overflow hidden with flex layout for content containment', async () => {
		const { container } = render(Popup, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			const dialogDiv = container.querySelector('[role="dialog"]');
			expect(dialogDiv).toBeInTheDocument();
			expect(dialogDiv).toHaveClass('overflow-hidden');
			expect(dialogDiv).toHaveClass('flex');
			expect(dialogDiv).toHaveClass('flex-col');
		});
	});
});
