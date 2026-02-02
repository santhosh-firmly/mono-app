<script>
	import { page } from '$app/stores';
	import OnboardingTasks from '$lib/components/merchant/onboarding-tasks.svelte';
	import { MerchantDashboard } from '$lib/components/merchant/dashboard/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { data } = $props();
	let domain = $derived($page.params.domain);

	// Check if skip param is present (temporary skip for this page load)
	let skipOnboarding = $derived($page.url.searchParams.get('skip') === 'true');

	// Determine if user can skip: either admin or merchant has allowSkipOnboarding enabled
	let canSkip = $derived(data.isFirmlyAdmin || data.allowSkipOnboarding);

	// Show dashboard if not onboarding or if skip param is set
	let showDashboard = $derived(!data.isOnboarding || skipOnboarding);

	let dashboardData = $state(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		if (showDashboard) {
			fetchDashboardData();
		}
	});

	async function fetchDashboardData() {
		loading = true;
		error = '';

		try {
			const response = await adminFetch(`/merchant/${domain}/api/dashboard`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch dashboard data');
			}

			dashboardData = result;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

{#if !showDashboard}
	<div class="max-w-2xl mx-auto">
		<OnboardingTasks
			domain={data.domain}
			statuses={data.onboardingProgress}
			kybStatus={data.kybStatus}
			goLiveStatus={data.goLiveStatus}
			{canSkip}
		/>
	</div>
{:else if loading}
	<div class="flex items-center justify-center py-12">
		<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
	</div>
{:else if error}
	<Card.Root>
		<Card.Content class="py-12 text-center text-red-600">
			{error}
		</Card.Content>
	</Card.Root>
{:else if dashboardData}
	<MerchantDashboard {dashboardData} userName={data.user?.name} />
{/if}
