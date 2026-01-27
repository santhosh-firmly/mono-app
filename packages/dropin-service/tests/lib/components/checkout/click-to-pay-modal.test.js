import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ClickToPayModal from '$lib/components/checkout/click-to-pay-modal.svelte';

describe('ClickToPayModal', () => {
	const defaultProps = {
		show: true,
		otpDestination: {
			emails: ['test***@example.com'],
			phones: ['********0998']
		},
		network: 'mastercard',
		onSubmit: vi.fn(),
		onClose: vi.fn(),
		onResendOtp: vi.fn(),
		isLoading: false,
		error: '',
		showRememberMe: true,
		rememberMe: true
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
		document.body.style.overflow = '';
		document.body.style.height = '';
	});

	describe('modal visibility', () => {
		it('renders modal when show is true', () => {
			const { container } = render(ClickToPayModal, { props: defaultProps });
			const modal = container.querySelector('[role="dialog"]');
			expect(modal).toBeInTheDocument();
		});

		it('does not render modal when show is false', () => {
			const { container } = render(ClickToPayModal, {
				props: { ...defaultProps, show: false }
			});
			const modal = container.querySelector('[role="dialog"]');
			expect(modal).not.toBeInTheDocument();
		});
	});

	describe('destination display', () => {
		it('displays email destination', () => {
			const { getAllByText } = render(ClickToPayModal, {
				props: {
					...defaultProps,
					otpDestination: { emails: ['test***@example.com'], phones: [] }
				}
			});
			expect(getAllByText('test***@example.com').length).toBeGreaterThan(0);
		});

		it('displays phone destination when no email', () => {
			const { getAllByText } = render(ClickToPayModal, {
				props: {
					...defaultProps,
					otpDestination: { emails: [], phones: ['********0998'] }
				}
			});
			expect(getAllByText('********0998').length).toBeGreaterThan(0);
		});

		it('prefers email over phone for display', () => {
			const { getAllByText } = render(ClickToPayModal, { props: defaultProps });
			expect(getAllByText('test***@example.com').length).toBeGreaterThan(0);
		});

		it('displays network name', () => {
			const { getByText } = render(ClickToPayModal, { props: defaultProps });
			expect(getByText('mastercard')).toBeInTheDocument();
		});

		it('displays visa network', () => {
			const { getByText } = render(ClickToPayModal, {
				props: { ...defaultProps, network: 'visa' }
			});
			expect(getByText('visa')).toBeInTheDocument();
		});
	});

	describe('OTP submission', () => {
		it('calls onSubmit when OTP is complete', async () => {
			const onSubmit = vi.fn();
			const user = userEvent.setup();
			const { container } = render(ClickToPayModal, {
				props: { ...defaultProps, onSubmit }
			});

			const inputs = container.querySelectorAll('input[inputmode="numeric"]');
			await user.type(inputs[0], '123456');

			expect(onSubmit).toHaveBeenCalledWith('123456');
		});

		it('shows validating spinner when loading', () => {
			const { getByText } = render(ClickToPayModal, {
				props: { ...defaultProps, isLoading: true }
			});

			expect(getByText('Validating code...')).toBeInTheDocument();
		});
	});

	describe('resend functionality', () => {
		it('shows resend buttons for available channels', () => {
			const { getByTestId } = render(ClickToPayModal, { props: defaultProps });

			expect(getByTestId('send-otp-to-email')).toBeInTheDocument();
			expect(getByTestId('send-otp-to-sms')).toBeInTheDocument();
		});

		it('disables email button when no emails available', () => {
			const { getByTestId } = render(ClickToPayModal, {
				props: {
					...defaultProps,
					otpDestination: { emails: [], phones: ['********0998'] }
				}
			});

			expect(getByTestId('send-otp-to-email')).toBeDisabled();
		});

		it('disables phone button when no phones available', () => {
			const { getByTestId } = render(ClickToPayModal, {
				props: {
					...defaultProps,
					otpDestination: { emails: ['test***@example.com'], phones: [] }
				}
			});

			expect(getByTestId('send-otp-to-sms')).toBeDisabled();
		});

		it('calls onResendOtp with channel when clicked', async () => {
			const onResendOtp = vi.fn();
			const user = userEvent.setup();
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, onResendOtp }
			});

			await user.click(getByTestId('send-otp-to-email'));
			expect(onResendOtp).toHaveBeenCalledWith('EMAIL');
		});

		it('shows countdown after resend', async () => {
			const user = userEvent.setup();
			const { getByTestId, getByText } = render(ClickToPayModal, {
				props: defaultProps
			});

			await user.click(getByTestId('send-otp-to-email'));
			expect(getByText(/Resend code \(\d+ seconds\)/)).toBeInTheDocument();
		});
	});

	describe('remember me checkbox', () => {
		it('shows remember me checkbox when showRememberMe is true', () => {
			const { getByText } = render(ClickToPayModal, { props: defaultProps });
			expect(getByText('Remember me in this browser')).toBeInTheDocument();
		});

		it('hides remember me checkbox when showRememberMe is false', () => {
			const { queryByText } = render(ClickToPayModal, {
				props: { ...defaultProps, showRememberMe: false }
			});
			expect(queryByText('Remember me in this browser')).not.toBeInTheDocument();
		});
	});

	describe('error handling', () => {
		it('displays error message in OTP input', () => {
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, error: 'Invalid code' }
			});
			expect(getByTestId('otp-error')).toHaveTextContent('Invalid code');
		});

		it('applies error styling to inputs', () => {
			const { container } = render(ClickToPayModal, {
				props: { ...defaultProps, error: 'Invalid code' }
			});
			const inputs = container.querySelectorAll('input[inputmode="numeric"]');
			inputs.forEach((input) => {
				expect(input.className).toContain('border-red-600');
			});
		});
	});

	describe('close actions', () => {
		it('calls onClose when Not you button is clicked', async () => {
			const onClose = vi.fn();
			const user = userEvent.setup();
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, onClose }
			});

			await user.click(getByTestId('not-you-button'));
			expect(onClose).toHaveBeenCalled();
		});

		it('calls onClose when Enter card manually is clicked', async () => {
			const onClose = vi.fn();
			const user = userEvent.setup();
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, onClose }
			});

			await user.click(getByTestId('enter-card-manually-button'));
			expect(onClose).toHaveBeenCalled();
		});

		it('calls onClose when Escape key is pressed', async () => {
			const onClose = vi.fn();
			render(ClickToPayModal, { props: { ...defaultProps, onClose } });

			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(onClose).toHaveBeenCalled();
		});

		it('calls onClose when overlay is clicked', async () => {
			const onClose = vi.fn();
			const user = userEvent.setup();
			const { container } = render(ClickToPayModal, {
				props: { ...defaultProps, onClose }
			});

			const overlay = container.querySelector('button[aria-label="Close Modal"]');
			await user.click(overlay);
			expect(onClose).toHaveBeenCalled();
		});
	});

	describe('loading state', () => {
		it('shows spinner and hides OTP form when loading', () => {
			const { container, getByText, queryByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, isLoading: true }
			});
			const inputs = container.querySelectorAll('input[inputmode="numeric"]');
			expect(inputs.length).toBe(0);
			expect(getByText('Validating code...')).toBeInTheDocument();
			expect(queryByTestId('send-otp-to-email')).not.toBeInTheDocument();
		});

		it('keeps Not you button visible when loading', () => {
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, isLoading: true }
			});
			expect(getByTestId('not-you-button')).toBeDisabled();
		});
	});

	describe('body scroll lock', () => {
		it('locks body scroll when modal is shown', () => {
			render(ClickToPayModal, { props: defaultProps });
			expect(document.body.style.overflow).toBe('hidden');
		});

		it('unlocks body scroll when modal is hidden', async () => {
			const { rerender } = render(ClickToPayModal, { props: defaultProps });
			await rerender({ ...defaultProps, show: false });
			expect(document.body.style.overflow).toBe('auto');
		});
	});

	describe('accessibility', () => {
		it('has proper ARIA attributes', () => {
			const { container } = render(ClickToPayModal, { props: defaultProps });
			const dialog = container.querySelector('[role="dialog"]');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
			expect(dialog).toHaveAttribute('aria-labelledby', 'otp-modal-title');
		});

		it('has proper modal title', () => {
			const { container } = render(ClickToPayModal, { props: defaultProps });
			const title = container.querySelector('#otp-modal-title');
			expect(title).toHaveTextContent('Click to Pay has found your linked cards');
		});
	});

	describe('resend countdown', () => {
		it('does not call onResendOtp when countdown is active', async () => {
			const onResendOtp = vi.fn();
			const user = userEvent.setup();
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, onResendOtp }
			});

			await user.click(getByTestId('send-otp-to-email'));
			expect(onResendOtp).toHaveBeenCalledTimes(1);

			await user.click(getByTestId('send-otp-to-email'));
			expect(onResendOtp).toHaveBeenCalledTimes(1);
		});

		it('calls onResendOtp with SMS channel', async () => {
			const onResendOtp = vi.fn();
			const user = userEvent.setup();
			const { getByTestId } = render(ClickToPayModal, {
				props: { ...defaultProps, onResendOtp }
			});

			await user.click(getByTestId('send-otp-to-sms'));
			expect(onResendOtp).toHaveBeenCalledWith('SMS');
		});
	});

	describe('escape key handling', () => {
		it('does not call onClose when Escape is pressed and modal is hidden', async () => {
			const onClose = vi.fn();
			render(ClickToPayModal, { props: { ...defaultProps, show: false, onClose } });

			await fireEvent.keyDown(window, { key: 'Escape' });
			expect(onClose).not.toHaveBeenCalled();
		});

		it('ignores other key presses', async () => {
			const onClose = vi.fn();
			render(ClickToPayModal, { props: { ...defaultProps, onClose } });

			await fireEvent.keyDown(window, { key: 'Enter' });
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('empty destination handling', () => {
		it('handles empty otpDestination gracefully', () => {
			const { container } = render(ClickToPayModal, {
				props: {
					...defaultProps,
					otpDestination: { emails: [], phones: [] }
				}
			});
			expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		});

		it('handles undefined otpDestination properties', () => {
			const { container } = render(ClickToPayModal, {
				props: {
					...defaultProps,
					otpDestination: {}
				}
			});
			expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		});
	});

	describe('network display', () => {
		it('does not display network name when empty', () => {
			const { queryByText } = render(ClickToPayModal, {
				props: { ...defaultProps, network: '' }
			});
			expect(queryByText('mastercard')).not.toBeInTheDocument();
			expect(queryByText('visa')).not.toBeInTheDocument();
		});
	});

	describe('countdown timer', () => {
		it('starts countdown after resend click', async () => {
			const user = userEvent.setup();
			const { getByTestId, getByText } = render(ClickToPayModal, {
				props: defaultProps
			});

			await user.click(getByTestId('send-otp-to-email'));
			expect(getByText(/60 seconds/)).toBeInTheDocument();
		});

		it('clears countdown timer when Not you is clicked during countdown', async () => {
			const onClose = vi.fn();
			const user = userEvent.setup();
			const { getByTestId, getByText } = render(ClickToPayModal, {
				props: { ...defaultProps, onClose }
			});

			await user.click(getByTestId('send-otp-to-email'));
			expect(getByText(/60 seconds/)).toBeInTheDocument();

			await user.click(getByTestId('not-you-button'));
			expect(onClose).toHaveBeenCalled();
		});
	});

	describe('default props', () => {
		it('renders with minimal props', () => {
			const { container } = render(ClickToPayModal, {
				props: { show: true }
			});
			expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		});
	});
});
