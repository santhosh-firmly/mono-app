<script>
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Plus from 'lucide-svelte/icons/plus';
	import Users from 'lucide-svelte/icons/users';
	import {
		TeamInviteDialog,
		ChangeRoleDialog,
		RemoveMemberDialog,
		TeamMembersTable
	} from '$lib/components/team/index.js';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { data } = $props();
	let appId = $derived($page.params.app_id);

	// Local team state for updates
	let team = $state(data.team || []);

	// Invite dialog state
	let showInviteDialog = $state(false);
	let isInviting = $state(false);
	let inviteError = $state('');
	let inviteSuccess = $state('');

	// Role change dialog state
	let showRoleDialog = $state(false);
	let roleTarget = $state({ userId: '', email: '', currentRole: '' });
	let isChangingRole = $state(false);
	let roleError = $state('');

	// Remove member dialog state
	let showRemoveDialog = $state(false);
	let removeTarget = $state({ userId: '', email: '' });
	let isRemoving = $state(false);
	let removeError = $state('');

	async function handleSendInvite(form) {
		if (!form.email) {
			inviteError = 'Email is required';
			return;
		}

		isInviting = true;
		inviteError = '';
		inviteSuccess = '';

		try {
			const response = await adminFetch(`/destination/${appId}/api/team/invite`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send invite');
			}

			inviteSuccess = `Invitation sent to ${form.email}`;
			setTimeout(() => {
				inviteSuccess = '';
				showInviteDialog = false;
			}, 2000);
		} catch (err) {
			inviteError = err.message;
		} finally {
			isInviting = false;
		}
	}

	function handleOpenRoleDialog(member) {
		roleTarget = {
			userId: member.user_id,
			email: member.user_email,
			currentRole: member.role
		};
		roleError = '';
		showRoleDialog = true;
	}

	async function handleChangeRole(newRole) {
		if (newRole === roleTarget.currentRole) {
			showRoleDialog = false;
			return;
		}

		isChangingRole = true;
		roleError = '';

		try {
			const response = await adminFetch(
				`/destination/${appId}/api/team/${roleTarget.userId}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ role: newRole })
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update role');
			}

			// Update local state
			team = team.map((m) => (m.user_id === roleTarget.userId ? { ...m, role: newRole } : m));
			showRoleDialog = false;
		} catch (err) {
			roleError = err.message;
		} finally {
			isChangingRole = false;
		}
	}

	function handleOpenRemoveDialog(member) {
		removeTarget = {
			userId: member.user_id,
			email: member.user_email
		};
		removeError = '';
		showRemoveDialog = true;
	}

	async function handleConfirmRemove() {
		isRemoving = true;
		removeError = '';

		try {
			const response = await adminFetch(
				`/destination/${appId}/api/team/${removeTarget.userId}`,
				{
					method: 'DELETE'
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to remove team member');
			}

			// Update local state
			team = team.filter((m) => m.user_id !== removeTarget.userId);
			showRemoveDialog = false;
		} catch (err) {
			removeError = err.message;
		} finally {
			isRemoving = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-foreground">Team</h1>
			<p class="text-muted-foreground">Manage who has access to this dashboard.</p>
		</div>
		{#if data.isOwner}
			<Button onclick={() => (showInviteDialog = true)}>
				<Plus class="mr-2 h-4 w-4" />
				Invite Member
			</Button>
		{/if}
	</div>

	{#if data.error}
		<Card.Root>
			<Card.Content class="py-8 text-center text-red-600">
				{data.error}
			</Card.Content>
		</Card.Root>
	{:else if team.length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<Users class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 class="mb-2 text-lg font-medium">No team members yet</h3>
				<p class="mb-4 text-muted-foreground">
					Invite people to collaborate on this dashboard.
				</p>
				{#if data.isOwner}
					<Button onclick={() => (showInviteDialog = true)}>
						<Plus class="mr-2 h-4 w-4" />
						Invite Member
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<TeamMembersTable
			members={team}
			currentUserId={data.currentUserId}
			isOwner={data.isOwner}
			onChangeRole={handleOpenRoleDialog}
			onRemove={handleOpenRemoveDialog}
		/>
	{/if}
</div>

<TeamInviteDialog
	bind:open={showInviteDialog}
	onSubmit={handleSendInvite}
	isSubmitting={isInviting}
	error={inviteError}
	success={inviteSuccess}
/>

<ChangeRoleDialog
	bind:open={showRoleDialog}
	memberEmail={roleTarget.email}
	currentRole={roleTarget.currentRole}
	onSubmit={handleChangeRole}
	isSubmitting={isChangingRole}
	error={roleError}
/>

<RemoveMemberDialog
	bind:open={showRemoveDialog}
	memberEmail={removeTarget.email}
	onConfirm={handleConfirmRemove}
	isSubmitting={isRemoving}
	error={removeError}
/>
