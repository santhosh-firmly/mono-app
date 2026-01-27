import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import UiAlert from '$lib/components/ui/alert.svelte';

describe('UiAlert', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders alert with styling', () => {
		const { container } = render(UiAlert, {
			props: {},
			context: new Map([['$$slots', { default: true }]])
		});

		const alert = container.querySelector('.text-sm');
		expect(alert).toBeInTheDocument();
		expect(alert).toHaveClass('text-sm');
	});
});
