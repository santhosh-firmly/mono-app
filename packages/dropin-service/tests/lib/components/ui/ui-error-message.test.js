import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiErrorMessage from '$lib/components/ui/error-message.svelte';

describe('UiErrorMessage', () => {
	it('renders error message with error type', () => {
		const { getByText } = render(UiErrorMessage, {
			props: {
				message: 'Payment failed. Please try again.',
				type: 'error'
			}
		});

		const message = getByText('Payment failed. Please try again.');
		expect(message).toBeInTheDocument();
		expect(message).toHaveClass('text-red-600');
	});

	it('renders warning message with warning type', () => {
		const { getByText } = render(UiErrorMessage, {
			props: {
				message: 'Your session will expire in 5 minutes.',
				type: 'warning'
			}
		});

		const message = getByText('Your session will expire in 5 minutes.');
		expect(message).toBeInTheDocument();
		expect(message).toHaveClass('text-yellow-600');
	});

	it('renders info message with info type', () => {
		const { getByText } = render(UiErrorMessage, {
			props: {
				message: 'Your payment is being processed.',
				type: 'info'
			}
		});

		const message = getByText('Your payment is being processed.');
		expect(message).toBeInTheDocument();
		expect(message).toHaveClass('text-blue-600');
	});

	it('handles dismiss action', async () => {
		const handleDismiss = vi.fn();
		const user = userEvent.setup();

		const { getByRole } = render(UiErrorMessage, {
			props: {
				message: 'This message can be dismissed',
				type: 'error',
				onDismiss: handleDismiss
			}
		});

		const dismissButton = getByRole('button', { name: 'Dismiss' });
		expect(dismissButton).toBeInTheDocument();

		// Click dismiss button
		await user.click(dismissButton);
		expect(handleDismiss).toHaveBeenCalledTimes(1);
	});

	it('does not render when message is empty', () => {
		const { container } = render(UiErrorMessage, {
			props: {
				message: '',
				type: 'error'
			}
		});

		expect(container.querySelector('.rounded')).not.toBeInTheDocument();
	});

	it('falls back to error styling for invalid type', () => {
		const { getByText, container } = render(UiErrorMessage, {
			props: {
				message: 'Invalid type message',
				type: 'invalid-type'
			}
		});

		const message = getByText('Invalid type message');
		expect(message).toBeInTheDocument();
		expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
	});

	it('renders with default empty message', () => {
		const { container } = render(UiErrorMessage, {
			props: {}
		});

		expect(container.querySelector('.rounded')).not.toBeInTheDocument();
	});
});
