<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { goto } from '$app/navigation';
	import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CreateDestinationDialog } from '$lib/components/admin/dashboards/index.js';
	import CategoryCombobox from '$lib/components/admin/category-combobox.svelte';
	import Plus from 'lucide-svelte/icons/plus';
	import Save from 'lucide-svelte/icons/save';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import CheckCircle from 'lucide-svelte/icons/check-circle-2';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';

	let { data } = $props();

	// Original data for comparison (deep clone)
	let originalDestinations = $state(JSON.parse(JSON.stringify(data.destinations || [])));

	// Working copy that user edits
	let destinations = $state(data.destinations || []);

	// Create destination dialog state
	let showCreateDialog = $state(false);
	let isCreating = $state(false);
	let createError = $state('');

	// Save state
	let saving = $state(false);
	let saveError = $state('');
	let successMessage = $state('');

	// Check if a destination has changed from its original
	function hasDestinationChanged(dest, original) {
		if (!original) return true;
		return (
			dest.category !== original.category ||
			dest.isSystem !== original.isSystem ||
			dest.isComingSoon !== original.isComingSoon ||
			dest.restrictMerchantAccess !== original.restrictMerchantAccess ||
			dest.disableOrderSaving !== original.disableOrderSaving
		);
	}

	// Computed: which destinations have been modified
	let modifiedDestinations = $derived(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Map is recreated on each derivation, not mutated
		const modified = new Map();
		for (const dest of destinations) {
			const original = originalDestinations.find((d) => d.appId === dest.appId);
			if (hasDestinationChanged(dest, original)) {
				modified.set(dest.appId, dest);
			}
		}
		return modified;
	});

	let hasChanges = $derived(modifiedDestinations().size > 0);

	// Update a destination field
	function updateDestination(appId, field, value) {
		destinations = destinations.map((d) => (d.appId === appId ? { ...d, [field]: value } : d));
	}

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
			const newDest = {
				appId: result.destination.appId,
				displayName: result.destination.subject,
				subject: result.destination.subject,
				category: '',
				isSystem: result.destination.isSystem,
				isComingSoon: result.destination.isComingSoon,
				restrictMerchantAccess: false,
				partnerTokenExpiration: 3600,
				disableOrderSaving: false
			};

			destinations = [...destinations, newDest].sort((a, b) =>
				a.displayName.localeCompare(b.displayName)
			);

			// Also add to original to avoid showing as modified
			originalDestinations = [...originalDestinations, { ...newDest }].sort((a, b) =>
				a.displayName.localeCompare(b.displayName)
			);

			showCreateDialog = false;
		} catch (error) {
			createError = error.message;
		} finally {
			isCreating = false;
		}
	}

	async function saveChanges() {
		saving = true;
		saveError = '';
		successMessage = '';

		try {
			const updates = [...modifiedDestinations().entries()];

			for (const [appId, dest] of updates) {
				const response = await fetch(
					`/admin/destinations/${encodeURIComponent(appId)}/api`,
					{
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							category: dest.category,
							isSystem: dest.isSystem,
							isComingSoon: dest.isComingSoon,
							restrictMerchantAccess: dest.restrictMerchantAccess,
							disableOrderSaving: dest.disableOrderSaving
						})
					}
				);

				if (!response.ok) {
					const result = await response.json();
					throw new Error(result.error || `Failed to save ${dest.displayName}`);
				}
			}

			// Update original to match current
			originalDestinations = JSON.parse(JSON.stringify(destinations));
			successMessage = `${updates.length} destination${updates.length > 1 ? 's' : ''} saved successfully!`;

			// Clear success message after 3 seconds
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (error) {
			saveError = error.message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="space-y-6 pb-24">
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

	{#if successMessage}
		<div
			class="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg"
		>
			<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
			<p class="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
		</div>
	{/if}

	{#if saveError}
		<div
			class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
		>
			<AlertCircle class="h-5 w-5 text-red-600 dark:text-red-400" />
			<p class="text-sm text-red-700 dark:text-red-400">{saveError}</p>
		</div>
	{/if}

	<Card.Root>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Display Name</Table.Head>
					<Table.Head>App ID</Table.Head>
					<Table.Head>Category</Table.Head>
					<Table.Head class="text-center">System</Table.Head>
					<Table.Head class="text-center">Coming Soon</Table.Head>
					<Table.Head class="text-center">Restrict Access</Table.Head>
					<Table.Head>Token Exp.</Table.Head>
					<Table.Head class="text-center">Disable Orders</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each destinations as dest (dest.appId)}
					{@const isModified = modifiedDestinations().has(dest.appId)}
					<Table.Row
						class="cursor-pointer hover:bg-muted/50 {isModified
							? 'bg-yellow-50/50 dark:bg-yellow-950/20'
							: ''}"
						on:click={() => handleRowClick(dest.appId)}
					>
						<Table.Cell class="font-medium">
							{dest.displayName}
							{#if isModified}
								<Badge variant="outline" class="ml-2 text-xs">Modified</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell class="font-mono text-sm text-muted-foreground">
							<span class="max-w-[120px] truncate inline-block align-middle">
								{dest.appId.slice(0, 8)}...
							</span>
							<CopyToClipboard value={dest.appId} />
						</Table.Cell>
						<Table.Cell onclick={(e) => e.stopPropagation()}>
							<div class="min-w-[180px]">
								<CategoryCombobox
									value={dest.category || ''}
									customCategories={data.allCategories}
									onSelect={(val) =>
										updateDestination(dest.appId, 'category', val)}
									placeholder="None"
								/>
							</div>
						</Table.Cell>
						<Table.Cell class="text-center" onclick={(e) => e.stopPropagation()}>
							<Switch
								checked={dest.isSystem}
								onCheckedChange={(checked) =>
									updateDestination(dest.appId, 'isSystem', checked)}
							/>
						</Table.Cell>
						<Table.Cell class="text-center" onclick={(e) => e.stopPropagation()}>
							<Switch
								checked={dest.isComingSoon}
								onCheckedChange={(checked) =>
									updateDestination(dest.appId, 'isComingSoon', checked)}
							/>
						</Table.Cell>
						<Table.Cell class="text-center" onclick={(e) => e.stopPropagation()}>
							<Switch
								checked={dest.restrictMerchantAccess}
								onCheckedChange={(checked) =>
									updateDestination(
										dest.appId,
										'restrictMerchantAccess',
										checked
									)}
							/>
						</Table.Cell>
						<Table.Cell>{formatTokenExpiration(dest.partnerTokenExpiration)}</Table.Cell
						>
						<Table.Cell class="text-center" onclick={(e) => e.stopPropagation()}>
							<Switch
								checked={dest.disableOrderSaving}
								onCheckedChange={(checked) =>
									updateDestination(dest.appId, 'disableOrderSaving', checked)}
							/>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan="8" class="text-center text-muted-foreground py-8">
							No destinations found
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Root>
</div>

<!-- Sticky Save Footer -->
{#if hasChanges}
	<div class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-4">
		<div class="flex items-center justify-between max-w-7xl mx-auto">
			<p class="text-sm text-muted-foreground">
				{modifiedDestinations().size} destination{modifiedDestinations().size > 1
					? 's'
					: ''} modified
			</p>
			<Button onclick={saveChanges} disabled={saving}>
				{#if saving}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				{:else}
					<Save class="mr-2 h-4 w-4" />
					Save Changes
				{/if}
			</Button>
		</div>
	</div>
{/if}

<CreateDestinationDialog
	bind:open={showCreateDialog}
	onSubmit={handleCreateDestination}
	isSubmitting={isCreating}
	error={createError}
/>
