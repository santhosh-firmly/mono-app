<script>
	import DataTableFacetedFilter from '$lib/components/custom/data-table/data-table-faceted-filter.svelte';

	/**
	 * @type {{
	 *   merchants: Array<{domain: string, displayName: string}>,
	 *   destinations: Array<{appId: string, displayName: string}>,
	 *   selectedMerchants?: string[],
	 *   selectedDestinations?: string[]
	 * }}
	 */
	let {
		merchants = [],
		destinations = [],
		selectedMerchants = $bindable([]),
		selectedDestinations = $bindable([])
	} = $props();

	// Get display names for options
	let merchantOptions = $derived(merchants.map((m) => m.displayName));
	let destinationOptions = $derived(destinations.map((d) => d.displayName));
</script>

<div class="flex flex-wrap gap-2">
	<DataTableFacetedFilter
		title="Merchants"
		options={merchantOptions}
		bind:selectedOptions={selectedMerchants}
	/>
	<DataTableFacetedFilter
		title="Destinations"
		options={destinationOptions}
		bind:selectedOptions={selectedDestinations}
	/>
</div>
