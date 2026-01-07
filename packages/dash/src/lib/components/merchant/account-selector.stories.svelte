<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AccountSelector from './account-selector.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Account Selector',
		component: AccountSelector,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			currentDomain: { control: 'text' }
		}
	});
</script>

<script>
	const singleMerchant = [
		{ domain: 'acme-store.myshopify.com', displayName: 'Acme Store', role: 'owner' }
	];

	const multipleMerchants = [
		{ domain: 'acme-store.myshopify.com', displayName: 'Acme Store', role: 'owner' },
		{ domain: 'tech-gadgets.myshopify.com', displayName: 'Tech Gadgets', role: 'admin' },
		{ domain: 'fashion-hub.myshopify.com', displayName: 'Fashion Hub', role: 'member' }
	];

	const manyMerchants = [
		{ domain: 'acme-store.myshopify.com', displayName: 'Acme Store', role: 'owner' },
		{ domain: 'tech-gadgets.myshopify.com', displayName: 'Tech Gadgets', role: 'admin' },
		{ domain: 'fashion-hub.myshopify.com', displayName: 'Fashion Hub', role: 'member' },
		{ domain: 'home-essentials.myshopify.com', displayName: 'Home Essentials', role: 'owner' },
		{ domain: 'sports-gear.myshopify.com', displayName: 'Sports Gear', role: 'admin' },
		{ domain: 'beauty-plus.myshopify.com', displayName: 'Beauty Plus', role: 'member' },
		{
			domain: 'outdoor-adventure.myshopify.com',
			displayName: 'Outdoor Adventure',
			role: 'owner'
		},
		{ domain: 'pet-paradise.myshopify.com', displayName: 'Pet Paradise', role: 'admin' }
	];

	const merchantsNoDisplayName = [
		{ domain: 'acme-store.myshopify.com', role: 'owner' },
		{ domain: 'tech-gadgets.myshopify.com', role: 'admin' },
		{ domain: 'fashion-hub.myshopify.com', role: 'member' }
	];
</script>

{#snippet template(args)}
	<AccountSelector {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		currentDomain: 'acme-store.myshopify.com',
		merchantAccess: multipleMerchants
	}}
	{template}
/>

<Story
	name="Single Merchant"
	args={{
		currentDomain: 'acme-store.myshopify.com',
		merchantAccess: singleMerchant
	}}
	{template}
/>

<Story
	name="Many Merchants (With Search)"
	args={{
		currentDomain: 'acme-store.myshopify.com',
		merchantAccess: manyMerchants
	}}
	{template}
/>

<Story
	name="Without Display Names"
	args={{
		currentDomain: 'acme-store.myshopify.com',
		merchantAccess: merchantsNoDisplayName
	}}
	{template}
/>

<Story
	name="Different Current Merchant"
	args={{
		currentDomain: 'fashion-hub.myshopify.com',
		merchantAccess: multipleMerchants
	}}
	{template}
/>
