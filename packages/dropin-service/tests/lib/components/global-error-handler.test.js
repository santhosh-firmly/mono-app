import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import GlobalErrorHandler from '$lib/components/global-error-handler.svelte';

vi.mock('$lib/services/telemetry.js', () => ({
	trackError: vi.fn()
}));

import { trackError } from '$lib/services/telemetry.js';

describe('GlobalErrorHandler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
		delete window.onunhandledrejection;
	});

	it('renders with svelte boundary', () => {
		const { container } = render(GlobalErrorHandler, {
			props: {
				children: () => {}
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('sets up unhandled rejection handler on mount', () => {
		render(GlobalErrorHandler, {
			props: {
				children: () => {}
			}
		});

		expect(window.onunhandledrejection).toBeDefined();
		expect(typeof window.onunhandledrejection).toBe('function');
	});

	it('calls trackError when unhandled rejection occurs', () => {
		render(GlobalErrorHandler, {
			props: {
				children: () => {}
			}
		});

		const testError = new Error('Test rejection');
		window.onunhandledrejection({ reason: testError });

		expect(trackError).toHaveBeenCalledWith(testError);
	});

	it('handles string rejection reasons', () => {
		render(GlobalErrorHandler, {
			props: {
				children: () => {}
			}
		});

		window.onunhandledrejection({ reason: 'String error' });

		expect(trackError).toHaveBeenCalledWith('String error');
	});
});
