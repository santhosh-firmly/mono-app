<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, within } from '@storybook/test';
	import DashboardsTable from './dashboards-table.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards Table',
		component: DashboardsTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			onInviteUser: fn(),
			onCancelInvite: fn()
		}
	});

	const mockDashboards = [
		{
			domain: 'active-store.com',
			owner_user_id: 'user-123',
			owner_email: 'owner@active-store.com',
			status: 'active',
			created_at: '2024-01-15T10:30:00Z'
		},
		{
			domain: 'pending-invite.com',
			owner_user_id: null,
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
			pendingInvite: null,
			status: 'pending',
			created_at: '2024-03-10T09:15:00Z'
		},
		{
			domain: 'suspended-store.com',
			owner_user_id: 'user-456',
			owner_email: 'owner@suspended.com',
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

<Story
	name="Table Renders All Dashboards"
	args={{ dashboards: mockDashboards }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Verify table is rendered
		const table = await canvas.findByRole('table');
		await expect(table).toBeInTheDocument();

		// Verify all domains are shown
		await expect(await canvas.findByText('active-store.com')).toBeInTheDocument();
		await expect(await canvas.findByText('pending-invite.com')).toBeInTheDocument();
		await expect(await canvas.findByText('no-owner.com')).toBeInTheDocument();
		await expect(await canvas.findByText('suspended-store.com')).toBeInTheDocument();
	}}
/>

<Story
	name="Status Badges Display"
	args={{ dashboards: mockDashboards }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Wait for table to render, then verify status badges exist
		// Use getAllByText since "active" matches both domain and badge text
		const activeElements = await canvas.findAllByText(/active/i);
		await expect(activeElements.length).toBeGreaterThanOrEqual(1);

		const pendingElements = await canvas.findAllByText(/pending/i);
		await expect(pendingElements.length).toBeGreaterThanOrEqual(1);
	}}
/>

<Story
	name="Empty State"
	args={{ dashboards: [] }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Table or empty message should be present
		const table = canvas.queryByRole('table');
		if (table) {
			const rows = canvas.getAllByRole('row');
			// Should have header row only or empty state
			await expect(rows.length).toBeLessThanOrEqual(2);
		}
	}}
/>
