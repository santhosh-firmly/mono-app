<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import MoreHorizontal from 'lucide-svelte/icons/more-horizontal';
	import Shield from 'lucide-svelte/icons/shield';
	import UserX from 'lucide-svelte/icons/user-x';

	let {
		members = [],
		currentUserId = '',
		isOwner = false,
		onChangeRole = () => {},
		onRemove = () => {}
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
</script>

<Card.Root>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Member</Table.Head>
				<Table.Head>Role</Table.Head>
				<Table.Head>Joined</Table.Head>
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
						<div class="flex flex-col">
							<span class="font-medium">{member.user_email}</span>
							{#if member.user_id === currentUserId}
								<span class="text-xs text-muted-foreground">You</span>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge variant={getRoleBadgeVariant(member.role)}>
							{member.role}
						</Badge>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground">
						{formatDate(member.granted_at)}
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
		</Table.Body>
	</Table.Root>
</Card.Root>
