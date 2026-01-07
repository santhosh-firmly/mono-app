<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrdersPage from './orders-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Merchant/Orders',
		component: OrdersPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	import { mockOrdersList } from '$lib/mocks/index.js';

	const destinations = [
		{ key: 'app_partner1', name: 'Partner Store A' },
		{ key: 'app_partner2', name: 'Partner Store B' },
		{ key: 'app_partner3', name: 'Marketplace C' }
	];

	const ordersWithPartners = mockOrdersList.map((order, i) => ({
		...order,
		app_id: destinations[i % destinations.length].key
	}));

	// For pagination demo - more orders
	const manyOrders = Array.from({ length: 50 }, (_, i) => ({
		id: `ord_${String(i + 1).padStart(3, '0')}`,
		platform_order_number: String(1100 + i),
		app_id: destinations[i % destinations.length].key,
		created_dt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
		order_total: Math.round(Math.random() * 500 * 100) / 100
	}));
</script>

<Story name="Default">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={ordersWithPartners}
				{destinations}
				total={ordersWithPartners.length}
				loading={false}
				error=""
				searchValue=""
				currentPage={1}
				limit={25}
				onSearch={() => {}}
				onPageChange={() => {}}
				onViewOrder={(id) => console.log('View order:', id)}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={[]}
				destinations={[]}
				total={0}
				loading={true}
				error=""
				searchValue=""
				currentPage={1}
				limit={25}
				onSearch={() => {}}
				onPageChange={() => {}}
				onViewOrder={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={[]}
				destinations={[]}
				total={0}
				loading={false}
				error=""
				searchValue=""
				currentPage={1}
				limit={25}
				onSearch={() => {}}
				onPageChange={() => {}}
				onViewOrder={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Empty Search Results">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={[]}
				destinations={[]}
				total={0}
				loading={false}
				error=""
				searchValue="xyz123"
				currentPage={1}
				limit={25}
				onSearch={() => {}}
				onPageChange={() => {}}
				onViewOrder={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={[]}
				destinations={[]}
				total={0}
				loading={false}
				error="Failed to load orders. Please try again."
				searchValue=""
				currentPage={1}
				limit={25}
				onSearch={() => {}}
				onPageChange={() => {}}
				onViewOrder={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Pagination">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={manyOrders.slice(0, 25)}
				{destinations}
				total={50}
				loading={false}
				error=""
				searchValue=""
				currentPage={1}
				limit={25}
				onSearch={() => {}}
				onPageChange={(page) => console.log('Go to page:', page)}
				onViewOrder={() => {}}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Page 2">
	{#snippet template()}
		<div class="p-6">
			<OrdersPage
				orders={manyOrders.slice(25, 50)}
				{destinations}
				total={50}
				loading={false}
				error=""
				searchValue=""
				currentPage={2}
				limit={25}
				onSearch={() => {}}
				onPageChange={(page) => console.log('Go to page:', page)}
				onViewOrder={() => {}}
			/>
		</div>
	{/snippet}
</Story>
