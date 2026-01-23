import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MerchantLoginEmail from '$lib/components/checkout/merchant-login-email.svelte';

describe('MerchantLoginEmail', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the sign in form', () => {
		const { getByText } = render(MerchantLoginEmail);

		expect(getByText('Sign in to your account')).toBeInTheDocument();
		expect(getByText('Enter your email to access your saved information')).toBeInTheDocument();
	});

	it('renders email input field', () => {
		const { container } = render(MerchantLoginEmail);

		const input = container.querySelector('input[type="email"]');
		expect(input).toBeInTheDocument();
	});

	it('renders Continue button', () => {
		const { getByText } = render(MerchantLoginEmail);

		expect(getByText('Continue')).toBeInTheDocument();
	});

	it('calls onSubmit when form is submitted with valid email', async () => {
		const handleSubmit = vi.fn();
		const user = userEvent.setup();

		const { container, getByText } = render(MerchantLoginEmail, {
			props: {
				onSubmit: handleSubmit
			}
		});

		const input = container.querySelector('input[type="email"]');
		await user.type(input, 'valid@example.com');

		const submitButton = getByText('Continue');
		await user.click(submitButton);

		expect(handleSubmit).toHaveBeenCalledWith('valid@example.com');
	});

	it('disables submit button when email is invalid', () => {
		const { getByText } = render(MerchantLoginEmail, {
			props: {
				email: 'invalid-email'
			}
		});

		const submitButton = getByText('Continue');
		expect(submitButton).toBeDisabled();
	});

	it('disables input when loading is true', () => {
		const { container } = render(MerchantLoginEmail, {
			props: {
				loading: true
			}
		});

		const input = container.querySelector('input[type="email"]');
		expect(input).toBeDisabled();
	});

	it('disables submit button when loading is true', () => {
		const { getByText } = render(MerchantLoginEmail, {
			props: {
				loading: true,
				email: 'valid@example.com'
			}
		});

		const submitButton = getByText('Sending code...');
		expect(submitButton).toBeDisabled();
	});

	it('shows loading text when loading is true', () => {
		const { getByText, queryByText } = render(MerchantLoginEmail, {
			props: {
				loading: true
			}
		});

		expect(getByText('Sending code...')).toBeInTheDocument();
		expect(queryByText('Continue')).not.toBeInTheDocument();
	});

	it('initializes with provided email value', () => {
		const { container } = render(MerchantLoginEmail, {
			props: {
				email: 'initial@example.com'
			}
		});

		const input = container.querySelector('input[type="email"]');
		expect(input).toHaveValue('initial@example.com');
	});

	it('does not submit when email is empty', async () => {
		const handleSubmit = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginEmail, {
			props: {
				onSubmit: handleSubmit
			}
		});

		const form = container.querySelector('form');
		await user.click(form.querySelector('button[type="submit"]'));

		expect(handleSubmit).not.toHaveBeenCalled();
	});

	it('does not submit when email has only whitespace', async () => {
		const handleSubmit = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginEmail, {
			props: {
				onSubmit: handleSubmit
			}
		});

		const input = container.querySelector('input[type="email"]');
		await user.type(input, '   ');

		const form = container.querySelector('form');
		await user.click(form.querySelector('button[type="submit"]'));

		expect(handleSubmit).not.toHaveBeenCalled();
	});

	it('renders form element', () => {
		const { container } = render(MerchantLoginEmail);

		const form = container.querySelector('form');
		expect(form).toBeInTheDocument();
	});

	it('renders with correct layout classes', () => {
		const { container } = render(MerchantLoginEmail);

		const form = container.querySelector('form');
		expect(form).toHaveClass('flex');
		expect(form).toHaveClass('flex-col');
		expect(form).toHaveClass('gap-4');
	});

	it('has email input with correct autocomplete attribute', () => {
		const { container } = render(MerchantLoginEmail);

		const input = container.querySelector('input[type="email"]');
		expect(input).toHaveAttribute('autocomplete', 'email');
	});

	it('renders submit button with type submit', () => {
		const { container } = render(MerchantLoginEmail);

		const submitButton = container.querySelector('button[type="submit"]');
		expect(submitButton).toBeInTheDocument();
	});
});
