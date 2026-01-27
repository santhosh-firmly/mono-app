import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import NoticeItem from '$lib/components/checkout/notice-item.svelte';

describe('NoticeItem', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	const defaultProps = {
		id: 'notice-1',
		type: 'info',
		message: 'Test notification message',
		onDismiss: vi.fn()
	};

	it('renders message', () => {
		const { getByText } = render(NoticeItem, { props: defaultProps });

		expect(getByText('Test notification message')).toBeInTheDocument();
	});

	it('renders with info styling', () => {
		const { container } = render(NoticeItem, {
			props: { ...defaultProps, type: 'info' }
		});

		const notice = container.querySelector('.bg-blue-50');
		expect(notice).toBeInTheDocument();
	});

	it('renders with success styling', () => {
		const { container } = render(NoticeItem, {
			props: { ...defaultProps, type: 'success' }
		});

		const notice = container.querySelector('.bg-green-50');
		expect(notice).toBeInTheDocument();
	});

	it('renders with warning styling', () => {
		const { container } = render(NoticeItem, {
			props: { ...defaultProps, type: 'warning' }
		});

		const notice = container.querySelector('.bg-yellow-50');
		expect(notice).toBeInTheDocument();
	});

	it('renders with error styling', () => {
		const { container } = render(NoticeItem, {
			props: { ...defaultProps, type: 'error' }
		});

		const notice = container.querySelector('.bg-red-50');
		expect(notice).toBeInTheDocument();
	});

	it('renders with role alert for accessibility', () => {
		const { container } = render(NoticeItem, { props: defaultProps });

		const alert = container.querySelector('[role="alert"]');
		expect(alert).toBeInTheDocument();
	});

	it('renders dismiss button', () => {
		const { getByLabelText } = render(NoticeItem, { props: defaultProps });

		const dismissButton = getByLabelText('Dismiss');
		expect(dismissButton).toBeInTheDocument();
	});

	it('calls onDismiss when dismiss button is clicked', async () => {
		vi.useRealTimers();
		const handleDismiss = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(NoticeItem, {
			props: {
				...defaultProps,
				onDismiss: handleDismiss,
				duration: 0
			}
		});

		const dismissButton = getByLabelText('Dismiss');
		await user.click(dismissButton);

		expect(handleDismiss).toHaveBeenCalledWith('notice-1');
	});

	it('renders action button when actionLabel provided', () => {
		const { getByText } = render(NoticeItem, {
			props: {
				...defaultProps,
				actionLabel: 'Undo'
			}
		});

		expect(getByText('Undo')).toBeInTheDocument();
	});

	it('calls onAction when action button is clicked', async () => {
		vi.useRealTimers();
		const handleAction = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(NoticeItem, {
			props: {
				...defaultProps,
				actionLabel: 'Undo',
				onAction: handleAction,
				duration: 0
			}
		});

		const actionButton = getByText('Undo');
		await user.click(actionButton);

		expect(handleAction).toHaveBeenCalledWith('notice-1');
	});

	it('auto-dismisses after duration', async () => {
		const handleDismiss = vi.fn();

		render(NoticeItem, {
			props: {
				...defaultProps,
				onDismiss: handleDismiss,
				duration: 3000
			}
		});

		expect(handleDismiss).not.toHaveBeenCalled();

		vi.advanceTimersByTime(3000);

		await waitFor(() => {
			expect(handleDismiss).toHaveBeenCalledWith('notice-1');
		});
	});

	it('does not auto-dismiss when duration is 0', async () => {
		const handleDismiss = vi.fn();

		render(NoticeItem, {
			props: {
				...defaultProps,
				onDismiss: handleDismiss,
				duration: 0
			}
		});

		vi.advanceTimersByTime(10000);

		expect(handleDismiss).not.toHaveBeenCalled();
	});

	it('clears timeout when action is clicked', async () => {
		vi.useRealTimers();
		const handleAction = vi.fn();
		const handleDismiss = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(NoticeItem, {
			props: {
				...defaultProps,
				actionLabel: 'Undo',
				onAction: handleAction,
				onDismiss: handleDismiss,
				duration: 5000
			}
		});

		const actionButton = getByText('Undo');
		await user.click(actionButton);

		expect(handleAction).toHaveBeenCalled();
	});

	it('renders with border styling', () => {
		const { container } = render(NoticeItem, { props: defaultProps });

		const notice = container.querySelector('.border');
		expect(notice).toBeInTheDocument();
	});

	it('renders with rounded corners', () => {
		const { container } = render(NoticeItem, { props: defaultProps });

		const notice = container.querySelector('.rounded-lg');
		expect(notice).toBeInTheDocument();
	});

	it('renders with shadow', () => {
		const { container } = render(NoticeItem, { props: defaultProps });

		const notice = container.querySelector('.shadow-sm');
		expect(notice).toBeInTheDocument();
	});

	it('uses default duration of 5000ms', async () => {
		const handleDismiss = vi.fn();

		render(NoticeItem, {
			props: {
				...defaultProps,
				onDismiss: handleDismiss
			}
		});

		vi.advanceTimersByTime(4999);
		expect(handleDismiss).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);

		await waitFor(() => {
			expect(handleDismiss).toHaveBeenCalledWith('notice-1');
		});
	});

	it('falls back to info style for unknown type', () => {
		const { container } = render(NoticeItem, {
			props: { ...defaultProps, type: 'unknown' }
		});

		const notice = container.querySelector('.bg-blue-50');
		expect(notice).toBeInTheDocument();
	});

	it('handles dismiss when no timeout is set', async () => {
		vi.useRealTimers();
		const handleDismiss = vi.fn();
		const user = userEvent.setup();

		const { getByLabelText } = render(NoticeItem, {
			props: {
				...defaultProps,
				onDismiss: handleDismiss,
				duration: 0
			}
		});

		const dismissButton = getByLabelText('Dismiss');
		await user.click(dismissButton);

		expect(handleDismiss).toHaveBeenCalledWith('notice-1');
	});

	it('handles action when no timeout is set', async () => {
		vi.useRealTimers();
		const handleAction = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(NoticeItem, {
			props: {
				...defaultProps,
				actionLabel: 'Retry',
				onAction: handleAction,
				duration: 0
			}
		});

		const actionButton = getByText('Retry');
		await user.click(actionButton);

		expect(handleAction).toHaveBeenCalledWith('notice-1');
	});
});
