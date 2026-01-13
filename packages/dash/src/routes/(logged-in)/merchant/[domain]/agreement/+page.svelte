<script>
	import { goto, invalidateAll } from '$app/navigation';
	import MerchantAgreement from '$lib/components/merchant/merchant-agreement.svelte';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { data } = $props();

	let isSubmitting = $state(false);
	let error = $state('');

	async function handleAccept() {
		isSubmitting = true;
		error = '';

		try {
			const response = await adminFetch(`/merchant/${data.domain}/api/agreement`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					browserInfo: navigator.userAgent
				})
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Failed to sign agreement';
				isSubmitting = false;
				return;
			}

			// Invalidate all data first, then redirect to dashboard
			await invalidateAll();
			goto(`/merchant/${data.domain}`);
		} catch {
			error = 'Failed to sign agreement. Please try again.';
			isSubmitting = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Merchant Agreement</h1>
		<p class="text-sm text-muted-foreground mt-1">
			Review and accept the terms to complete your onboarding
		</p>
	</div>

	{#if error}
		<div
			class="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4"
		>
			<p class="text-sm text-red-700 dark:text-red-400">{error}</p>
		</div>
	{/if}

	<MerchantAgreement
		domain={data.domain}
		isSigned={data.isSigned}
		signedInfo={data.signedInfo}
		{isSubmitting}
		onaccept={handleAccept}
		contentType={data.contentType}
		markdownContent={data.markdownContent}
		pdfUrl={data.pdfUrl}
		externallySigned={data.externallySigned}
	/>
</div>
