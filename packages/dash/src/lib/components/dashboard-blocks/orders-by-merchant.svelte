<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { formatCurrency } from '$lib/currency.js';

	export let ordersByMerchant;
	export let merchants;

	function getMerchantName(domain) {
		const dest = merchants.results.find((e) => e.key === domain);
		if (dest) {
			return JSON.parse(dest.info).display_name || domain;
		}

		return domain;
	}
</script>

<Card.Root>
	<Card.Header class="px-7">
		<Card.Title>Orders by Merchant</Card.Title>
		<Card.Description>Recent orders broken down by merchant.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Merchant</Table.Head>
					<Table.Head class="text-right">Total Orders</Table.Head>
					<Table.Head class="text-right">Net Sales</Table.Head>
					<Table.Head class="text-right">AOV</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each ordersByMerchant.results as order, index (index)}
					<Table.Row class="">
						<Table.Cell>
							<div class="font-medium">{getMerchantName(order.shop_id)}</div>
							<div class="hidden text-sm text-muted-foreground md:inline">
								{order.shop_id}
							</div>
						</Table.Cell>
						<Table.Cell class="text-right">{order.total_orders}</Table.Cell>
						<Table.Cell class="text-right">{formatCurrency(order.net_sales)}</Table.Cell
						>
						<Table.Cell class="text-right">{formatCurrency(order.aov)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
