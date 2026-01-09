<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusToggleGroup from './status-toggle-group.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/UI/Status Toggle Group',
		component: StatusToggleGroup,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			status: {
				control: 'select',
				options: ['pending', 'in-progress', 'completed']
			},
			size: {
				control: 'select',
				options: ['sm', 'md']
			}
		}
	});
</script>

{#snippet template(args)}
	<StatusToggleGroup {...args} />
{/snippet}

<Story
	name="Pending"
	args={{
		status: 'pending',
		size: 'md'
	}}
	{template}
/>

<Story
	name="In Progress"
	args={{
		status: 'in-progress',
		size: 'md'
	}}
	{template}
/>

<Story
	name="Completed"
	args={{
		status: 'completed',
		size: 'md'
	}}
	{template}
/>

<Story
	name="Small Size"
	args={{
		status: 'pending',
		size: 'sm'
	}}
	{template}
/>

<Story name="All Statuses">
	<div class="flex flex-col items-center gap-4">
		<div class="flex items-center gap-4">
			<span class="w-24 text-sm text-muted-foreground">Pending:</span>
			<StatusToggleGroup status="pending" size="md" />
		</div>
		<div class="flex items-center gap-4">
			<span class="w-24 text-sm text-muted-foreground">In Progress:</span>
			<StatusToggleGroup status="in-progress" size="md" />
		</div>
		<div class="flex items-center gap-4">
			<span class="w-24 text-sm text-muted-foreground">Completed:</span>
			<StatusToggleGroup status="completed" size="md" />
		</div>
	</div>
</Story>

<Story name="Size Comparison">
	<div class="flex flex-col items-center gap-4">
		<div class="flex items-center gap-4">
			<span class="w-16 text-sm text-muted-foreground">Small:</span>
			<StatusToggleGroup status="in-progress" size="sm" />
		</div>
		<div class="flex items-center gap-4">
			<span class="w-16 text-sm text-muted-foreground">Medium:</span>
			<StatusToggleGroup status="in-progress" size="md" />
		</div>
	</div>
</Story>
