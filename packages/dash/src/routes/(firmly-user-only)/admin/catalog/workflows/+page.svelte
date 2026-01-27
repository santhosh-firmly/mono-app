<script>
	import { onMount } from 'svelte';
	import WorkflowsPage from '$lib/components/admin/catalog/pages/workflows-page.svelte';
	import productDetailsApi from '$lib/api/catalog/product-details-client.js';

	// Data
	let pdStats = $state(null);
	let loading = $state(true);
	let error = $state(null);

	// Filters
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let sortBy = $state('pending_desc');

	// Bulk operations
	let startingBulk = $state(false);
	let triggeringDomain = $state(null);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;
		try {
			pdStats = await productDetailsApi.crossDomainStats.getStats();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	async function triggerWorkflow(domain) {
		triggeringDomain = domain.domain;
		try {
			await productDetailsApi.workflows.trigger(domain.domain, domain.countryCode, {
				limit: 'ALL'
			});
			await loadData();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to trigger workflow';
		} finally {
			triggeringDomain = null;
		}
	}

	async function startBulkWorkflows() {
		const domainsWithPending = pdStats?.domains?.filter((d) => d.pending > 0) || [];
		if (domainsWithPending.length === 0) {
			return;
		}

		startingBulk = true;

		try {
			for (const domain of domainsWithPending) {
				try {
					await productDetailsApi.workflows.trigger(domain.domain, domain.countryCode, {
						limit: 'ALL'
					});
				} catch {
					// Continue with other domains
				}
			}
			await loadData();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to start bulk workflows';
		} finally {
			startingBulk = false;
		}
	}
</script>

<WorkflowsPage
	{pdStats}
	{statusFilter}
	{sortBy}
	{searchQuery}
	{loading}
	{startingBulk}
	{triggeringDomain}
	{error}
	onRefresh={loadData}
	onTriggerWorkflow={triggerWorkflow}
	onStartBulkWorkflows={startBulkWorkflows}
	onStatusFilterChange={(value) => (statusFilter = value)}
	onSortByChange={(value) => (sortBy = value)}
	onSearchQueryChange={(value) => (searchQuery = value)}
	onDismissError={() => (error = null)}
/>
