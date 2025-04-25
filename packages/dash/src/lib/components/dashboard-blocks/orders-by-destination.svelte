<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { formatCurrency } from '$lib/currency.js';

	export let ordersByDestination;
	export let destinations;

	function getDestinationName(appId) {
		const dest = destinations.results.find((e) => e.key === appId);
		if (dest) {
			return `${JSON.parse(dest.info).subject} (***${appId.slice(-4)})`;
		}

		return appId;
	}
</script>

<Card.Root>
	<Card.Header class="px-7">
		<Card.Title>Orders by Desination</Card.Title>
		<Card.Description>Recent orders broken down by destination.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Destination</Table.Head>
					<Table.Head class="text-right">Total Orders</Table.Head>
					<Table.Head class="text-right">Net Sales</Table.Head>
					<Table.Head class="text-right">AOV</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each ordersByDestination.results as order, index}
					<Table.Row class="">
						<Table.Cell
							><div class="font-medium">{getDestinationName(order.app_id)}</div></Table.Cell
						>
						<Table.Cell class="text-right">{order.total_orders}</Table.Cell>
						<Table.Cell class="text-right">{formatCurrency(order.net_sales)}</Table.Cell>
						<Table.Cell class="text-right">{formatCurrency(order.aov)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
