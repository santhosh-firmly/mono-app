<script>
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import StoreIcon from 'lucide-svelte/icons/store';
	import Save from 'lucide-svelte/icons/save';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { formatCurrency } from '$lib/currency.js';

	/**
	 * @type {{
	 *   domain: string,
	 *   destinations: Array<{id: string, name: string, category: string|null, orders: number, aov: number|null, disputeRate: number|null, reputationScore: number|null, isActive: boolean, isComingSoon: boolean, canToggle: boolean}>,
	 *   loading: boolean,
	 *   saving: boolean,
	 *   error: string,
	 *   successMessage: string,
	 *   hasExistingConfig: boolean,
	 *   hasChanges: boolean,
	 *   onToggle: (id: string) => void,
	 *   onSave: () => Promise<void>
	 * }}
	 */
	let {
		domain = '',
		destinations = [],
		loading = false,
		saving = false,
		error = '',
		successMessage = '',
		hasExistingConfig = true,
		hasChanges = false,
		onToggle = () => {},
		onSave = async () => {}
	} = $props();

	// Computed values
	let activeDestinations = $derived(
		destinations.filter((d) => d.isActive && !d.isComingSoon).length
	);
	let totalOrders = $derived(
		destinations.reduce((sum, d) => sum + (typeof d.orders === 'number' ? d.orders : 0), 0)
	);
	let avgOrderValue = $derived(() => {
		const withAov = destinations.filter((d) => d.aov !== null && d.aov > 0);
		if (withAov.length === 0) return 0;
		return withAov.reduce((sum, d) => sum + d.aov, 0) / withAov.length;
	});

	// Group destinations by category
	let groupedDestinations = $derived(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- Map is temporary, converted to array before return
		const groups = new Map();

		for (const dest of destinations) {
			const cat = dest.category || 'Other';
			if (!groups.has(cat)) {
				groups.set(cat, []);
			}
			groups.get(cat).push(dest);
		}

		// Sort destinations alphabetically within each group
		for (const [, dests] of groups) {
			dests.sort((a, b) => a.name.localeCompare(b.name));
		}

		// Convert to array and sort groups alphabetically, "Other" last
		return [...groups.entries()].sort((a, b) => {
			if (a[0] === 'Other') return 1;
			if (b[0] === 'Other') return -1;
			return a[0].localeCompare(b[0]);
		});
	});

	// Track which groups are expanded (all expanded by default)
	let expandedGroups = $state(new Set());

	// Initialize expanded groups when destinations change
	$effect(() => {
		const categories = groupedDestinations().map(([cat]) => cat);
		expandedGroups = new Set(categories);
	});

	function toggleGroup(category) {
		if (expandedGroups.has(category)) {
			expandedGroups = new Set([...expandedGroups].filter((c) => c !== category));
		} else {
			expandedGroups = new Set([...expandedGroups, category]);
		}
	}

	// Allow saving on first visit to complete onboarding, even without changes
	let canSave = $derived(() => {
		return hasChanges || !hasExistingConfig;
	});

	function getReputationColor(score) {
		if (score === null || score === undefined) return 'text-muted-foreground';
		if (score >= 4.5) return 'text-green-600 dark:text-green-400';
		if (score >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-orange-600 dark:text-orange-400';
	}

	function getDisputeRateColor(rate) {
		if (rate === null || rate === undefined) return 'text-muted-foreground';
		if (rate <= 1.0) return 'text-green-600 dark:text-green-400';
		if (rate <= 2.0) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	}
</script>

<div class="space-y-6">
	<MerchantPageHeader
		title="Destination Management"
		description="Choose where you want {domain} products to be available for purchase."
	/>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if error && destinations.length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center text-red-600">
				{error}
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header>
				<div class="flex flex-col gap-4">
					<div>
						<Card.Title>Destinations</Card.Title>
						<Card.Description>
							Enable or disable destinations where your products can be sold.
						</Card.Description>
					</div>
					<div class="flex gap-6 pt-4 border-t border-border">
						<div>
							<p class="text-sm text-muted-foreground">Active Destinations</p>
							<p class="text-2xl font-semibold text-foreground">
								{activeDestinations}
							</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Total Orders</p>
							<p class="text-2xl font-semibold text-foreground">
								{totalOrders.toLocaleString()}
							</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Avg. Order Value</p>
							<p class="text-2xl font-semibold text-foreground">
								{avgOrderValue() > 0 ? formatCurrency(avgOrderValue()) : '-'}
							</p>
						</div>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				{#if !hasExistingConfig}
					<div class="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
						<p class="text-sm text-primary">
							Review the destinations below and click "Confirm Configuration" to
							complete this onboarding step. You can update your destination
							preferences at any time.
						</p>
					</div>
				{/if}

				{#if destinations.length === 0}
					<div class="py-12 text-center">
						<StoreIcon class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h3 class="mb-2 text-lg font-medium">No destinations available</h3>
						<p class="text-muted-foreground">
							Destinations will appear here once they are configured.
						</p>
					</div>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row class="bg-muted/50">
								<Table.Head>Destination / Agent</Table.Head>
								<Table.Head class="text-right hidden sm:table-cell"
									>Orders</Table.Head
								>
								<Table.Head class="text-right hidden md:table-cell">AOV</Table.Head>
								<Table.Head class="text-right hidden lg:table-cell"
									>Dispute Rate</Table.Head
								>
								<Table.Head class="text-right hidden lg:table-cell"
									>Reputation Score</Table.Head
								>
								<Table.Head class="text-center">Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each groupedDestinations() as [category, categoryDestinations] (category)}
								<Table.Row
									class="bg-muted/30 hover:bg-muted/50 cursor-pointer"
									onclick={() => toggleGroup(category)}
								>
									<Table.Cell colspan="6">
										<div class="flex items-center gap-2">
											{#if expandedGroups.has(category)}
												<ChevronDown
													class="h-4 w-4 text-muted-foreground"
												/>
											{:else}
												<ChevronRight
													class="h-4 w-4 text-muted-foreground"
												/>
											{/if}
											<span class="font-medium">{category}</span>
											<Badge variant="secondary" class="text-xs">
												{categoryDestinations.length}
											</Badge>
										</div>
									</Table.Cell>
								</Table.Row>
								{#if expandedGroups.has(category)}
									{#each categoryDestinations as destination (destination.id)}
										<Table.Row class="hover:bg-muted/50">
											<Table.Cell>
												<div class="flex items-center gap-2 pl-6">
													<span class="font-medium"
														>{destination.name}</span
													>
													{#if destination.isComingSoon}
														<Badge variant="outline" class="text-xs"
															>Coming Soon</Badge
														>
													{/if}
												</div>
											</Table.Cell>
											<Table.Cell class="text-right hidden sm:table-cell">
												{#if destination.isComingSoon}
													<span class="text-muted-foreground">-</span>
												{:else}
													{typeof destination.orders === 'number'
														? destination.orders.toLocaleString()
														: destination.orders}
												{/if}
											</Table.Cell>
											<Table.Cell class="text-right hidden md:table-cell">
												{destination.aov !== null
													? formatCurrency(destination.aov)
													: '-'}
											</Table.Cell>
											<Table.Cell class="text-right hidden lg:table-cell">
												{#if destination.disputeRate !== null}
													<span
														class={getDisputeRateColor(
															destination.disputeRate
														)}
													>
														{destination.disputeRate.toFixed(1)}%
													</span>
												{:else}
													<span class="text-muted-foreground">-</span>
												{/if}
											</Table.Cell>
											<Table.Cell class="text-right hidden lg:table-cell">
												{#if destination.reputationScore !== null}
													<span
														class={getReputationColor(
															destination.reputationScore
														)}
													>
														{destination.reputationScore.toFixed(1)} / 5.0
													</span>
												{:else}
													<span class="text-muted-foreground">-</span>
												{/if}
											</Table.Cell>
											<Table.Cell class="text-center">
												<div class="flex items-center justify-center gap-2">
													<Switch
														checked={destination.isActive}
														disabled={!destination.canToggle}
														on:click={() => onToggle(destination.id)}
													/>
												</div>
											</Table.Cell>
										</Table.Row>
									{/each}
								{/if}
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}

				{#if error}
					<div
						class="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
					>
						<p class="text-sm text-red-700 dark:text-red-400">{error}</p>
					</div>
				{/if}

				{#if successMessage}
					<div
						class="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg"
					>
						<p class="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-end border-t px-6 py-4">
				<Button onclick={onSave} disabled={saving || !canSave()}>
					{#if saving}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else if !hasExistingConfig}
						<Save class="mr-2 h-4 w-4" />
						Confirm Configuration
					{:else}
						<Save class="mr-2 h-4 w-4" />
						Save Configuration
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
