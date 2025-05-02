<script>
	import { onMount } from 'svelte';
	import DataTable from '$lib/components/custom/data-table/data-table.svelte';
	import PageHeader from '$lib/components/app/page-header.svelte';

	let { data } = $props();

	onMount(() => {
		window.dash = {
			merchants: {
				columns: data.columns
			}
		};
	});
</script>

<div class="flex flex-col gap-4 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<PageHeader title="Merchants" description="All merchants implemented by Firmly." />
	<DataTable data={data.merchants} columnFilters={data.columns} />
</div>
