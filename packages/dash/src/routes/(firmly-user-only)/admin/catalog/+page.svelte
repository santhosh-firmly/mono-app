<script>
	import { onMount } from 'svelte';
	import CatalogOverviewPage from '$lib/components/admin/catalog/pages/catalog-overview-page.svelte';
	import productDetailsApi from '$lib/api/catalog/product-details-client.js';
	import catalogApi from '$lib/api/catalog/client.js';

	// State
	let pdStats = $state(null);
	let runningWorkflows = $state(null);
	let loading = $state(true);
	let error = $state(null);

	onMount(() => {
		loadData();
	});

	async function loadData() {
		loading = true;
		error = null;

		try {
			const [stats, running] = await Promise.all([
				productDetailsApi.crossDomainStats.getStats(),
				productDetailsApi.crossDomainWorkflows.getRunning().catch(() => null)
			]);
			pdStats = stats;
			runningWorkflows = running;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	async function handleAddDomain(domain) {
		await catalogApi.workflows.start(domain, 'US');
		await loadData();
	}

	async function handleRunPipeline(selectedDomains) {
		for (const key of selectedDomains) {
			const [domain, countryCode] = key.split('/');
			await catalogApi.workflows.start(domain, countryCode);
		}
		await loadData();
	}
</script>

<CatalogOverviewPage
	{pdStats}
	{runningWorkflows}
	{loading}
	{error}
	onRefresh={loadData}
	onAddDomain={handleAddDomain}
	onRunPipeline={handleRunPipeline}
	onDismissError={() => (error = null)}
/>
