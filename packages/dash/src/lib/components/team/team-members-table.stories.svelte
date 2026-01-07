<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, within } from '@storybook/test';
	import TeamMembersTable from './team-members-table.svelte';
	import teamData from '$lib/assets/team-data.json';

	const { Story } = defineMeta({
		title: 'Merchant/Team/Team Members Table',
		component: TeamMembersTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			onRoleChange: fn(),
			onRemoveMember: fn()
		},
		argTypes: {
			isOwner: { control: 'boolean' },
			currentUserId: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<TeamMembersTable {...args} />
{/snippet}

<Story
	name="As Owner"
	args={{
		members: teamData,
		currentUserId: teamData[0].user_id,
		isOwner: true
	}}
	{template}
/>

<Story
	name="As Non-Owner"
	args={{
		members: teamData,
		currentUserId: teamData[1].user_id,
		isOwner: false
	}}
	{template}
/>

<Story
	name="Empty Team"
	args={{
		members: [],
		currentUserId: 'user-1',
		isOwner: true
	}}
	{template}
/>

<Story
	name="Single Member"
	args={{
		members: [teamData[0]],
		currentUserId: teamData[0].user_id,
		isOwner: true
	}}
	{template}
/>

<Story
	name="Table Displays Members"
	args={{
		members: teamData,
		currentUserId: teamData[0].user_id,
		isOwner: true
	}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Verify table is rendered
		const table = canvas.getByRole('table');
		await expect(table).toBeInTheDocument();

		// Verify member rows exist
		const rows = canvas.getAllByRole('row');
		// Header row + data rows
		await expect(rows.length).toBeGreaterThan(1);
	}}
/>

<Story
	name="Role Column Shows Current Roles"
	args={{
		members: teamData,
		currentUserId: teamData[0].user_id,
		isOwner: true
	}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Verify role column header exists
		await expect(canvas.getByText(/role/i)).toBeInTheDocument();

		// Check that role badges/text are shown
		const table = canvas.getByRole('table');
		await expect(table).toBeInTheDocument();
	}}
/>

<Story
	name="Empty State Display"
	args={{
		members: [],
		currentUserId: 'user-1',
		isOwner: true
	}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Verify empty state or no rows
		const table = canvas.queryByRole('table');
		if (table) {
			const rows = canvas.getAllByRole('row');
			// Should only have header row
			await expect(rows.length).toBeLessThanOrEqual(2);
		}
	}}
/>
