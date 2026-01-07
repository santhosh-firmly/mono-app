<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import OtpPage from '$lib/components/pages/auth/otp-page.svelte';

	let email = $derived($page.url.searchParams.get('email') || '');

	let otp = $state(['', '', '', '', '', '']);
	let error = $state('');
	let isVerifying = $state(false);
	let isResending = $state(false);

	function handleOtpChange(newOtp) {
		otp = newOtp;
		error = '';
	}

	async function handleVerify() {
		const otpValue = otp.join('');
		if (otpValue.length !== 6) {
			error = 'Please enter the complete 6-digit code';
			return;
		}

		isVerifying = true;
		error = '';

		try {
			const response = await fetch('/api/login/otp/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: otpValue })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Invalid code. Please try again.';
				isVerifying = false;
				return;
			}

			// Redirect to dashboard
			goto(data.redirectTo || '/');
		} catch {
			error = 'Verification failed. Please try again.';
		} finally {
			isVerifying = false;
		}
	}

	async function handleResend() {
		isResending = true;
		error = '';

		try {
			const response = await fetch('/api/login/otp/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (!response.ok) {
				const data = await response.json();
				error = data.error || 'Failed to resend code';
			} else {
				otp = ['', '', '', '', '', ''];
				// Focus first input
				const input = document.getElementById('otp-0');
				if (input) input.focus();
			}
		} catch {
			error = 'Failed to resend code. Please try again.';
		} finally {
			isResending = false;
		}
	}

	function handleBack() {
		goto('/login');
	}
</script>

<OtpPage
	{email}
	{otp}
	{error}
	{isVerifying}
	{isResending}
	onOtpChange={handleOtpChange}
	onVerify={handleVerify}
	onResend={handleResend}
	onBack={handleBack}
/>
