<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Badge } from '$lib/components/ui/badge/index.js';

	const { Story } = defineMeta({
		title: 'Feedback/Badge',
		component: Badge,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'secondary', 'destructive', 'outline']
			},
			href: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<Badge {...args}>Badge</Badge>
{/snippet}

<Story name="Default" args={{ variant: 'default' }} {template} />
<Story name="Secondary" args={{ variant: 'secondary' }} {template} />
<Story name="Destructive" args={{ variant: 'destructive' }} {template} />
<Story name="Outline" args={{ variant: 'outline' }} {template} />

<Story name="Status Badges">
	{#snippet template()}
		<div class="flex gap-2">
			<Badge variant="default">Active</Badge>
			<Badge variant="secondary">Pending</Badge>
			<Badge variant="destructive">Failed</Badge>
			<Badge variant="outline">Draft</Badge>
		</div>
	{/snippet}
</Story>

<Story name="As Link" args={{ href: '#', variant: 'default' }}>
	{#snippet template()}
		<Badge href="#">Click me</Badge>
	{/snippet}
</Story>
