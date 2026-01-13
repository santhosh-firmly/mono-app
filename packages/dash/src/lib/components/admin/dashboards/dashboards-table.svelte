<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import MerchantAvatar from '$lib/components/merchant/merchant-avatar.svelte';
	import ResponsiveActions from './responsive-actions.svelte';
	import ContactCell from './contact-cell.svelte';
	import Mail from 'lucide-svelte/icons/mail';
	import MailX from 'lucide-svelte/icons/mail-x';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
	import Rocket from 'lucide-svelte/icons/rocket';

	let {
		dashboards = [],
		onInvite = () => {},
		onResend = () => {},
		onCancelInvite = () => {},
		onReset = () => {},
		onReviewKyb = () => {},
		onReviewGoLive = () => {}
	} = $props();

	function getActions(dashboard) {
		const actions = [];

		// Primary action: View Dashboard (opens in admin mode)
		actions.push({
			id: 'view',
			icon: ExternalLink,
			label: 'View Dashboard',
			variant: 'default',
			href: `/merchant/${dashboard.domain}?admin_mode=true`,
			target: '_blank'
		});

		// Review KYB (if pending)
		if (dashboard.kyb_status === 'pending') {
			actions.push({
				id: 'kyb',
				icon: ClipboardCheck,
				label: 'Review KYB',
				variant: 'outline',
				class: 'border-amber-200 text-amber-700 hover:bg-amber-50',
				onclick: () => onReviewKyb(dashboard)
			});
		}

		// Review Go Live (if pending)
		if (dashboard.go_live_status === 'pending') {
			actions.push({
				id: 'golive',
				icon: Rocket,
				label: 'Review Go Live',
				variant: 'outline',
				class: 'border-green-200 text-green-700 hover:bg-green-50',
				onclick: () => onReviewGoLive(dashboard)
			});
		}

		// Invite actions
		if (dashboard.pendingInvite && !dashboard.owner_user_id) {
			actions.push({
				id: 'resend',
				icon: RefreshCw,
				label: 'Resend Invite',
				variant: 'outline',
				onclick: () => onResend(dashboard.domain, dashboard.pendingInvite)
			});
			actions.push({
				id: 'cancel',
				icon: MailX,
				label: 'Cancel Invite',
				variant: 'ghost',
				onclick: () => onCancelInvite(dashboard.domain, dashboard.pendingInvite.email)
			});
		} else {
			actions.push({
				id: 'invite',
				icon: Mail,
				label: dashboard.owner_user_id ? 'Invite User' : 'Invite',
				variant: 'outline',
				onclick: () => onInvite(dashboard.domain)
			});
		}

		// Reset action
		actions.push({
			id: 'reset',
			icon: Trash2,
			label: 'Reset Dashboard',
			variant: 'ghost',
			class: 'text-red-600',
			onclick: () => onReset(dashboard.domain)
		});

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

	function getKybBadgeVariant(kybStatus) {
		switch (kybStatus) {
			case 'approved':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'rejected':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getKybLabel(kybStatus) {
		switch (kybStatus) {
			case 'approved':
				return 'Approved';
			case 'pending':
				return 'Pending Review';
			case 'rejected':
				return 'Rejected';
			default:
				return 'Not Submitted';
		}
	}

	function getGoLiveBadgeVariant(goLiveStatus) {
		switch (goLiveStatus) {
			case 'approved':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'rejected':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getGoLiveLabel(goLiveStatus) {
		switch (goLiveStatus) {
			case 'approved':
				return 'Live';
			case 'pending':
				return 'Pending Review';
			case 'rejected':
				return 'Rejected';
			default:
				return 'Not Ready';
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
</script>

<Card.Root class="overflow-hidden">
	<Table.Root class="[&_table]:table-fixed">
		<Table.Header>
			<Table.Row>
				<Table.Head>Domain</Table.Head>
				<Table.Head>Main Contact</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head>KYB Status</Table.Head>
				<Table.Head>Go Live</Table.Head>
				<Table.Head>Created</Table.Head>
				<Table.Head class="text-right">Actions</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each dashboards as dashboard (dashboard.domain)}
				<Table.Row>
					<Table.Cell class="font-medium">
						<div class="flex items-center gap-3">
							<MerchantAvatar domain={dashboard.domain} size="sm" />
							<div class="flex flex-col">
								<span
									class:line-through={dashboard.is_disabled}
									class:opacity-50={dashboard.is_disabled}
								>
									{dashboard.domain}
								</span>
								{#if dashboard.display_name}
									<span class="text-xs text-muted-foreground"
										>{dashboard.display_name}</span
									>
								{/if}
							</div>
							{#if dashboard.is_disabled}
								<Badge variant="outline" class="text-xs">Disabled</Badge>
							{/if}
							{#if dashboard.not_in_config}
								<Badge variant="destructive" class="text-xs">Not in Config</Badge>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<ContactCell
							contact={dashboard.contact}
							pendingInvite={dashboard.pendingInvite}
						/>
					</Table.Cell>
					<Table.Cell>
						{#if dashboard.status && dashboard.status !== 'not_configured'}
							<Badge variant={getStatusBadge(dashboard.status)}>
								{getStatusLabel(dashboard.status)}
							</Badge>
						{/if}
					</Table.Cell>
					<Table.Cell>
						{#if dashboard.kyb_status}
							<Badge variant={getKybBadgeVariant(dashboard.kyb_status)}>
								{getKybLabel(dashboard.kyb_status)}
							</Badge>
						{/if}
					</Table.Cell>
					<Table.Cell>
						{#if dashboard.go_live_status}
							<Badge variant={getGoLiveBadgeVariant(dashboard.go_live_status)}>
								{getGoLiveLabel(dashboard.go_live_status)}
							</Badge>
						{/if}
					</Table.Cell>
					<Table.Cell>{formatDate(dashboard.created_at)}</Table.Cell>
					<Table.Cell class="text-right">
						<ResponsiveActions actions={getActions(dashboard)} />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Card.Root>
