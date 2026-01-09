<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { goto } from '$app/navigation';
	import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CreateDestinationDialog } from '$lib/components/admin/dashboards/index.js';
	import Plus from 'lucide-svelte/icons/plus';

	let { data } = $props();

	let destinations = $state(data.destinations || []);

	// Create destination dialog state
	let showCreateDialog = $state(false);
	let isCreating = $state(false);
	let createError = $state('');

	function formatTokenExpiration(seconds) {
		if (seconds < 60) return `${seconds}s`;
		if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
		if (seconds === 3600) return '1 hour';
		if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
		return '24 hours';
	}

	function handleRowClick(appId) {
		goto(`/admin/destinations/${encodeURIComponent(appId)}`);
	}

	async function handleCreateDestination(form) {
		if (!form.appId || !form.subject) {
			createError = 'App ID and Subject are required';
			return;
		}

		isCreating = true;
		createError = '';

		try {
			const response = await fetch('/admin/api/destinations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create destination');
			}

			// Add new destination to local state
			destinations = [
				...destinations,
				{
					appId: result.destination.appId,
					displayName: result.destination.subject,
					subject: result.destination.subject,
					isSystem: result.destination.isSystem,
					isComingSoon: result.destination.isComingSoon,
					restrictMerchantAccess: false,
					partnerTokenExpiration: 3600,
					disableOrderSaving: false
				}
			].sort((a, b) => a.displayName.localeCompare(b.displayName));

			showCreateDialog = false;
		} catch (error) {
			createError = error.message;
		} finally {
			isCreating = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-foreground">Destinations</h1>
			<p class="text-muted-foreground">Manage destination partner configurations</p>
		</div>
		<Button onclick={() => (showCreateDialog = true)}>
			<Plus class="mr-2 h-4 w-4" />
			Create Destination
		</Button>
	</div>

	<Card.Root>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Display Name</Table.Head>
					<Table.Head>App ID</Table.Head>
					<Table.Head>System</Table.Head>
					<Table.Head>Coming Soon</Table.Head>
					<Table.Head>Merchant Access</Table.Head>
					<Table.Head>Token Expiration</Table.Head>
					<Table.Head>Order Saving</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each destinations as dest (dest.appId)}
					<Table.Row
						class="cursor-pointer hover:bg-muted/50"
						on:click={() => handleRowClick(dest.appId)}
					>
						<Table.Cell class="font-medium">{dest.displayName}</Table.Cell>
						<Table.Cell class="font-mono text-sm text-muted-foreground">
							{dest.appId}
							<CopyToClipboard value={dest.appId} />
						</Table.Cell>
						<Table.Cell>
							{#if dest.isSystem}
								<Badge variant="secondary">Yes</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if dest.isComingSoon}
								<Badge variant="secondary">Yes</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell>
							{#if dest.restrictMerchantAccess}
								<Badge variant="default">Restricted</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell>{formatTokenExpiration(dest.partnerTokenExpiration)}</Table.Cell
						>
						<Table.Cell>
							{#if dest.disableOrderSaving}
								<Badge variant="destructive">Disabled</Badge>
							{/if}
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan="7" class="text-center text-muted-foreground py-8">
							No destinations found
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Root>
</div>

<CreateDestinationDialog
	bind:open={showCreateDialog}
	onSubmit={handleCreateDestination}
	isSubmitting={isCreating}
	error={createError}
/>
