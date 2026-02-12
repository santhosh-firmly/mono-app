<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import HeaderV2 from './header-v2.svelte';

	const { Story } = defineMeta({
		title: 'BuyNow/Header V2',
		component: HeaderV2,
		parameters: {
			layout: 'padded'
		},
		args: {
			onBackClick: fn()
		},
		argTypes: {
			presentation: { control: 'object' }
		}
	});
</script>

{#snippet template(args)}
	<HeaderV2 {...args} />
{/snippet}

<Story
	name="With Name"
	args={{ presentation: { displayName: 'The Firmly Store', largeLogo: null } }}
	{template}
/>

<Story
	name="With Logo"
	args={{
		presentation: {
			displayName: 'Liquid IV',
			largeLogo: 'https://cdn.shopify.com/s/files/1/1515/2714/files/LiquidIV_Logo.png'
		}
	}}
	{template}
/>

<Story name="Default Fallback" args={{ presentation: null }} {template} />
