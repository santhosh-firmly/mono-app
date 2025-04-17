<script>
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';

	let { data } = $props();
</script>

<div class="flex flex-col gap-4 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight">Merchants</h1>
		<p class="text-muted-foreground">A list of all merchants you can control.</p>
	</div>

	<DataTable data={data.merchants} columnFilters={data.columns} />
</div>
