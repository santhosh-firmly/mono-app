<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantPageHeader from './merchant-page-header.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Plus from 'lucide-svelte/icons/plus';

	const { Story } = defineMeta({
		title: 'Merchant/Merchant Page Header',
		component: MerchantPageHeader,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			title: { control: 'text' },
			description: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<MerchantPageHeader {...args} />
{/snippet}

{#snippet withButtonTemplate(args)}
	<MerchantPageHeader {...args}>
		<Button>
			<Plus class="mr-2 h-4 w-4" />
			Add New
		</Button>
	</MerchantPageHeader>
{/snippet}

<Story
	name="Default"
	args={{
		title: 'Orders',
		description: 'View and manage your orders.'
	}}
	{template}
/>

<Story
	name="With Action Button"
	args={{
		title: 'Team',
		description: 'Manage who has access to this dashboard.'
	}}
	{withButtonTemplate}
/>

<Story
	name="Without Description"
	args={{
		title: 'Dashboard'
	}}
	{template}
/>

<Story
	name="Long Title"
	args={{
		title: 'Integration Configuration',
		description: 'Configure your payment provider integrations and webhooks.'
	}}
	{withButtonTemplate}
/>
