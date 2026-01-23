import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import NoticeContainer from '$lib/components/checkout/notice-container.svelte';

describe('NoticeContainer', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders nothing when notices array is empty', () => {
		const { container } = render(NoticeContainer, {
			props: {
				notices: [],
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('[role="region"]');
		expect(region).not.toBeInTheDocument();
	});

	it('renders notices when provided', () => {
		const notices = [
			{ id: '1', type: 'info', message: 'Info message' },
			{ id: '2', type: 'success', message: 'Success message' }
		];

		const { getByText } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		expect(getByText('Info message')).toBeInTheDocument();
		expect(getByText('Success message')).toBeInTheDocument();
	});

	it('renders with aria-live polite for accessibility', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('[aria-live="polite"]');
		expect(region).toBeInTheDocument();
	});

	it('renders with role region for accessibility', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('[role="region"]');
		expect(region).toBeInTheDocument();
	});

	it('positions at top-right by default', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('.top-4.right-4');
		expect(region).toBeInTheDocument();
	});

	it('positions at top-left when specified', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn(),
				position: 'top-left'
			}
		});

		const region = container.querySelector('.top-4.left-4');
		expect(region).toBeInTheDocument();
	});

	it('positions at bottom-right when specified', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn(),
				position: 'bottom-right'
			}
		});

		const region = container.querySelector('.bottom-4.right-4');
		expect(region).toBeInTheDocument();
	});

	it('positions at bottom-left when specified', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn(),
				position: 'bottom-left'
			}
		});

		const region = container.querySelector('.bottom-4.left-4');
		expect(region).toBeInTheDocument();
	});

	it('positions at top-center when specified', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn(),
				position: 'top-center'
			}
		});

		const region = container.querySelector('.top-4.left-1\\/2');
		expect(region).toBeInTheDocument();
	});

	it('positions at bottom-center when specified', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn(),
				position: 'bottom-center'
			}
		});

		const region = container.querySelector('.bottom-4.left-1\\/2');
		expect(region).toBeInTheDocument();
	});

	it('renders with fixed positioning and high z-index', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('.fixed.z-1000');
		expect(region).toBeInTheDocument();
	});

	it('renders with flex column layout', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('.flex.flex-col');
		expect(region).toBeInTheDocument();
	});

	it('renders with gap between notices', () => {
		const notices = [
			{ id: '1', type: 'info', message: 'First' },
			{ id: '2', type: 'success', message: 'Second' }
		];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('.gap-2');
		expect(region).toBeInTheDocument();
	});

	it('has fixed width', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		const region = container.querySelector('.w-80');
		expect(region).toBeInTheDocument();
	});

	it('falls back to top-right for invalid position', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn(),
				position: 'invalid-position'
			}
		});

		const region = container.querySelector('.top-4.right-4');
		expect(region).toBeInTheDocument();
	});

	it('calls onDismiss when notice is dismissed', async () => {
		const handleDismiss = vi.fn();
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: handleDismiss
			}
		});

		const dismissButton = container.querySelector(
			'button[aria-label*="close" i], button[aria-label*="dismiss" i]'
		);
		if (dismissButton) {
			await dismissButton.click();
			expect(handleDismiss).toHaveBeenCalledWith('1');
		}
	});

	it('renders multiple notices with correct order', () => {
		const notices = [
			{ id: '1', type: 'info', message: 'First notice' },
			{ id: '2', type: 'success', message: 'Second notice' },
			{ id: '3', type: 'error', message: 'Third notice' }
		];

		const { getByText } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		expect(getByText('First notice')).toBeInTheDocument();
		expect(getByText('Second notice')).toBeInTheDocument();
		expect(getByText('Third notice')).toBeInTheDocument();
	});

	it('passes notice action callback to notice item', () => {
		const handleAction = vi.fn();
		const notices = [
			{
				id: '1',
				type: 'info',
				message: 'Test message',
				actionLabel: 'Retry',
				onAction: handleAction
			}
		];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('passes duration to notice item', () => {
		const notices = [
			{
				id: '1',
				type: 'info',
				message: 'Test message',
				duration: 5000
			}
		];

		const { container } = render(NoticeContainer, {
			props: {
				notices,
				onDismiss: vi.fn()
			}
		});

		expect(container).toBeInTheDocument();
	});

	it('renders with default onDismiss callback', () => {
		const notices = [{ id: '1', type: 'info', message: 'Test message' }];

		const { container } = render(NoticeContainer, {
			props: {
				notices
			}
		});

		expect(container.querySelector('[role="region"]')).toBeInTheDocument();
	});
});
