<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TeamPage from './team-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Merchant/Team',
		component: TeamPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	import { mockTeamMembers, mockCurrentUser } from '$lib/mocks/index.js';

	// Convert mock data to expected format
	const teamMembers = mockTeamMembers.map((m) => ({
		user_id: m.id,
		user_email: m.email,
		name: m.name,
		role: m.role,
		status: m.status,
		joined_at: m.joined_at
	}));

	const noopAsync = async () => {};
</script>

<Story name="Default (Owner View)">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={teamMembers}
				currentUserId={mockCurrentUser.id}
				isOwner={true}
				error=""
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Member View (Read Only)">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={teamMembers}
				currentUserId="user_003"
				isOwner={false}
				error=""
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Empty State (Owner)">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={[]}
				currentUserId={mockCurrentUser.id}
				isOwner={true}
				error=""
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Empty State (Member)">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={[]}
				currentUserId="user_003"
				isOwner={false}
				error=""
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={[]}
				currentUserId={mockCurrentUser.id}
				isOwner={true}
				error="Failed to load team members. Please try again."
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Single Owner">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={[teamMembers[0]]}
				currentUserId={mockCurrentUser.id}
				isOwner={true}
				error=""
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Pending Invite">
	{#snippet template()}
		<div class="p-6">
			<TeamPage
				team={teamMembers}
				currentUserId={mockCurrentUser.id}
				isOwner={true}
				error=""
				onInvite={noopAsync}
				onChangeRole={noopAsync}
				onRemove={noopAsync}
			/>
		</div>
	{/snippet}
</Story>
