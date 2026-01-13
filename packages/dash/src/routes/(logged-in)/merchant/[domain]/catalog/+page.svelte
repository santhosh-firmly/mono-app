<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import SelectionCard from '$lib/components/merchant/selection-card.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Package from 'lucide-svelte/icons/package';
	import PackageOpen from 'lucide-svelte/icons/package-open';
	import Save from 'lucide-svelte/icons/save';
	import { adminFetch } from '$lib/utils/fetch.js';

	let domain = $derived($page.params.domain);

	// State
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let selection = $state(null);
	let originalSelection = $state(null);

	// Check if there are unsaved changes
	let hasChanges = $derived(selection !== originalSelection && selection !== null);

	// Fetch current configuration
	async function fetchConfiguration() {
		loading = true;
		error = '';

		try {
			const response = await adminFetch(`/merchant/${domain}/catalog/api`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch configuration');
			}

			// If there's an existing config, use it; otherwise default to 'full'
			if (result.catalogType) {
				selection = result.catalogType;
				originalSelection = result.catalogType;
			} else {
				// Default to 'full' (Entire Catalog) for new configurations
				selection = 'full';
				originalSelection = null;
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// Save configuration
	async function saveConfiguration() {
		if (!selection) return;

		saving = true;
		error = '';
		successMessage = '';

		try {
			const response = await adminFetch(`/merchant/${domain}/catalog/api`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ catalogType: selection })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to save configuration');
			}

			originalSelection = selection;

			if (result.isFirstTimeSave) {
				// Invalidate all data first, then redirect to dashboard
				await invalidateAll();
				goto(`/merchant/${domain}`);
				return;
			}
			successMessage = 'Catalog configuration updated successfully!';
		} catch (err) {
			error = err.message;
		} finally {
			saving = false;
		}
	}

	// Initial fetch
	$effect(() => {
		fetchConfiguration();
	});
</script>

<div class="space-y-6">
	<MerchantPageHeader
		title="Catalog Configuration"
		description="Choose which products from {domain} you'd like to make available across AI destinations."
	/>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title>Product Selection Mode</Card.Title>
				<Card.Description>
					Select how you want to manage your product catalog across AI destinations.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<!-- Entire Catalog Option -->
				<SelectionCard
					selected={selection === 'full'}
					onclick={() => (selection = 'full')}
					icon={Package}
					iconClass="text-primary"
					title="Entire Catalog"
					description="Sell all products from your store across enabled destinations. New products will be automatically synced and made available."
					features={[
						{ text: 'Automatic product synchronization' },
						{ text: 'Real-time inventory updates' },
						{ text: 'New products auto-added' },
						{ text: 'Fastest time to market' }
					]}
					recommendation={{
						text: '<strong>Recommended:</strong> Best for merchants who want maximum exposure and simplified management',
						variant: 'primary'
					}}
				/>

				<!-- Selected Products Option -->
				<SelectionCard
					selected={selection === 'subset'}
					onclick={() => (selection = 'subset')}
					icon={PackageOpen}
					iconClass="text-orange-600 dark:text-orange-400"
					title="Selected Products (Subset)"
					description="Choose specific product categories or individual products to sell. Maintain full control over which items appear on each destination."
					features={[
						{ text: 'Granular product control' },
						{ text: 'Category-level filtering' },
						{ text: 'Destination-specific catalogs' },
						{ text: 'Test with limited inventory' }
					]}
					recommendation={{
						text: '<strong>Advanced:</strong> Configure product selection after whitelisting setup',
						variant: 'secondary'
					}}
				/>

				{#if error}
					<div
						class="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
					>
						<p class="text-sm text-red-700 dark:text-red-400">{error}</p>
					</div>
				{/if}

				{#if successMessage}
					<div
						class="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg"
					>
						<p class="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-end border-t px-6 py-4">
				<Button onclick={saveConfiguration} disabled={saving || !hasChanges}>
					{#if saving}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						<Save class="mr-2 h-4 w-4" />
						Save Configuration
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
