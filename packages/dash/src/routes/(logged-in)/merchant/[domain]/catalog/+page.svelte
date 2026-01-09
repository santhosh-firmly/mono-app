<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Package from 'lucide-svelte/icons/package';
	import PackageOpen from 'lucide-svelte/icons/package-open';
	import Save from 'lucide-svelte/icons/save';
	import Check from 'lucide-svelte/icons/check';

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
			const response = await fetch(`/merchant/${domain}/catalog/api`);
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
			const response = await fetch(`/merchant/${domain}/catalog/api`, {
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
				// Redirect to dashboard after completing onboarding step
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
				<button
					type="button"
					class={[
						'w-full border-2 rounded-lg p-6 text-left transition-all',
						selection === 'full'
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-muted-foreground/50'
					]}
					onclick={() => (selection = 'full')}
				>
					<div class="flex items-start gap-4">
						<div
							class={[
								'flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5',
								selection === 'full'
									? 'border-primary bg-primary'
									: 'border-muted-foreground/50'
							]}
						>
							{#if selection === 'full'}
								<Check class="h-3 w-3 text-white" />
							{/if}
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<Package class="h-5 w-5 text-primary" />
								<span class="text-lg font-medium text-foreground"
									>Entire Catalog</span
								>
							</div>
							<p class="text-sm text-muted-foreground mb-3">
								Sell all products from your store across enabled destinations. New
								products will be automatically synced and made available.
							</p>
							<div class="space-y-1.5">
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Automatic product synchronization</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Real-time inventory updates</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>New products auto-added</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Fastest time to market</span>
								</div>
							</div>
							<div class="mt-4 bg-primary/10 border border-primary/20 rounded p-3">
								<p class="text-sm text-primary">
									<strong>Recommended:</strong> Best for merchants who want maximum
									exposure and simplified management
								</p>
							</div>
						</div>
					</div>
				</button>

				<!-- Selected Products Option -->
				<button
					type="button"
					class={[
						'w-full border-2 rounded-lg p-6 text-left transition-all',
						selection === 'subset'
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-muted-foreground/50'
					]}
					onclick={() => (selection = 'subset')}
				>
					<div class="flex items-start gap-4">
						<div
							class={[
								'flex h-5 w-5 items-center justify-center rounded-full border-2 mt-0.5',
								selection === 'subset'
									? 'border-primary bg-primary'
									: 'border-muted-foreground/50'
							]}
						>
							{#if selection === 'subset'}
								<Check class="h-3 w-3 text-white" />
							{/if}
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<PackageOpen class="h-5 w-5 text-orange-600 dark:text-orange-400" />
								<span class="text-lg font-medium text-foreground"
									>Selected Products (Subset)</span
								>
							</div>
							<p class="text-sm text-muted-foreground mb-3">
								Choose specific product categories or individual products to sell.
								Maintain full control over which items appear on each destination.
							</p>
							<div class="space-y-1.5">
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Granular product control</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Category-level filtering</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Destination-specific catalogs</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<span class="text-green-600 dark:text-green-400">✓</span>
									<span>Test with limited inventory</span>
								</div>
							</div>
							<div
								class="mt-4 bg-orange-500/10 border border-orange-500/20 rounded p-3"
							>
								<p class="text-sm text-orange-700 dark:text-orange-400">
									<strong>Advanced:</strong> Configure product selection after whitelisting
									setup
								</p>
							</div>
						</div>
					</div>
				</button>

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
