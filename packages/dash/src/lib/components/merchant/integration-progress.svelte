<script>
	import { onMount, onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import BrandedProgress from './branded-progress.svelte';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Circle from 'lucide-svelte/icons/circle';
	import Loader from 'lucide-svelte/icons/loader-2';
	import Clock from 'lucide-svelte/icons/clock';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { domain = '', isFirmlyAdmin = false } = $props();

	let steps = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let refreshInterval = null;

	let completedSteps = $derived(steps.filter((step) => step.status === 'completed').length);
	let totalSteps = $derived(steps.length);
	let progressPercentage = $derived(totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0);
	let isComplete = $derived(totalSteps > 0 && completedSteps === totalSteps);

	onMount(async () => {
		await fetchIntegrationStatus(true);

		// Start polling every 10 seconds
		refreshInterval = setInterval(async () => {
			// Stop polling if integration is complete
			if (isComplete) {
				clearInterval(refreshInterval);
				refreshInterval = null;
				return;
			}
			await fetchIntegrationStatus(false);
		}, 10000);
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	});

	async function fetchIntegrationStatus(isInitialLoad = false) {
		try {
			// Only show loading spinner on initial load
			if (isInitialLoad) {
				loading = true;
			}
			error = null;

			// When isFirmlyAdmin is true (called from admin pages), always include admin_mode
			// Otherwise, use adminFetch which checks sessionStorage
			let url = `/merchant/${domain}/api/integration-status`;
			if (isFirmlyAdmin) {
				url += '?admin_mode=true';
			}

			const response = isFirmlyAdmin ? await fetch(url) : await adminFetch(url);

			if (!response.ok) {
				throw new Error('Failed to fetch integration status');
			}

			const data = await response.json();
			steps = data.steps || [];
		} catch (err) {
			console.error('Error fetching integration status:', err);
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function formatTimestamp(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Card.Root class="w-full">
	<Card.Header class="pb-3">
		<Card.Title class="text-base">Integration Progress</Card.Title>
		<Card.Description class="text-sm">
			Integration status for {domain}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		{#if loading}
			<div class="flex items-center justify-center py-8">
				<Loader class="h-6 w-6 animate-spin text-primary" />
			</div>
		{:else if error}
			<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
				{error}
			</div>
		{:else}
			<div class="space-y-2">
				<div class="flex justify-between text-xs text-muted-foreground">
					<span>Progress</span>
					<span>{completedSteps} of {totalSteps} completed</span>
				</div>
				<BrandedProgress value={progressPercentage} color="green" />
			</div>

			<div class="space-y-3">
				{#each steps as step, index (step.id)}
					<div>
						<div class="flex items-start gap-2 transition-all duration-300">
							<div class="mt-0.5 flex-shrink-0">
								{#if step.status === 'completed'}
									<CheckCircle class="h-5 w-5 text-green-600" />
								{:else if step.status === 'in-progress'}
									<Loader class="h-5 w-5 animate-spin text-primary" />
								{:else}
									<Circle class="h-5 w-5 text-gray-300" />
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-2">
									<p
										class={[
											'text-sm transition-colors duration-300',
											step.status === 'completed'
												? 'text-green-600'
												: step.status === 'in-progress'
													? 'text-primary'
													: 'text-muted-foreground'
										]}
									>
										Step {index + 1}: {step.title}
									</p>
									{#if isFirmlyAdmin && step.completedAt}
										<span
											class="flex items-center gap-1 text-nowrap text-xs text-muted-foreground"
										>
											<Clock class="h-3 w-3" />
											{formatTimestamp(step.completedAt)}
										</span>
									{/if}
								</div>
								{#if step.status === 'in-progress' && !step.substeps}
									<p class="mt-0.5 text-xs text-gray-500">In progress...</p>
								{/if}
							</div>
						</div>

						<!-- Substeps -->
						{#if step.substeps && (step.status === 'in-progress' || step.status === 'completed')}
							<div class="ml-7 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
								{#each step.substeps as subStep (subStep.id)}
									<div class="flex items-start gap-2 transition-all duration-300">
										<div class="mt-0.5 flex-shrink-0">
											{#if subStep.status === 'completed'}
												<CheckCircle class="h-4 w-4 text-green-600" />
											{:else if subStep.status === 'in-progress'}
												<Loader class="h-4 w-4 animate-spin text-primary" />
											{:else}
												<Circle class="h-4 w-4 text-gray-300" />
											{/if}
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center justify-between gap-2">
												<p
													class={[
														'text-xs transition-colors duration-300',
														subStep.status === 'completed'
															? 'text-green-600'
															: subStep.status === 'in-progress'
																? 'text-primary'
																: 'text-muted-foreground'
													]}
												>
													{subStep.title}
												</p>
												{#if isFirmlyAdmin && subStep.completedAt}
													<span
														class="text-nowrap text-xs text-muted-foreground"
													>
														{formatTimestamp(subStep.completedAt)}
													</span>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			{#if completedSteps === totalSteps && totalSteps > 0}
				<div class="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
					<div class="flex items-center gap-2">
						<CheckCircle class="h-4 w-4 text-green-600" />
						<p class="text-sm">Integration completed successfully!</p>
					</div>
				</div>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
