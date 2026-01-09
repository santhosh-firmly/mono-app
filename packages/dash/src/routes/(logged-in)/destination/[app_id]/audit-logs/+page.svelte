<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { EmptyState } from '$lib/components/ui/empty-state/index.js';
	import History from 'lucide-svelte/icons/history';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import UserPlus from 'lucide-svelte/icons/user-plus';
	import UserCheck from 'lucide-svelte/icons/user-check';
	import UserX from 'lucide-svelte/icons/user-x';
	import Shield from 'lucide-svelte/icons/shield';
	import Settings from 'lucide-svelte/icons/settings';
	import Building2 from 'lucide-svelte/icons/building-2';
	import Globe from 'lucide-svelte/icons/globe';

	let { data } = $props();
	let appId = $derived($page.params.app_id);

	function handlePageChange(newPage) {
		goto(`/destination/${appId}/audit-logs?page=${newPage}`);
	}

	// Event type display configuration
	const eventConfig = {
		team_member_invited: {
			label: 'Invited',
			icon: UserPlus,
			variant: 'secondary'
		},
		invite_accepted: {
			label: 'Joined',
			icon: UserCheck,
			variant: 'default'
		},
		invite_cancelled: {
			label: 'Cancelled',
			icon: UserX,
			variant: 'outline'
		},
		member_removed: {
			label: 'Removed',
			icon: UserX,
			variant: 'destructive'
		},
		role_changed: {
			label: 'Role Changed',
			icon: Shield,
			variant: 'outline'
		},
		settings_updated: {
			label: 'Settings',
			icon: Settings,
			variant: 'secondary'
		},
		profile_updated: {
			label: 'Profile',
			icon: Building2,
			variant: 'secondary'
		},
		branding_updated: {
			label: 'Branding',
			icon: Globe,
			variant: 'secondary'
		}
	};

	function getEventConfig(eventType) {
		return (
			eventConfig[eventType] || {
				label: eventType.replace(/_/g, ' '),
				icon: History,
				variant: 'outline'
			}
		);
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRelativeTime(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return formatDate(dateString);
	}

	function getEventDescription(log) {
		let details = {};
		try {
			details = log.details ? JSON.parse(log.details) : {};
		} catch {
			// Use empty details
		}

		switch (log.event_type) {
			case 'team_member_invited':
				return `Invited ${log.target_email || 'a user'} as ${details.role || 'member'}`;
			case 'invite_accepted':
				return `${log.target_email || 'User'} joined as ${details.role || 'member'}`;
			case 'invite_cancelled':
				return `Cancelled invite${details.inviteId ? ` #${details.inviteId}` : ''}`;
			case 'member_removed':
				return `Removed ${log.target_email || 'a user'} from the team`;
			case 'role_changed':
				return `Changed ${log.target_email || 'user'}'s role to ${details.newRole || 'unknown'}`;
			case 'settings_updated':
				return 'Updated dashboard settings';
			case 'profile_updated':
				return `Updated profile${details.changedFields ? `: ${details.changedFields.join(', ')}` : ''}`;
			case 'branding_updated':
				return 'Updated branding settings';
			default:
				return log.event_type.replace(/_/g, ' ');
		}
	}

	let logs = $derived(data.logs);
	let currentPage = $derived(data.currentPage);
	let totalPages = $derived(data.totalPages);
	let total = $derived(data.total);
	let limit = $derived(data.limit);
	let isFirmlyAdmin = $derived(data.isFirmlyAdmin);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Audit Logs</h1>
		<p class="text-muted-foreground">View activity history for this dashboard.</p>
	</div>

	{#if logs.length === 0}
		<EmptyState
			icon={History}
			title="No activity yet"
			description="Activity will appear here as team members make changes."
		/>
	{:else}
		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[140px]">Event</Table.Head>
						<Table.Head>Description</Table.Head>
						<Table.Head>By</Table.Head>
						<Table.Head class="text-right">When</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each logs as log (log.id)}
						{@const config = getEventConfig(log.event_type)}
						{@const Icon = config.icon}
						<Table.Row>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<Badge variant={config.variant} class="gap-1 text-nowrap">
										<Icon class="h-3 w-3" />
										{config.label}
									</Badge>
									{#if log.is_firmly_admin && isFirmlyAdmin}
										<Badge
											variant="outline"
											class="gap-1 text-nowrap border-purple-600 text-purple-600"
										>
											<Shield class="h-3 w-3" />
											Admin
										</Badge>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell>
								<span class="text-sm">{getEventDescription(log)}</span>
							</Table.Cell>
							<Table.Cell>
								<span class="text-sm text-muted-foreground">{log.actor_email}</span>
							</Table.Cell>
							<Table.Cell class="text-right">
								<span
									class="text-sm text-muted-foreground"
									title={formatDate(log.created_at)}
								>
									{formatRelativeTime(log.created_at)}
								</span>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Root>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					Showing {(currentPage - 1) * limit + 1} to {Math.min(
						currentPage * limit,
						total
					)} of {total}
					events
				</p>
				<div class="flex gap-2">
					{#if currentPage > 1}
						<Button
							variant="outline"
							size="sm"
							onclick={() => handlePageChange(currentPage - 1)}
						>
							<ChevronLeft class="mr-1 h-4 w-4" />
							Previous
						</Button>
					{/if}
					{#if currentPage < totalPages}
						<Button
							variant="outline"
							size="sm"
							onclick={() => handlePageChange(currentPage + 1)}
						>
							Next
							<ChevronRight class="ml-1 h-4 w-4" />
						</Button>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>
