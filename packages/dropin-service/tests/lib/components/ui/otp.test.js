import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Otp from '$lib/components/ui/otp.svelte';

describe('Otp', () => {
	afterEach(() => {
		cleanup();
	});

	describe('rendering', () => {
		it('renders 6 input fields by default', () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');
			expect(inputs.length).toBe(6);
		});

		it('renders custom number of input fields', () => {
			const { container } = render(Otp, {
				props: { length: 4 }
			});
			const inputs = container.querySelectorAll('input');
			expect(inputs.length).toBe(4);
		});

		it('renders with correct aria labels', () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');
			inputs.forEach((input, index) => {
				expect(input.getAttribute('aria-label')).toBe(`OTP digit ${index + 1}`);
			});
		});

		it('renders with numeric inputmode', () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');
			inputs.forEach((input) => {
				expect(input.getAttribute('inputmode')).toBe('numeric');
			});
		});
	});

	describe('input behavior', () => {
		it('accepts single digit input', async () => {
			const user = userEvent.setup();
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			await user.type(inputs[0], '5');
			expect(inputs[0].value).toBe('5');
		});

		it('does not call onComplete for non-numeric input', async () => {
			const onComplete = vi.fn();
			const user = userEvent.setup();
			const { container } = render(Otp, {
				props: { onComplete }
			});
			const inputs = container.querySelectorAll('input');

			await user.type(inputs[0], 'abcdef');
			expect(onComplete).not.toHaveBeenCalled();
		});

		it('clears digit when empty input', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			await fireEvent.input(inputs[0], { target: { value: '5' } });
			expect(inputs[0].value).toBe('5');

			await fireEvent.input(inputs[0], { target: { value: '' } });
			expect(inputs[0].value).toBe('');
		});
	});

	describe('keyboard navigation', () => {
		it('handles backspace to delete current digit', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			await fireEvent.input(inputs[0], { target: { value: '5' } });
			expect(inputs[0].value).toBe('5');

			await fireEvent.keyDown(inputs[0], { key: 'Backspace' });
			expect(inputs[0].value).toBe('');
		});

		it('handles backspace to move to previous input', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			await fireEvent.input(inputs[0], { target: { value: '5' } });
			await fireEvent.keyDown(inputs[1], { key: 'Backspace' });

			expect(inputs[0].value).toBe('');
		});

		it('handles left arrow key', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			inputs[1].focus();
			await fireEvent.keyDown(inputs[1], { key: 'ArrowLeft' });

			expect(document.activeElement).toBe(inputs[0]);
		});

		it('handles right arrow key', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			inputs[0].focus();
			await fireEvent.keyDown(inputs[0], { key: 'ArrowRight' });

			expect(document.activeElement).toBe(inputs[1]);
		});

		it('does not move left from first input', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			inputs[0].focus();
			await fireEvent.keyDown(inputs[0], { key: 'ArrowLeft' });

			expect(document.activeElement).toBe(inputs[0]);
		});

		it('does not move right from last input', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			inputs[5].focus();
			await fireEvent.keyDown(inputs[5], { key: 'ArrowRight' });

			expect(document.activeElement).toBe(inputs[5]);
		});

		it('calls onComplete on Enter when complete', async () => {
			const onComplete = vi.fn();
			const user = userEvent.setup();
			const { container } = render(Otp, {
				props: { onComplete }
			});
			const inputs = container.querySelectorAll('input');

			await user.type(inputs[0], '123456');
			onComplete.mockClear();

			await fireEvent.keyDown(inputs[5], { key: 'Enter' });
			expect(onComplete).toHaveBeenCalledWith('123456');
		});
	});

	describe('paste functionality', () => {
		it('handles paste on first input', async () => {
			const onComplete = vi.fn();
			const { container } = render(Otp, {
				props: { onComplete }
			});
			const inputs = container.querySelectorAll('input');

			const pasteEvent = new ClipboardEvent('paste', {
				clipboardData: new DataTransfer()
			});
			pasteEvent.clipboardData.setData('text', '123456');
			await fireEvent(inputs[0], pasteEvent);

			expect(onComplete).toHaveBeenCalledWith('123456');
		});

		it('handles partial paste', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			const pasteEvent = new ClipboardEvent('paste', {
				clipboardData: new DataTransfer()
			});
			pasteEvent.clipboardData.setData('text', '123');
			await fireEvent(inputs[0], pasteEvent);

			expect(inputs[0].value).toBe('1');
			expect(inputs[1].value).toBe('2');
			expect(inputs[2].value).toBe('3');
			expect(inputs[3].value).toBe('');
		});

		it('filters non-numeric characters from paste', async () => {
			const { container } = render(Otp);
			const inputs = container.querySelectorAll('input');

			const pasteEvent = new ClipboardEvent('paste', {
				clipboardData: new DataTransfer()
			});
			pasteEvent.clipboardData.setData('text', '1a2b3c');
			await fireEvent(inputs[0], pasteEvent);

			expect(inputs[0].value).toBe('1');
			expect(inputs[1].value).toBe('2');
			expect(inputs[2].value).toBe('3');
		});

		it('clears error on paste', async () => {
			const onClearError = vi.fn();
			const { container } = render(Otp, {
				props: { error: 'Invalid code', onClearError }
			});
			const inputs = container.querySelectorAll('input');

			const pasteEvent = new ClipboardEvent('paste', {
				clipboardData: new DataTransfer()
			});
			pasteEvent.clipboardData.setData('text', '123');
			await fireEvent(inputs[0], pasteEvent);

			expect(onClearError).toHaveBeenCalled();
		});
	});

	describe('callbacks', () => {
		it('calls onComplete when all digits entered', async () => {
			const onComplete = vi.fn();
			const user = userEvent.setup();
			const { container } = render(Otp, {
				props: { onComplete }
			});
			const inputs = container.querySelectorAll('input');

			await user.type(inputs[0], '123456');
			expect(onComplete).toHaveBeenCalledWith('123456');
		});

		it('calls onClearError when typing after error', async () => {
			const onClearError = vi.fn();
			const user = userEvent.setup();
			const { container } = render(Otp, {
				props: { error: 'Invalid code', onClearError }
			});
			const inputs = container.querySelectorAll('input');

			await user.type(inputs[0], '1');
			expect(onClearError).toHaveBeenCalled();
		});
	});

	describe('error state', () => {
		it('displays error message', () => {
			const { getByTestId } = render(Otp, {
				props: { error: 'Invalid verification code' }
			});
			expect(getByTestId('otp-error')).toHaveTextContent('Invalid verification code');
		});

		it('applies error styling to inputs', () => {
			const { container } = render(Otp, {
				props: { error: 'Invalid code' }
			});
			const inputs = container.querySelectorAll('input');
			inputs.forEach((input) => {
				expect(input.className).toContain('border-red-600');
			});
		});

		it('does not show error when empty', () => {
			const { queryByTestId } = render(Otp, {
				props: { error: '' }
			});
			expect(queryByTestId('otp-error')).not.toBeInTheDocument();
		});
	});

	describe('disabled state', () => {
		it('disables all inputs when disabled', () => {
			const { container } = render(Otp, {
				props: { disabled: true }
			});
			const inputs = container.querySelectorAll('input');
			inputs.forEach((input) => {
				expect(input).toBeDisabled();
			});
		});

		it('does not call onComplete when disabled', async () => {
			const onComplete = vi.fn();
			const { container } = render(Otp, {
				props: { disabled: true, onComplete }
			});
			const inputs = container.querySelectorAll('input');

			expect(inputs[0]).toBeDisabled();
			expect(onComplete).not.toHaveBeenCalled();
		});
	});

	describe('test ids', () => {
		it('has correct test ids for each input', () => {
			const { container } = render(Otp);
			for (let i = 0; i < 6; i++) {
				const input = container.querySelector(`[data-testid="otp-field-${i}"]`);
				expect(input).toBeInTheDocument();
			}
		});
	});
});
