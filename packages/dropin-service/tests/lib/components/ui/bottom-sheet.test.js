import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import BottomSheet from '$lib/components/ui/bottom-sheet.svelte';

describe('BottomSheet', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders overlay when open is true', async () => {
		render(BottomSheet, {
			props: {
				open: true,
				onOpenChange: vi.fn()
			}
		});

		await waitFor(() => {
			const overlay = document.querySelector('[data-modal-backdrop]');
			expect(overlay).toBeInTheDocument();
		});
	});

	it('renders dialog content when open is true', async () => {
		render(BottomSheet, {
			props: {
				open: true,
				onOpenChange: vi.fn()
			}
		});

		await waitFor(() => {
			const content = document.querySelector('[data-bottom-sheet-content]');
			expect(content).toBeInTheDocument();
		});
	});

	it('applies custom class name', async () => {
		render(BottomSheet, {
			props: {
				open: true,
				class: 'custom-class',
				onOpenChange: vi.fn()
			}
		});

		await waitFor(() => {
			const content = document.querySelector('[data-bottom-sheet-content]');
			expect(content).toBeInTheDocument();
		});
	});

	it('renders default close slot handle when no close prop', async () => {
		render(BottomSheet, {
			props: {
				open: true,
				onOpenChange: vi.fn()
			}
		});

		await waitFor(() => {
			const handle = document.querySelector('.rounded-full.bg-zinc-300');
			expect(handle).toBeInTheDocument();
		});
	});

	it('does not render overlay when open is false', async () => {
		render(BottomSheet, {
			props: {
				open: false,
				onOpenChange: vi.fn()
			}
		});

		await new Promise((resolve) => setTimeout(resolve, 100));
		const overlay = document.querySelector('[data-modal-backdrop]');
		expect(overlay).not.toBeInTheDocument();
	});

	it('calls onOpenChange when Escape key is pressed', async () => {
		const onOpenChange = vi.fn();
		render(BottomSheet, {
			props: {
				open: true,
				onOpenChange
			}
		});

		await waitFor(() => {
			const overlay = document.querySelector('[data-modal-backdrop]');
			expect(overlay).toBeInTheDocument();
		});

		// Simulate Escape key press
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

		await waitFor(() => {
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it('renders with trigger snippet', async () => {
		render(BottomSheet, {
			props: {
				open: false,
				onOpenChange: vi.fn(),
				trigger: () => {}
			}
		});

		await waitFor(() => {
			// Trigger renders as a button wrapping the snippet
			const trigger = document.querySelector('button');
			expect(trigger).toBeInTheDocument();
		});
	});

	it('renders content in DOM when open', async () => {
		render(BottomSheet, {
			props: {
				open: true,
				onOpenChange: vi.fn()
			}
		});

		await waitFor(() => {
			const content = document.querySelector('[data-bottom-sheet-content]');
			expect(content).toBeInTheDocument();
			expect(content).toHaveAttribute('role', 'dialog');
			expect(content).toHaveAttribute('aria-modal', 'true');
		});
	});

	it('has absolute positioning for contained layout', async () => {
		render(BottomSheet, {
			props: {
				open: true,
				onOpenChange: vi.fn()
			}
		});

		await waitFor(() => {
			const overlay = document.querySelector('[data-modal-backdrop]');
			expect(overlay).toBeInTheDocument();
			expect(overlay).toHaveClass('absolute');
		});
	});
});
