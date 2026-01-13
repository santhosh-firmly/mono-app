<script>
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import StatusToggleGroup from '$lib/components/merchant/status-toggle-group.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Circle from 'lucide-svelte/icons/circle';
	import Loader from 'lucide-svelte/icons/loader-2';
	import History from 'lucide-svelte/icons/history';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Shield from 'lucide-svelte/icons/shield';
	import Save from 'lucide-svelte/icons/save';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { data } = $props();
	let domain = $derived($page.params.domain);
	let syncing = $state(false);
	let saving = $state(false);

	// Track pending changes (key: stepId or stepId-substepId, value: { originalStatus, newStatus })
	let pendingChanges = $state({});

	// Check if there are any pending changes
	let hasChanges = $derived(Object.keys(pendingChanges).length > 0);

	// Get effective status (pending change or original)
	function getEffectiveStatus(stepId, substepId, originalStatus) {
		const key = substepId ? `${stepId}-${substepId}` : stepId;
		return pendingChanges[key]?.newStatus ?? originalStatus;
	}

	// Track a change locally without calling the API
	function trackChange(stepId, substepId, originalStatus, newStatus) {
		const key = substepId ? `${stepId}-${substepId}` : stepId;

		if (newStatus === originalStatus) {
			// Remove from pending if reverted to original
			delete pendingChanges[key];
			pendingChanges = { ...pendingChanges };
		} else {
			pendingChanges = {
				...pendingChanges,
				[key]: { stepId, substepId, originalStatus, newStatus }
			};
		}
	}

	// Save all pending changes
	async function saveChanges() {
		if (!hasChanges) return;

		saving = true;

		try {
			const changes = Object.values(pendingChanges);

			// Call the batch save endpoint
			const response = await adminFetch(`/merchant/${domain}/api/integration-status/batch`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ changes })
			});

			if (!response.ok) {
				throw new Error('Failed to save changes');
			}

			// Clear pending changes
			pendingChanges = {};

			// Refresh data
			await invalidateAll();
		} catch (error) {
			console.error('Error saving changes:', error);
		} finally {
			saving = false;
		}
	}

	// Discard all pending changes
	function discardChanges() {
		pendingChanges = {};
	}

	async function triggerSync() {
		syncing = true;
		try {
			const response = await adminFetch(`/merchant/${domain}/api/integration-status/sync`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Sync failed');
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error syncing:', error);
		} finally {
			syncing = false;
		}
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleString();
	}

	function formatRelativeTime(dateString) {
		if (!dateString) return '-';
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}

	function getEventDescription(log) {
		try {
			const details = log.details ? JSON.parse(log.details) : {};
			const stepInfo = details.substepId
				? `${details.stepId} / ${details.substepId}`
				: details.stepId;

			if (log.event_type === 'integration_step_completed') {
				return `Completed step: ${stepInfo}`;
			}
			if (log.event_type === 'integration_step_updated') {
				return `Updated step: ${stepInfo} to ${details.status}`;
			}
			if (log.event_type === 'integration_steps_synced') {
				return `Synced ${details.updatedSteps} steps from external API`;
			}
			return log.event_type;
		} catch {
			return log.event_type;
		}
	}
</script>

<div class="space-y-6">
	<MerchantPageHeader
		title="Integration Admin"
		description="Manage integration step statuses for this merchant."
	>
		<Button variant="outline" onclick={triggerSync} disabled={syncing}>
			<RefreshCw class={['mr-2 h-4 w-4', syncing ? 'animate-spin' : '']} />
			Sync from External API
		</Button>
	</MerchantPageHeader>

	<!-- Steps Management -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center justify-between">
				<span>Integration Steps</span>
				{#if hasChanges}
					<Badge variant="secondary" class="ml-2">
						{Object.keys(pendingChanges).length} unsaved change{Object.keys(
							pendingChanges
						).length === 1
							? ''
							: 's'}
					</Badge>
				{/if}
			</Card.Title>
			<Card.Description>
				Change step statuses below. Click "Save Changes" to apply. Changes are logged in the
				audit trail.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[40px]">Status</Table.Head>
						<Table.Head>Step</Table.Head>
						<Table.Head>Completed At</Table.Head>
						<Table.Head>Completed By</Table.Head>
						<Table.Head>Source</Table.Head>
						<Table.Head class="w-[150px] text-right">Set Status</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.steps as step (step.id)}
						{@const stepEffectiveStatus = getEffectiveStatus(
							step.id,
							null,
							step.status
						)}
						{@const stepHasChange = pendingChanges[step.id] !== undefined}
						<!-- Main step row -->
						<Table.Row
							class={[
								step.substeps ? 'bg-muted/50' : '',
								stepHasChange ? 'bg-amber-50 dark:bg-amber-950/30' : ''
							]
								.filter(Boolean)
								.join(' ')}
						>
							<Table.Cell>
								{#if stepEffectiveStatus === 'completed'}
									<CheckCircle
										class="h-5 w-5 text-green-600 dark:text-green-400"
									/>
								{:else if stepEffectiveStatus === 'in-progress'}
									<Loader class="h-5 w-5 text-primary" />
								{:else}
									<Circle class="h-5 w-5 text-muted-foreground/50" />
								{/if}
							</Table.Cell>
							<Table.Cell class="font-medium">
								{step.title}
								{#if stepHasChange}
									<Badge variant="outline" class="ml-2 text-xs">Modified</Badge>
								{/if}
							</Table.Cell>
							<Table.Cell>{formatDate(step.completedAt)}</Table.Cell>
							<Table.Cell>{step.completedBy || '-'}</Table.Cell>
							<Table.Cell>
								{#if step.source}
									<Badge
										variant={step.source === 'admin' ? 'default' : 'secondary'}
									>
										{step.source}
									</Badge>
								{:else}
									-
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								{#if !step.substeps}
									<StatusToggleGroup
										status={stepEffectiveStatus}
										onChange={(newStatus) =>
											trackChange(step.id, null, step.status, newStatus)}
										size="md"
									/>
								{:else}
									<span class="text-xs text-muted-foreground"
										>Derived from substeps</span
									>
								{/if}
							</Table.Cell>
						</Table.Row>

						<!-- Substep rows -->
						{#if step.substeps}
							{#each step.substeps as substep (substep.id)}
								{@const substepEffectiveStatus = getEffectiveStatus(
									step.id,
									substep.id,
									substep.status
								)}
								{@const substepHasChange =
									pendingChanges[`${step.id}-${substep.id}`] !== undefined}
								<Table.Row
									class={substepHasChange
										? 'bg-amber-50 dark:bg-amber-950/30'
										: ''}
								>
									<Table.Cell class="pl-8">
										{#if substepEffectiveStatus === 'completed'}
											<CheckCircle
												class="h-4 w-4 text-green-600 dark:text-green-400"
											/>
										{:else if substepEffectiveStatus === 'in-progress'}
											<Loader class="h-4 w-4 text-primary" />
										{:else}
											<Circle class="h-4 w-4 text-muted-foreground/50" />
										{/if}
									</Table.Cell>
									<Table.Cell class="pl-8 text-sm">
										{substep.title}
										{#if substepHasChange}
											<Badge variant="outline" class="ml-2 text-xs"
												>Modified</Badge
											>
										{/if}
									</Table.Cell>
									<Table.Cell>{formatDate(substep.completedAt)}</Table.Cell>
									<Table.Cell>{substep.completedBy || '-'}</Table.Cell>
									<Table.Cell>
										{#if substep.source}
											<Badge
												variant={substep.source === 'admin'
													? 'default'
													: 'secondary'}
											>
												{substep.source}
											</Badge>
										{:else}
											-
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<StatusToggleGroup
											status={substepEffectiveStatus}
											onChange={(newStatus) =>
												trackChange(
													step.id,
													substep.id,
													substep.status,
													newStatus
												)}
											size="sm"
										/>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
		{#if hasChanges}
			<Card.Footer class="mt-4 flex justify-end gap-2 border-t bg-muted/50 pt-4">
				<Button variant="outline" onclick={discardChanges} disabled={saving}>
					Discard Changes
				</Button>
				<Button onclick={saveChanges} disabled={saving}>
					{#if saving}
						<Loader class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						<Save class="mr-2 h-4 w-4" />
						Save Changes
					{/if}
				</Button>
			</Card.Footer>
		{/if}
	</Card.Root>

	<!-- Audit History -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<History class="h-5 w-5" />
				Integration Audit History
			</Card.Title>
			<Card.Description>Recent changes to integration status.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.auditLogs.length === 0}
				<p class="py-4 text-center text-sm text-muted-foreground">
					No integration changes recorded yet.
				</p>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Event</Table.Head>
							<Table.Head>Details</Table.Head>
							<Table.Head>By</Table.Head>
							<Table.Head>When</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.auditLogs as log (log.id)}
							<Table.Row>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<Badge variant="outline">
											{log.event_type
												.replace('integration_', '')
												.replace(/_/g, ' ')}
										</Badge>
										{#if log.is_firmly_admin}
											<Badge
												variant="outline"
												class="gap-1 border-primary text-primary"
											>
												<Shield class="h-3 w-3" />
												Admin
											</Badge>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell class="text-sm">
									{getEventDescription(log)}
								</Table.Cell>
								<Table.Cell>{log.actor_email}</Table.Cell>
								<Table.Cell title={formatDate(log.created_at)}>
									{formatRelativeTime(log.created_at)}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
