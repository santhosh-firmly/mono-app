<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';

	export let data;
</script>

<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
	<Card.Root>
		<Card.Header class="px-7">
			<Card.Title>Merchants</Card.Title>
			<Card.Description>A list of all merchants you can control.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
				<DataTable data={data.merchants} columnFilters={data.columns} />
			</div>
		</Card.Content>
	</Card.Root>
</main>
