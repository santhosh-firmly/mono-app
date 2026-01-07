<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './page-header.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/Page Header',
		component: PageHeader,
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
	<PageHeader {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		title: 'Dashboard',
		description: 'Overview of your business metrics and performance.'
	}}
	{template}
/>

<Story
	name="Without Description"
	args={{
		title: 'Orders'
	}}
	{template}
/>

<Story
	name="Long Title"
	args={{
		title: 'Merchant Configuration Settings',
		description: 'Configure advanced settings for merchant integrations and payment processing.'
	}}
	{template}
/>
