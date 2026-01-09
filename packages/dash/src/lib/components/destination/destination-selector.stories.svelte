<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationSelector from './destination-selector.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Navigation/Selector',
		component: DestinationSelector,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script>
	const mockDestinations = [
		{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
		{ appId: 'claude', displayName: 'Claude', role: 'admin' },
		{ appId: 'gemini', displayName: 'Gemini', role: 'viewer' }
	];

	const mockMerchants = [
		{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
		{ domain: 'example.com', displayName: 'Example Store', role: 'admin' }
	];

	const manyDestinations = [
		{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
		{ appId: 'claude', displayName: 'Claude', role: 'admin' },
		{ appId: 'gemini', displayName: 'Gemini', role: 'viewer' },
		{ appId: 'copilot', displayName: 'GitHub Copilot', role: 'viewer' },
		{ appId: 'perplexity', displayName: 'Perplexity AI', role: 'admin' },
		{ appId: 'jasper', displayName: 'Jasper AI', role: 'viewer' }
	];

	const manyMerchants = [
		{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
		{ domain: 'example.com', displayName: 'Example Store', role: 'admin' },
		{ domain: 'myshop.com', displayName: 'My Shop', role: 'viewer' },
		{ domain: 'bestgoods.com', displayName: 'Best Goods', role: 'admin' }
	];
</script>

{#snippet template(args)}
	<DestinationSelector
		currentAppId={args.currentAppId}
		destinationAccess={args.destinationAccess}
		merchantAccess={args.merchantAccess}
	/>
{/snippet}

<Story
	name="Destinations Only"
	args={{
		currentAppId: 'chatgpt',
		destinationAccess: mockDestinations,
		merchantAccess: []
	}}
	{template}
/>

<Story
	name="Mixed - Destinations and Merchants"
	args={{
		currentAppId: 'chatgpt',
		destinationAccess: mockDestinations,
		merchantAccess: mockMerchants
	}}
	{template}
/>

<Story
	name="Single Destination"
	args={{
		currentAppId: 'chatgpt',
		destinationAccess: [{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' }],
		merchantAccess: []
	}}
	{template}
/>

<Story
	name="Many Dashboards (With Search)"
	args={{
		currentAppId: 'chatgpt',
		destinationAccess: manyDestinations,
		merchantAccess: manyMerchants
	}}
	{template}
/>

<Story
	name="Merchants Only"
	args={{
		currentAppId: 'chatgpt',
		destinationAccess: [{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' }],
		merchantAccess: manyMerchants
	}}
	{template}
/>

<Story
	name="Long Names"
	args={{
		currentAppId: 'enterprise-ai-platform',
		destinationAccess: [
			{
				appId: 'enterprise-ai-platform',
				displayName: 'Enterprise AI Platform Pro Edition',
				role: 'owner'
			},
			{ appId: 'basic', displayName: 'Basic AI Assistant', role: 'viewer' }
		],
		merchantAccess: [
			{
				domain: 'superlongdomainname.com',
				displayName: 'Super Long Company Name International',
				role: 'admin'
			}
		]
	}}
	{template}
/>
