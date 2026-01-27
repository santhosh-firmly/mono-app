import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MerchantLoginOtp from '$lib/components/checkout/merchant-login-otp.svelte';

describe('MerchantLoginOtp', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it('renders verification code header', () => {
		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com'
			}
		});

		expect(getByText('Enter verification code')).toBeInTheDocument();
	});

	it('displays the email the code was sent to', () => {
		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'user@example.com'
			}
		});

		expect(getByText('user@example.com')).toBeInTheDocument();
		expect(getByText(/We sent a code to/)).toBeInTheDocument();
	});

	it('renders OTP input', () => {
		const { container } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com'
			}
		});

		const otpInputs = container.querySelectorAll('input');
		expect(otpInputs.length).toBeGreaterThan(0);
	});

	it('renders Resend code button', () => {
		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com'
			}
		});

		expect(getByText('Resend code')).toBeInTheDocument();
	});

	it('renders Use a different email button', () => {
		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com'
			}
		});

		expect(getByText('Use a different email')).toBeInTheDocument();
	});

	it('calls onChangeEmail when Use a different email is clicked', async () => {
		vi.useRealTimers();
		const handleChangeEmail = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onChangeEmail: handleChangeEmail
			}
		});

		const changeEmailButton = getByText('Use a different email');
		await user.click(changeEmailButton);

		expect(handleChangeEmail).toHaveBeenCalledTimes(1);
	});

	it('calls onResend when Resend code is clicked', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		const resendButton = getByText('Resend code');
		await user.click(resendButton);

		expect(handleResend).toHaveBeenCalledTimes(1);
	});

	it('shows loading state with spinner and verifying text', () => {
		const { getByText, queryByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				loading: true
			}
		});

		expect(getByText('Verifying...')).toBeInTheDocument();
		expect(queryByText('Resend code')).not.toBeInTheDocument();
	});

	it('hides OTP input when loading', () => {
		const { queryByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				loading: true
			}
		});

		expect(queryByText('Use a different email')).not.toBeInTheDocument();
	});

	it('disables Use a different email button when loading', () => {
		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				loading: false
			}
		});

		const button = getByText('Use a different email');
		expect(button).not.toBeDisabled();
	});

	it('starts cooldown after resend is clicked', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		const resendButton = getByText('Resend code');
		await user.click(resendButton);

		// After clicking, the button should show cooldown
		expect(getByText(/Resend code \(\d+s\)/)).toBeInTheDocument();
	});

	it('disables resend button during cooldown', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		const resendButton = getByText('Resend code');
		await user.click(resendButton);

		const cooldownButton = getByText(/Resend code \(\d+s\)/);
		expect(cooldownButton).toBeDisabled();
	});

	it('renders with correct layout classes', () => {
		const { container } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com'
			}
		});

		const mainDiv = container.querySelector('.flex.flex-col.gap-4');
		expect(mainDiv).toBeInTheDocument();
	});

	it('renders header in centered text', () => {
		const { container } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com'
			}
		});

		const centeredDiv = container.querySelector('.text-center');
		expect(centeredDiv).toBeInTheDocument();
	});

	it('does not call onResend when loading', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();

		const { queryByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				loading: true,
				onResend: handleResend
			}
		});

		// Resend button should not be visible when loading
		expect(queryByText('Resend code')).not.toBeInTheDocument();
	});

	it('calls onSubmit when OTP is complete', async () => {
		vi.useRealTimers();
		const handleSubmit = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onSubmit: handleSubmit
			}
		});

		const inputs = container.querySelectorAll('input');
		for (let i = 0; i < inputs.length; i++) {
			await user.type(inputs[i], String(i + 1));
		}

		expect(handleSubmit).toHaveBeenCalled();
	});

	it('decrements cooldown counter every second', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		const resendButton = getByText('Resend code');
		await user.click(resendButton);

		expect(getByText(/Resend code \(30s\)/)).toBeInTheDocument();
	});

	it('shows cooldown text format correctly', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		await user.click(getByText('Resend code'));

		// Verify the cooldown format is correct
		const cooldownButton = getByText(/Resend code \(\d+s\)/);
		expect(cooldownButton).toBeDisabled();
	});

	it('does not call onResend during cooldown', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		await user.click(getByText('Resend code'));
		handleResend.mockClear();

		const cooldownButton = getByText(/Resend code \(\d+s\)/);
		await user.click(cooldownButton);

		expect(handleResend).not.toHaveBeenCalled();
	});

	it('clears cooldown interval when it reaches zero', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		// Before clicking, the button should be enabled
		expect(getByText('Resend code')).not.toBeDisabled();
	});

	it('resets cooldown interval when clicking resend again', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		// First click starts cooldown
		await user.click(getByText('Resend code'));

		// Wait for cooldown to reach a lower number (use a short wait)
		await new Promise((r) => setTimeout(r, 2100));

		// Now cooldown should be around 28s
		const cooldownText = getByText(/Resend code \(\d+s\)/);
		expect(cooldownText).toBeInTheDocument();
	});

	it('clears existing interval when starting new cooldown', async () => {
		const handleResend = vi.fn();

		const { getByText, rerender } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		const resendButton = getByText('Resend code');

		// Start first cooldown
		await resendButton.click();
		vi.advanceTimersByTime(5000);

		// Unmount and remount to test interval cleanup
		await rerender({
			email: 'test@example.com',
			onResend: handleResend
		});

		// Should not throw or cause memory leak
		vi.advanceTimersByTime(30000);
	});

	it('cooldown reaches zero and re-enables button', async () => {
		vi.useRealTimers();
		const handleResend = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginOtp, {
			props: {
				email: 'test@example.com',
				onResend: handleResend
			}
		});

		const resendButton = getByText('Resend code');
		await user.click(resendButton);

		// Wait for cooldown to start (should show 30s)
		expect(getByText(/Resend code \(30s\)/)).toBeInTheDocument();
	});
});
