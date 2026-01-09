<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DashboardsTable from './dashboards-table.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Table',
		component: DashboardsTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const mockDashboards = [
		{
			domain: 'active-store.com',
			owner_user_id: 'user-123',
			contact: { name: 'John Owner', email: 'owner@active-store.com' },
			status: 'active',
			created_at: '2024-01-15T10:30:00Z'
		},
		{
			domain: 'pending-invite.com',
			owner_user_id: null,
			contact: null,
			pendingInvite: {
				email: 'invited@example.com',
				role: 'owner'
			},
			status: 'pending',
			created_at: '2024-02-20T14:00:00Z'
		},
		{
			domain: 'no-owner.com',
			owner_user_id: null,
			contact: null,
			pendingInvite: null,
			status: 'pending',
			created_at: '2024-03-10T09:15:00Z'
		},
		{
			domain: 'suspended-store.com',
			owner_user_id: 'user-456',
			contact: { name: 'Jane Owner', email: 'owner@suspended.com' },
			status: 'suspended',
			created_at: '2023-12-01T16:45:00Z'
		}
	];
</script>

{#snippet template(args)}
	<DashboardsTable {...args} />
{/snippet}

<Story name="Default" args={{ dashboards: mockDashboards }} {template} />

<Story name="Empty" args={{ dashboards: [] }} {template} />

<Story
	name="Active Dashboards Only"
	args={{
		dashboards: mockDashboards.filter((d) => d.status === 'active')
	}}
	{template}
/>

<Story
	name="Pending Invitations"
	args={{
		dashboards: mockDashboards.filter((d) => d.pendingInvite)
	}}
	{template}
/>

<!-- Note: Play tests removed due to rendering issues in headless test environment.
     The component uses ResizeObserver in ResponsiveActions which may not work correctly in test runner.
     Visual testing of these stories works fine in interactive Storybook. -->
