<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TopMerchantsCard from './top-merchants-card.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Dashboard/Top Merchants Card',
		component: TopMerchantsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<script>
	const mockTopMerchants = [
		{ domain: 'acme.com', displayName: 'Acme Corporation', revenue: 45230.5, orders: 128 },
		{ domain: 'example.com', displayName: 'Example Store', revenue: 32150.0, orders: 95 },
		{ domain: 'myshop.com', displayName: 'My Shop', revenue: 28750.75, orders: 82 },
		{ domain: 'bestgoods.com', displayName: 'Best Goods', revenue: 19420.25, orders: 54 },
		{ domain: 'qualityitems.com', displayName: 'Quality Items', revenue: 12890.0, orders: 37 }
	];

	const mockTopMerchantsSmall = [
		{ domain: 'acme.com', displayName: 'Acme Corporation', revenue: 5230.5, orders: 28 },
		{ domain: 'example.com', displayName: 'Example Store', revenue: 3150.0, orders: 15 }
	];
</script>

{#snippet template(args)}
	<div class="max-w-md">
		<TopMerchantsCard topMerchants={args.topMerchants} appId={args.appId} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		topMerchants: mockTopMerchants,
		appId: 'chatgpt'
	}}
	{template}
/>

<Story
	name="Few Merchants"
	args={{
		topMerchants: mockTopMerchantsSmall,
		appId: 'chatgpt'
	}}
	{template}
/>

<Story
	name="Single Merchant"
	args={{
		topMerchants: [
			{ domain: 'acme.com', displayName: 'Acme Corporation', revenue: 45230.5, orders: 128 }
		],
		appId: 'chatgpt'
	}}
	{template}
/>

<Story
	name="No Merchants"
	args={{
		topMerchants: [],
		appId: 'chatgpt'
	}}
	{template}
/>

<Story
	name="High Volume"
	args={{
		topMerchants: [
			{ domain: 'mega.com', displayName: 'Mega Store', revenue: 1250000.0, orders: 5420 },
			{ domain: 'super.com', displayName: 'Super Shop', revenue: 980000.0, orders: 4215 },
			{ domain: 'giant.com', displayName: 'Giant Retail', revenue: 750000.0, orders: 3890 },
			{ domain: 'big.com', displayName: 'Big Commerce', revenue: 420000.0, orders: 2150 },
			{ domain: 'large.com', displayName: 'Large Market', revenue: 280000.0, orders: 1450 }
		],
		appId: 'chatgpt'
	}}
	{template}
/>
