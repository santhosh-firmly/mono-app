<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import GoBack from './go-back.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Go Back',
		component: GoBack,
		parameters: {
			layout: 'centered'
		},
		args: {
			logoUrl: 'https://cdn.shopify.com/s/files/1/1515/2714/files/LiquidIV_Logo.png',
			storeName: 'Liquid IV',
			onclick: fn()
		},
		argTypes: {
			logoUrl: {
				control: 'text',
				description: 'Logo URL'
			},
			storeName: {
				control: 'text',
				description: 'Store name to display'
			},
			isLoading: {
				control: 'boolean',
				description: 'Loading state'
			},
			onclick: {
				action: 'clicked',
				description: 'Click handler'
			}
		}
	});
</script>

{#snippet template(args)}
	<GoBack {...args} />
{/snippet}

<!-- With Logo -->
<Story name="With Logo" {template} />

<!-- With Store Name Only -->
<Story
	name="With Store Name"
	args={{
		logoUrl: null,
		storeName: 'Liquid IV'
	}}
	{template}
/>

<!-- Loading State -->
<Story
	name="Loading"
	args={{
		isLoading: true
	}}
	{template}
/>

<!-- Broken Logo Fallback -->
<Story
	name="Broken Logo Fallback"
	args={{
		logoUrl: 'https://invalid-url.com/logo.png',
		storeName: 'Liquid IV'
	}}
	{template}
/>
