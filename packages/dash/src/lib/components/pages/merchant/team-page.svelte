<script>
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
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

	/**
	 * @type {{
	 *   team: Array<{user_id: string, user_email: string, name?: string, role: string, status: string, joined_at?: string}>,
	 *   currentUserId: string,
	 *   isOwner: boolean,
	 *   error: string,
	 *   onInvite: (form: {email: string, role: string}) => Promise<void>,
	 *   onChangeRole: (userId: string, newRole: string) => Promise<void>,
	 *   onRemove: (userId: string) => Promise<void>
	 * }}
	 */
	let {
		team = [],
		currentUserId = '',
		isOwner = false,
		error = '',
		onInvite = async () => {},
		onChangeRole = async () => {},
		onRemove = async () => {}
	} = $props();

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
			await onInvite(form);
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
			await onChangeRole(roleTarget.userId, newRole);
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
			await onRemove(removeTarget.userId);
			showRemoveDialog = false;
		} catch (err) {
			removeError = err.message;
		} finally {
			isRemoving = false;
		}
	}
</script>

<div class="space-y-6">
	<MerchantPageHeader title="Team" description="Manage who has access to this dashboard.">
		{#if isOwner}
			<Button onclick={() => (showInviteDialog = true)}>
				<Plus class="mr-2 h-4 w-4" />
				Invite Member
			</Button>
		{/if}
	</MerchantPageHeader>

	{#if error}
		<Card.Root>
			<Card.Content class="py-8 text-center text-red-600">
				{error}
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
				{#if isOwner}
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
			{currentUserId}
			{isOwner}
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
