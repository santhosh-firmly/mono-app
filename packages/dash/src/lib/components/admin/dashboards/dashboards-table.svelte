<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import MerchantAvatar from '$lib/components/merchant/merchant-avatar.svelte';
	import Mail from 'lucide-svelte/icons/mail';
	import MailX from 'lucide-svelte/icons/mail-x';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Clock from 'lucide-svelte/icons/clock';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	let {
		dashboards = [],
		onInvite = () => {},
		onResend = () => {},
		onCancelInvite = () => {}
	} = $props();

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

<Card.Root>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Domain</Table.Head>
				<Table.Head>Main Contact</Table.Head>
				<Table.Head>Status</Table.Head>
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
						</div>
					</Table.Cell>
					<Table.Cell>
						{#if dashboard.contact?.name || dashboard.contact?.email}
							<div class="flex flex-col gap-0.5">
								{#if dashboard.contact.name}
									<span class="text-sm font-medium">{dashboard.contact.name}</span
									>
								{/if}
								{#if dashboard.contact.email}
									<span class="text-xs text-muted-foreground"
										>{dashboard.contact.email}</span
									>
								{/if}
							</div>
						{:else if dashboard.pendingInvite}
							<div class="flex flex-col gap-1">
								<span class="text-sm">{dashboard.pendingInvite.email}</span>
								<span class="flex items-center gap-1 text-xs text-amber-600">
									<Clock class="h-3 w-3" />
									Invite pending
								</span>
							</div>
						{:else}
							<span class="text-sm text-muted-foreground">Not set</span>
						{/if}
					</Table.Cell>
					<Table.Cell>
						<Badge variant={getStatusBadge(dashboard.status)}>
							{getStatusLabel(dashboard.status)}
						</Badge>
					</Table.Cell>
					<Table.Cell>{formatDate(dashboard.created_at)}</Table.Cell>
					<Table.Cell class="text-right">
						<div class="flex items-center justify-end gap-2">
							<!-- View Dashboard button - always visible -->
							<Button
								variant="default"
								size="sm"
								target="_blank"
								href={`/merchant/${dashboard.domain}`}
							>
								<ExternalLink class="mr-2 h-4 w-4" />
								View
							</Button>
							{#if dashboard.pendingInvite && !dashboard.owner_user_id}
								<Button
									variant="outline"
									size="sm"
									onclick={() =>
										onResend(dashboard.domain, dashboard.pendingInvite)}
								>
									<RefreshCw class="mr-2 h-4 w-4" />
									Resend
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onclick={() =>
										onCancelInvite(
											dashboard.domain,
											dashboard.pendingInvite.email
										)}
								>
									<MailX class="mr-2 h-4 w-4" />
									Cancel
								</Button>
							{:else if !dashboard.owner_user_id}
								<Button
									variant="outline"
									size="sm"
									onclick={() => onInvite(dashboard.domain)}
								>
									<Mail class="mr-2 h-4 w-4" />
									Invite
								</Button>
							{:else}
								<Button
									variant="outline"
									size="sm"
									onclick={() => onInvite(dashboard.domain)}
								>
									<Mail class="mr-2 h-4 w-4" />
									Invite User
								</Button>
							{/if}
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Card.Root>
