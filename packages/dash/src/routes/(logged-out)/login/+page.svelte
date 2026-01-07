<script>
	import { goto } from '$app/navigation';
	import LoginPage from '$lib/components/pages/auth/login-page.svelte';

	let email = $state('');
	let error = $state('');
	let isLoading = $state(false);
	let isLoadingOtp = $state(false);
	let emailSent = $state(false);
	let sentMethod = $state('');

	function handleEmailChange(value) {
		email = value;
		error = '';
	}

	async function handleMagicLink() {
		error = '';

		if (!email.trim()) {
			error = 'Please enter your email';
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/magic-link/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to send magic link';
				isLoading = false;
				return;
			}

			emailSent = true;
			sentMethod = 'magic';
		} catch {
			error = 'Failed to send magic link. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function handleOtpLogin() {
		error = '';

		if (!email.trim()) {
			error = 'Please enter your email';
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		isLoadingOtp = true;

		try {
			const response = await fetch('/api/login/otp/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Failed to send verification code';
				isLoadingOtp = false;
				return;
			}

			// Navigate to OTP verification page
			const params = new URLSearchParams({ email });
			goto(`login/otp?${params.toString()}`);
		} catch {
			error = 'Failed to send verification code. Please try again.';
		} finally {
			isLoadingOtp = false;
		}
	}

	function handleReset() {
		emailSent = false;
		sentMethod = '';
		email = '';
		error = '';
	}
</script>

<LoginPage
	{email}
	{error}
	{isLoading}
	{isLoadingOtp}
	{emailSent}
	{sentMethod}
	signupUrl="/signup/verify-domain"
	onEmailChange={handleEmailChange}
	onMagicLink={handleMagicLink}
	onOtpLogin={handleOtpLogin}
	onReset={handleReset}
/>
