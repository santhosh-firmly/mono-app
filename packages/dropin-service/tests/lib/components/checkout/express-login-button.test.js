import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ExpressLoginButton from '$lib/components/checkout/express-login-button.svelte';

describe('ExpressLoginButton', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders default sign in text when no email is provided', () => {
		const { getByText } = render(ExpressLoginButton, {
			props: {
				onclick: vi.fn()
			}
		});

		expect(getByText('Sign in for faster checkout')).toBeInTheDocument();
	});

	it('renders continue as text when email is provided', () => {
		const { getByText } = render(ExpressLoginButton, {
			props: {
				email: 'user@example.com',
				onclick: vi.fn()
			}
		});

		expect(getByText('Continue as')).toBeInTheDocument();
		expect(getByText('user@example.com')).toBeInTheDocument();
	});

	it('renders loading state with spinner and signing in text', () => {
		const { getByText, queryByText } = render(ExpressLoginButton, {
			props: {
				loading: true,
				onclick: vi.fn()
			}
		});

		expect(getByText('Signing in...')).toBeInTheDocument();
		expect(queryByText('Sign in for faster checkout')).not.toBeInTheDocument();
	});

	it('calls onclick when button is clicked', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(ExpressLoginButton, {
			props: {
				onclick: handleClick
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('does not call onclick when button is disabled', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		const { container } = render(ExpressLoginButton, {
			props: {
				disabled: true,
				onclick: handleClick
			}
		});

		const button = container.querySelector('button');
		await user.click(button);

		expect(handleClick).not.toHaveBeenCalled();
	});

	it('renders button with disabled attribute when disabled is true', () => {
		const { container } = render(ExpressLoginButton, {
			props: {
				disabled: true,
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveAttribute('disabled');
	});

	it('renders button without disabled attribute when disabled is false', () => {
		const { container } = render(ExpressLoginButton, {
			props: {
				disabled: false,
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).not.toHaveAttribute('disabled');
	});

	it('renders button with type button', () => {
		const { container } = render(ExpressLoginButton, {
			props: {
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveAttribute('type', 'button');
	});

	it('renders with proper styling classes', () => {
		const { container } = render(ExpressLoginButton, {
			props: {
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toHaveClass('flex');
		expect(button).toHaveClass('w-full');
		expect(button).toHaveClass('items-center');
		expect(button).toHaveClass('justify-center');
		expect(button).toHaveClass('rounded-lg');
	});

	it('shows loading state instead of email when loading', () => {
		const { getByText, queryByText } = render(ExpressLoginButton, {
			props: {
				loading: true,
				email: 'user@example.com',
				onclick: vi.fn()
			}
		});

		expect(getByText('Signing in...')).toBeInTheDocument();
		expect(queryByText('user@example.com')).not.toBeInTheDocument();
	});
});
