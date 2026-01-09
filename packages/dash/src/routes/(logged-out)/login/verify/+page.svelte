<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import MagicLinkVerificationPage from '$lib/components/pages/auth/magic-link-verification-page.svelte';

	let status = $state('verifying'); // 'verifying' | 'success' | 'error'
	let errorMessage = $state('');

	onMount(async () => {
		const token = $page.url.searchParams.get('token');

		if (!token) {
			status = 'error';
			errorMessage = 'Invalid login link. Please request a new one.';
			return;
		}

		try {
			const response = await fetch('/api/magic-link/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});

			const data = await response.json();

			if (!response.ok) {
				status = 'error';
				errorMessage = data.error || 'Verification failed. Please try again.';
				return;
			}

			status = 'success';
			// Redirect to dashboard after a brief success message
			setTimeout(() => {
				goto(data.redirectTo || '/');
			}, 1500);
		} catch {
			status = 'error';
			errorMessage = 'Verification failed. Please try again.';
		}
	});

	function handleRetry() {
		goto('/login');
	}
</script>

<MagicLinkVerificationPage {status} {errorMessage} onRetry={handleRetry} />
