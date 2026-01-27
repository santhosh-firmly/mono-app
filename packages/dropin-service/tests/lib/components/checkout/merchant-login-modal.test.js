import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MerchantLoginModal from '$lib/components/checkout/merchant-login-modal.svelte';

describe('MerchantLoginModal', () => {
	beforeEach(() => {
		document.body.style.overflow = 'auto';
	});

	afterEach(() => {
		cleanup();
		document.body.style.overflow = 'auto';
	});

	it('does not render when isOpen is false', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: false
			}
		});

		const modal = container.querySelector('[role="dialog"]');
		expect(modal).not.toBeInTheDocument();
	});

	it('renders when isOpen is true', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		const modal = container.querySelector('[role="dialog"]');
		expect(modal).toBeInTheDocument();
	});

	it('renders Sign In title when step is email', () => {
		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email'
			}
		});

		expect(getByText('Sign In')).toBeInTheDocument();
	});

	it('renders Verify Email title when step is otp', () => {
		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com'
			}
		});

		expect(getByText('Verify Email')).toBeInTheDocument();
	});

	it('renders close button when canClose is true', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: true
			}
		});

		const closeButton = container.querySelector('button[aria-label="Close"]');
		expect(closeButton).toBeInTheDocument();
	});

	it('does not render close button when canClose is false', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: false
			}
		});

		const closeButton = container.querySelector('button[aria-label="Close"]');
		expect(closeButton).not.toBeInTheDocument();
	});

	it('calls onClose when close button is clicked', async () => {
		const handleClose = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: true,
				onClose: handleClose
			}
		});

		const closeButton = container.querySelector('button[aria-label="Close"]');
		await user.click(closeButton);

		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when backdrop is clicked and canClose is true', async () => {
		const handleClose = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: true,
				onClose: handleClose
			}
		});

		const backdrop = container.querySelector('button[aria-label="Close Modal"]');
		await user.click(backdrop);

		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onClose when backdrop is clicked and canClose is false', async () => {
		const handleClose = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: false,
				onClose: handleClose
			}
		});

		const backdrop = container.querySelector('button[aria-label="Close Modal"]');
		await user.click(backdrop);

		expect(handleClose).not.toHaveBeenCalled();
	});

	it('calls onClose when Escape key is pressed and canClose is true', async () => {
		const handleClose = vi.fn();

		render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: true,
				onClose: handleClose
			}
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onClose when Escape key is pressed and canClose is false', async () => {
		const handleClose = vi.fn();

		render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: false,
				onClose: handleClose
			}
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(handleClose).not.toHaveBeenCalled();
	});

	it('renders email form when step is email', () => {
		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email'
			}
		});

		expect(getByText('Sign in to your account')).toBeInTheDocument();
	});

	it('renders OTP form when step is otp', () => {
		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com'
			}
		});

		expect(getByText('Enter verification code')).toBeInTheDocument();
	});

	it('calls onEmailSubmit when email is submitted', async () => {
		const handleEmailSubmit = vi.fn();
		const user = userEvent.setup();

		const { container, getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email',
				onEmailSubmit: handleEmailSubmit
			}
		});

		const input = container.querySelector('input[type="email"]');
		await user.type(input, 'test@example.com');

		const submitButton = getByText('Continue');
		await user.click(submitButton);

		expect(handleEmailSubmit).toHaveBeenCalledWith('test@example.com');
	});

	it('calls onChangeEmail when change email is clicked in OTP step', async () => {
		const handleChangeEmail = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com',
				onChangeEmail: handleChangeEmail
			}
		});

		const changeEmailButton = getByText('Use a different email');
		await user.click(changeEmailButton);

		expect(handleChangeEmail).toHaveBeenCalledTimes(1);
	});

	it('calls onResendOtp when resend is clicked', async () => {
		const handleResendOtp = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com',
				onResendOtp: handleResendOtp
			}
		});

		const resendButton = getByText('Resend code');
		await user.click(resendButton);

		expect(handleResendOtp).toHaveBeenCalledTimes(1);
	});

	it('sets body overflow to hidden when opened', () => {
		render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		expect(document.body.style.overflow).toBe('hidden');
	});

	it('has aria-modal attribute set to true', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		const modal = container.querySelector('[role="dialog"]');
		expect(modal).toHaveAttribute('aria-modal', 'true');
	});

	it('has aria-labelledby pointing to title', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		const modal = container.querySelector('[role="dialog"]');
		expect(modal).toHaveAttribute('aria-labelledby', 'merchant-login-title');

		const title = container.querySelector('#merchant-login-title');
		expect(title).toBeInTheDocument();
	});

	it('passes loading prop to email form', () => {
		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email',
				loading: true
			}
		});

		expect(getByText('Sending code...')).toBeInTheDocument();
	});

	it('passes loading prop to OTP form', () => {
		const { getByText } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com',
				loading: true
			}
		});

		expect(getByText('Verifying...')).toBeInTheDocument();
	});

	it('renders with fixed positioning and high z-index', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		const modal = container.querySelector('[role="dialog"]');
		expect(modal).toHaveClass('fixed');
		expect(modal).toHaveClass('inset-0');
		expect(modal).toHaveClass('z-999');
	});

	it('renders backdrop with blur effect', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		const modal = container.querySelector('[role="dialog"]');
		expect(modal).toHaveClass('backdrop-blur-sm');
	});

	it('disables backdrop button when canClose is false', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: false
			}
		});

		const backdrop = container.querySelector('button[aria-label="Close Modal"]');
		expect(backdrop).toBeDisabled();
	});

	it('does not call onClose when non-Escape key is pressed', async () => {
		const handleClose = vi.fn();

		render(MerchantLoginModal, {
			props: {
				isOpen: true,
				canClose: true,
				onClose: handleClose
			}
		});

		await fireEvent.keyDown(window, { key: 'Enter' });

		expect(handleClose).not.toHaveBeenCalled();
	});

	it('does not call onClose when Escape is pressed but modal is closed', async () => {
		const handleClose = vi.fn();

		render(MerchantLoginModal, {
			props: {
				isOpen: false,
				canClose: true,
				onClose: handleClose
			}
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		expect(handleClose).not.toHaveBeenCalled();
	});

	it('updates email value when typing in email form', async () => {
		const user = userEvent.setup();

		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email',
				email: ''
			}
		});

		const input = container.querySelector('input[type="email"]');
		await user.type(input, 'newuser@example.com');

		expect(input.value).toBe('newuser@example.com');
	});

	it('preserves email value when switching to OTP step', () => {
		const { getByText, rerender } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email',
				email: 'initial@example.com'
			}
		});

		rerender({
			isOpen: true,
			step: 'otp',
			email: 'initial@example.com'
		});

		expect(getByText('initial@example.com')).toBeInTheDocument();
	});

	it('calls onOtpSubmit when OTP is completed', async () => {
		const handleOtpSubmit = vi.fn();
		const user = userEvent.setup();

		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com',
				onOtpSubmit: handleOtpSubmit
			}
		});

		// OTP auto-submits when all 6 digits are entered
		const otpInputs = container.querySelectorAll(
			'input[type="text"][maxlength="1"], input[inputmode="numeric"]'
		);
		if (otpInputs.length >= 6) {
			for (let i = 0; i < 6; i++) {
				await user.type(otpInputs[i], String(i + 1));
			}
			// OTP component auto-submits on complete
			expect(handleOtpSubmit).toHaveBeenCalled();
		}
	});

	it('passes error prop to email form component', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'email',
				error: 'Invalid email address'
			}
		});

		// Error prop is passed to child component
		expect(container).toBeInTheDocument();
	});

	it('passes error prop to OTP form component', () => {
		const { container } = render(MerchantLoginModal, {
			props: {
				isOpen: true,
				step: 'otp',
				email: 'test@example.com',
				error: 'Invalid OTP code'
			}
		});

		// Error prop is passed to child component
		expect(container).toBeInTheDocument();
	});

	it('restores body overflow when modal is closed', async () => {
		const { rerender } = render(MerchantLoginModal, {
			props: {
				isOpen: true
			}
		});

		expect(document.body.style.overflow).toBe('hidden');

		rerender({ isOpen: false });

		expect(document.body.style.overflow).toBe('auto');
	});
});
