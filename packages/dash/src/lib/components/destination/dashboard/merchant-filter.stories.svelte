<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantFilter from './merchant-filter.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Dashboard/Merchant Filter',
		component: MerchantFilter,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script>
	const mockMerchants = [
		{ domain: 'acme.com', displayName: 'Acme Corp' },
		{ domain: 'example.com', displayName: 'Example Store' },
		{ domain: 'myshop.com', displayName: 'My Shop' },
		{ domain: 'bestgoods.com', displayName: 'Best Goods' },
		{ domain: 'qualityitems.com', displayName: 'Quality Items' }
	];
</script>

{#snippet template(args)}
	<MerchantFilter
		merchants={args.merchants}
		selectedMerchant={args.selectedMerchant}
		onchange={(value) => console.log('Selected:', value)}
	/>
{/snippet}

<Story
	name="Default - All Merchants"
	args={{
		merchants: mockMerchants,
		selectedMerchant: null
	}}
	{template}
/>

<Story
	name="With Selection"
	args={{
		merchants: mockMerchants,
		selectedMerchant: 'acme.com'
	}}
	{template}
/>

<Story
	name="Few Merchants"
	args={{
		merchants: [
			{ domain: 'acme.com', displayName: 'Acme Corp' },
			{ domain: 'example.com', displayName: 'Example Store' }
		],
		selectedMerchant: null
	}}
	{template}
/>

<Story
	name="Empty List"
	args={{
		merchants: [],
		selectedMerchant: null
	}}
	{template}
/>
