<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorkflowStatusBadge from './workflow-status-badge.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Shared/WorkflowStatusBadge',
		component: WorkflowStatusBadge,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			status: {
				control: 'select',
				options: ['idle', 'pending', 'running', 'complete', 'has_run', 'failed']
			},
			animated: {
				control: 'boolean'
			},
			lastRunDate: {
				control: 'text'
			}
		}
	});
</script>

{#snippet template(args)}
	<WorkflowStatusBadge {...args} />
{/snippet}

<Story name="Idle" args={{ status: 'idle' }} {template} />

<Story name="Pending" args={{ status: 'pending' }} {template} />

<Story name="Running" args={{ status: 'running' }} {template} />

<Story name="Complete" args={{ status: 'complete' }} {template} />

<Story name="Has Run" args={{ status: 'has_run' }} {template} />

<Story name="Failed" args={{ status: 'failed' }} {template} />

<Story
	name="With Last Run Date"
	args={{ status: 'has_run', lastRunDate: new Date(Date.now() - 3600000).toISOString() }}
	{template}
/>

<Story
	name="With Old Date"
	args={{ status: 'has_run', lastRunDate: new Date(Date.now() - 86400000 * 3).toISOString() }}
	{template}
/>

<Story name="Not Animated" args={{ status: 'running', animated: false }} {template} />

{#snippet allStatesTemplate()}
	<div class="flex flex-wrap gap-2">
		<WorkflowStatusBadge status="idle" />
		<WorkflowStatusBadge status="pending" />
		<WorkflowStatusBadge status="running" />
		<WorkflowStatusBadge status="complete" />
		<WorkflowStatusBadge status="has_run" lastRunDate={new Date().toISOString()} />
		<WorkflowStatusBadge status="failed" />
	</div>
{/snippet}

<Story name="All States" template={allStatesTemplate} />
