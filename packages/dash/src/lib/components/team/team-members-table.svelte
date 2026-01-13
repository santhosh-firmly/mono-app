<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import TeamMemberAvatar from './team-member-avatar.svelte';
	import MoreHorizontal from 'lucide-svelte/icons/more-horizontal';
	import Shield from 'lucide-svelte/icons/shield';
	import UserX from 'lucide-svelte/icons/user-x';
	import XCircle from 'lucide-svelte/icons/x-circle';
	import Clock from 'lucide-svelte/icons/clock';

	let {
		members = [],
		pendingInvites = [],
		currentUserId = '',
		isOwner = false,
		onChangeRole = () => {},
		onRemove = () => {},
		onCancelInvite = () => {}
	} = $props();

	function getRoleBadgeVariant(role) {
		switch (role) {
			case 'owner':
				return 'default';
			case 'editor':
				return 'secondary';
			case 'viewer':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatLastActive(dateString) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		return formatDate(dateString);
	}

	function formatExpiresIn(dateString) {
		if (!dateString) return '-';
		const expires = new Date(dateString);
		const now = new Date();
		const diffMs = expires - now;

		if (diffMs <= 0) return 'Expired';

		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

		if (diffDays > 1) return `${diffDays} days`;
		if (diffDays === 1) return '1 day';
		if (diffHours > 1) return `${diffHours} hours`;
		return 'Less than an hour';
	}
</script>

<Card.Root>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Member</Table.Head>
				<Table.Head>Role</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Last Active</Table.Head>
				{#if isOwner}
					<Table.Head class="text-right">Actions</Table.Head>
				{/if}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each members as member (member.user_id)}
				<Table.Row>
					<Table.Cell>
						<div class="flex items-center gap-3">
							<TeamMemberAvatar
								avatarDataUrl={member.avatarDataUrl}
								name={member.name}
								email={member.user_email}
								size="sm"
							/>
							<div class="flex flex-col">
								<span class="font-medium">
									{member.name || member.user_email}
								</span>
								{#if member.name}
									<span class="text-xs text-muted-foreground">
										{member.user_email}
									</span>
								{/if}
								{#if member.user_id === currentUserId}
									<span class="text-xs text-muted-foreground">You</span>
								{/if}
							</div>
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge variant={getRoleBadgeVariant(member.role)}>
							{member.role}
						</Badge>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground">
						<span class="text-sm">Joined {formatDate(member.granted_at)}</span>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground">
						{formatLastActive(member.last_login_at)}
					</Table.Cell>
					{#if isOwner}
						<Table.Cell class="text-right">
							{#if member.user_id !== currentUserId}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="ghost" size="icon">
											<MoreHorizontal class="h-4 w-4" />
											<span class="sr-only">Actions</span>
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => onChangeRole(member)}>
											<Shield class="mr-2 h-4 w-4" />
											Change Role
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item
											class="text-red-600"
											onclick={() => onRemove(member)}
										>
											<UserX class="mr-2 h-4 w-4" />
											Remove
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							{:else}
								<span class="text-xs text-muted-foreground">-</span>
							{/if}
						</Table.Cell>
					{/if}
				</Table.Row>
			{/each}
			{#each pendingInvites as invite (invite.token)}
				<Table.Row class="bg-muted/30">
					<Table.Cell>
						<div class="flex items-center gap-3">
							<TeamMemberAvatar email={invite.email} size="sm" />
							<div class="flex flex-col">
								<span class="font-medium">{invite.email}</span>
								<span class="text-xs text-muted-foreground">
									Invited by {invite.invited_by_email}
								</span>
							</div>
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge variant={getRoleBadgeVariant(invite.role)}>
							{invite.role}
						</Badge>
					</Table.Cell>
					<Table.Cell>
						<div class="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
							<Clock class="h-3.5 w-3.5" />
							<span class="text-sm font-medium">Pending</span>
						</div>
						<span class="text-xs text-muted-foreground">
							Expires in {formatExpiresIn(invite.expires_at)}
						</span>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground">-</Table.Cell>
					{#if isOwner}
						<Table.Cell class="text-right">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<Button variant="ghost" size="icon">
										<MoreHorizontal class="h-4 w-4" />
										<span class="sr-only">Actions</span>
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Item
										class="text-red-600"
										onclick={() => onCancelInvite(invite)}
									>
										<XCircle class="mr-2 h-4 w-4" />
										Cancel Invitation
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					{/if}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Card.Root>
