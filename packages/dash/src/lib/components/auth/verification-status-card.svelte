<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   status?: 'verifying' | 'success' | 'error',
	 *   errorMessage?: string,
	 *   successMessage?: string,
	 *   onretry?: () => void
	 * }}
	 */
	let {
		status = 'verifying',
		errorMessage = 'Verification failed. Please try again.',
		successMessage = "You're now signed in. Redirecting...",
		onretry
	} = $props();
</script>

<Card.Root class="w-full max-w-md shadow-2xl" style="background-color: white;">
	<Card.Header>
		<FirmlyLogo class="pb-6" />
		{#if status === 'verifying'}
			<Card.Title class="text-2xl">Verifying...</Card.Title>
			<Card.Description>Please wait while we verify your login link.</Card.Description>
		{:else if status === 'success'}
			<Card.Title class="text-2xl">Success!</Card.Title>
			<Card.Description>{successMessage}</Card.Description>
		{:else}
			<Card.Title class="text-2xl">Verification Failed</Card.Title>
			<Card.Description>{errorMessage}</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content class="flex flex-col items-center gap-4">
		{#if status === 'verifying'}
			<div class="spinner"></div>
		{:else if status === 'success'}
			<div class="success-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-16 w-16 text-green-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>
		{:else}
			<div class="error-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-16 w-16 text-red-500"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</div>
			<BrandedButton variant="primary" onclick={onretry}>Try Again</BrandedButton>
		{/if}
	</Card.Content>
</Card.Root>

<style>
	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #e5e7eb;
		border-top-color: #7979ff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
