<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import AnimatedBackground from '$lib/components/merchant/animated-background.svelte';
	import BrandedButton from '$lib/components/merchant/branded-button.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';

	/**
	 * @type {{
	 *   status: 'verifying' | 'success' | 'error',
	 *   errorMessage?: string,
	 *   onRetry?: () => void
	 * }}
	 */
	let { status = 'verifying', errorMessage = '', onRetry = () => {} } = $props();
</script>

<AnimatedBackground background="starry-night" layout="diagonal" />

<div class="card-container">
	<Card.Root class="w-full max-w-md shadow-2xl bg-card">
		<Card.Header>
			<FirmlyLogo class="pb-6" />
			{#if status === 'verifying'}
				<Card.Title class="text-2xl">Verifying...</Card.Title>
				<Card.Description>Please wait while we verify your login link.</Card.Description>
			{:else if status === 'success'}
				<Card.Title class="text-2xl">Success!</Card.Title>
				<Card.Description>You're now signed in. Redirecting...</Card.Description>
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
				<BrandedButton variant="primary" onclick={onRetry}>Try Again</BrandedButton>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<style>
	.card-container {
		position: relative;
		z-index: 10;
		display: flex;
		min-height: 100vh;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid hsl(var(--border));
		border-top-color: hsl(var(--primary));
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
