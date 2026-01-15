<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ResponsiveActions from './responsive-actions.svelte';
	import ContactCell from './contact-cell.svelte';
	import Building2 from 'lucide-svelte/icons/building-2';
	import Mail from 'lucide-svelte/icons/mail';
	import MailX from 'lucide-svelte/icons/mail-x';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	let {
		destinations = [],
		onInvite = () => {},
		onResend = () => {},
		onCancelInvite = () => {},
		onReset = () => {}
	} = $props();

	function hasData(destination) {
		return (
			destination.owner_user_id ||
			destination.status === 'active' ||
			destination.pendingInvite
		);
	}

	function getActions(destination) {
		const actions = [];

		// Primary action: View Dashboard (opens in admin mode)
		actions.push({
			id: 'view',
			icon: ExternalLink,
			label: 'View Dashboard',
			variant: 'default',
			href: `/destination/${destination.appId}?admin_mode=true`,
			target: '_blank'
		});

		// Invite actions
		if (destination.pendingInvite && !destination.owner_user_id) {
			actions.push({
				id: 'resend',
				icon: RefreshCw,
				label: 'Resend Invite',
				variant: 'outline',
				onclick: () => onResend(destination.appId, destination.pendingInvite)
			});
			actions.push({
				id: 'cancel',
				icon: MailX,
				label: 'Cancel Invite',
				variant: 'ghost',
				onclick: () => onCancelInvite(destination.appId, destination.pendingInvite.email)
			});
		} else {
			actions.push({
				id: 'invite',
				icon: Mail,
				label: destination.owner_user_id ? 'Invite User' : 'Invite',
				variant: 'outline',
				onclick: () => onInvite(destination.appId)
			});
		}

		// Reset action (only if has data)
		if (hasData(destination)) {
			actions.push({
				id: 'reset',
				icon: Trash2,
				label: 'Reset Dashboard',
				variant: 'ghost',
				class: 'text-red-600',
				onclick: () => onReset(destination.appId)
			});
		}

		return actions;
	}

	function getStatusBadge(status) {
		switch (status) {
			case 'active':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'suspended':
				return 'destructive';
			case 'not_configured':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function getStatusLabel(status) {
		if (status === 'not_configured') return 'Not configured';
		return status;
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<Card.Root class="overflow-hidden">
	<Table.Root class="[&_table]:table-fixed">
		<Table.Header>
			<Table.Row>
				<Table.Head>App ID</Table.Head>
				<Table.Head>Main Contact</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>Created</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each destinations as destination (destination.appId)}
				<Table.Row>
					<Table.Cell class="font-medium">
						<div class="flex items-center gap-3">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<Building2 class="h-4 w-4" />
							</div>
							<div class="flex flex-col">
								<span>{destination.displayName || destination.appId}</span>
								{#if destination.displayName && destination.displayName !== destination.appId}
									<span class="text-xs text-muted-foreground"
										>{destination.appId}</span
									>
								{/if}
							</div>
						</div>
					</Table.Cell>
					<Table.Cell>
						<ContactCell
							contact={destination.contact}
							pendingInvite={destination.pendingInvite}
						/>
					</Table.Cell>
					<Table.Cell>
						{#if destination.status && destination.status !== 'not_configured'}
							<Badge variant={getStatusBadge(destination.status)}>
								{getStatusLabel(destination.status)}
							</Badge>
						{/if}
					</Table.Cell>
					<Table.Cell>{formatDate(destination.created_at)}</Table.Cell>
					<Table.Cell class="text-right">
						<ResponsiveActions actions={getActions(destination)} />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Card.Root>
