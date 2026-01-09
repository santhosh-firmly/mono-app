<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationsTable from './destinations-table.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Destinations Table',
		component: DestinationsTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<DestinationsTable {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		destinations: [
			{
				appId: 'dest-001-uuid-1234',
				displayName: 'Amazon US',
				status: 'active',
				contact: { name: 'John Doe', email: 'john@amazon.com' },
				created_at: '2024-01-15T10:00:00Z'
			},
			{
				appId: 'dest-002-uuid-5678',
				displayName: 'Walmart',
				status: 'pending',
				contact: { email: 'partner@walmart.com' },
				created_at: '2024-01-10T14:30:00Z'
			},
			{
				appId: 'dest-003-uuid-9012',
				displayName: 'Target',
				status: 'not_configured',
				pendingInvite: { email: 'onboarding@target.com' },
				created_at: '2024-01-05T09:15:00Z'
			}
		]
	}}
	{template}
/>

<Story
	name="With Pending Invite"
	args={{
		destinations: [
			{
				appId: 'dest-004-uuid-3456',
				displayName: 'Best Buy',
				status: 'not_configured',
				pendingInvite: { email: 'partner@bestbuy.com' },
				created_at: '2024-01-20T11:00:00Z'
			}
		]
	}}
	{template}
/>

<Story
	name="Suspended Status"
	args={{
		destinations: [
			{
				appId: 'dest-005-uuid-7890',
				displayName: 'Inactive Partner',
				status: 'suspended',
				contact: { name: 'Jane Smith', email: 'jane@example.com' },
				created_at: '2023-12-01T08:00:00Z'
			}
		]
	}}
	{template}
/>

<Story
	name="Empty State"
	args={{
		destinations: []
	}}
	{template}
/>

<Story name="Multiple Statuses">
	{#snippet template()}
		<DestinationsTable
			destinations={[
				{
					appId: 'dest-001',
					displayName: 'Active Destination',
					status: 'active',
					contact: { name: 'Contact 1', email: 'contact1@example.com' },
					created_at: '2024-01-15T10:00:00Z'
				},
				{
					appId: 'dest-002',
					displayName: 'Pending Destination',
					status: 'pending',
					contact: { email: 'contact2@example.com' },
					created_at: '2024-01-14T10:00:00Z'
				},
				{
					appId: 'dest-003',
					displayName: 'Not Configured',
					status: 'not_configured',
					created_at: '2024-01-13T10:00:00Z'
				},
				{
					appId: 'dest-004',
					displayName: 'Suspended Destination',
					status: 'suspended',
					contact: { name: 'Contact 4' },
					created_at: '2024-01-12T10:00:00Z'
				}
			]}
		/>
	{/snippet}
</Story>
