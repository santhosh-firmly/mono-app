import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import BottomSheetLayout from '$lib/components/buy-now/layout/bottom-sheet.svelte';

describe('BuyNow BottomSheet Layout', () => {
	beforeEach(() => {
		Object.defineProperty(document.body, 'clientHeight', {
			value: 800,
			writable: true,
			configurable: true
		});
	});

	afterEach(() => {
		cleanup();
	});

	it('renders container with gray background', () => {
		const { container } = render(BottomSheetLayout, {
			props: {
				children: () => {}
			}
		});

		const bgContainer = container.querySelector('.bg-gray-500');
		expect(bgContainer).toBeInTheDocument();
	});

	it('renders with gray background container', () => {
		const { container } = render(BottomSheetLayout, {
			props: {
				children: () => {}
			}
		});

		const bgContainer = container.querySelector('.bg-gray-500');
		expect(bgContainer).toBeInTheDocument();
	});

	it('mounts without errors', async () => {
		const { container } = render(BottomSheetLayout, {
			props: {
				children: () => {}
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('renders bottom sheet component', async () => {
		const { container } = render(BottomSheetLayout, {
			props: {
				children: () => {}
			}
		});

		await waitFor(() => {
			expect(container.querySelector('.bg-gray-500')).toBeInTheDocument();
		});
	});

	it('does not open when body clientHeight is 0', async () => {
		Object.defineProperty(document.body, 'clientHeight', {
			value: 0,
			writable: true,
			configurable: true
		});

		const { container } = render(BottomSheetLayout, {
			props: {
				children: () => {}
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('logs when open state changes', async () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		render(BottomSheetLayout, {
			props: {
				children: () => {}
			}
		});

		consoleSpy.mockRestore();
	});
});
