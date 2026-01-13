<script>
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { EmptyState } from '$lib/components/ui/empty-state/index.js';
	import Store from 'lucide-svelte/icons/store';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import { formatCurrency } from '$lib/currency.js';
	import { adminFetch } from '$lib/utils/fetch.js';

	let appId = $derived($page.params.app_id);

	// State
	let merchants = $state([]);
	let loading = $state(true);
	let error = $state('');
	let sortField = $state('revenue');
	let sortOrder = $state('desc');

	// Fetch merchants on mount
	$effect(() => {
		fetchMerchants();
	});

	async function fetchMerchants() {
		loading = true;
		error = '';

		try {
			const params = new URLSearchParams({
				sort: sortField,
				order: sortOrder
			});

			const response = await adminFetch(
				`/destination/${appId}/merchants/api?${params.toString()}`
			);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch merchants');
			}

			merchants = result.merchants;
		} catch (err) {
			error = err.message;
			merchants = [];
		} finally {
			loading = false;
		}
	}

	function handleSort(field) {
		if (sortField === field) {
			// Toggle order
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			// New field, default to desc
			sortField = field;
			sortOrder = 'desc';
		}
		fetchMerchants();
	}

	function getSortIcon(field) {
		if (sortField !== field) return ArrowUpDown;
		return sortOrder === 'asc' ? ArrowUp : ArrowDown;
	}

	function getInitials(name) {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	// Calculate totals
	let totalRevenue = $derived(merchants.reduce((sum, m) => sum + (m.totalRevenue || 0), 0));
	let totalOrders = $derived(merchants.reduce((sum, m) => sum + (m.totalOrders || 0), 0));
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Merchants</h1>
		<p class="text-muted-foreground">View performance across all your merchants</p>
	</div>

	<Card.Root>
		<Card.Header class="px-7">
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Merchant Performance</Card.Title>
					<Card.Description>
						{#if merchants.length > 0}
							{merchants.length} merchant{merchants.length !== 1 ? 's' : ''} - Month to
							date
						{:else}
							No merchants found
						{/if}
					</Card.Description>
				</div>
				{#if merchants.length > 0}
					<div class="text-right text-sm text-muted-foreground">
						<div>Total: {formatCurrency(totalRevenue)}</div>
						<div>{totalOrders.toLocaleString()} orders</div>
					</div>
				{/if}
			</div>
		</Card.Header>
		<Card.Content>
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if error}
				<div class="py-12 text-center text-red-600">
					{error}
				</div>
			{:else if merchants.length === 0}
				<EmptyState
					icon={Store}
					title="No merchants found"
					description="Merchants will appear here once they are connected to your destination."
				/>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Merchant</Table.Head>
							<Table.Head>
								<Button
									variant="ghost"
									size="sm"
									class="h-8 -ml-3 font-medium"
									onclick={() => handleSort('revenue')}
								>
									Revenue
									<svelte:component
										this={getSortIcon('revenue')}
										class="ml-2 h-4 w-4"
									/>
								</Button>
							</Table.Head>
							<Table.Head class="hidden md:table-cell">
								<Button
									variant="ghost"
									size="sm"
									class="h-8 -ml-3 font-medium"
									onclick={() => handleSort('orders')}
								>
									Orders
									<svelte:component
										this={getSortIcon('orders')}
										class="ml-2 h-4 w-4"
									/>
								</Button>
							</Table.Head>
							<Table.Head class="hidden lg:table-cell text-right">
								<Button
									variant="ghost"
									size="sm"
									class="h-8 -mr-3 font-medium"
									onclick={() => handleSort('aov')}
								>
									AOV
									<svelte:component
										this={getSortIcon('aov')}
										class="ml-2 h-4 w-4"
									/>
								</Button>
							</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each merchants as merchant (merchant.domain)}
							{@const percentage =
								totalRevenue > 0 ? (merchant.totalRevenue / totalRevenue) * 100 : 0}
							<Table.Row>
								<Table.Cell>
									<div class="flex items-center gap-3">
										<Avatar.Root class="h-9 w-9 border border-border">
											<Avatar.Fallback
												class="bg-primary/10 text-primary text-xs font-medium"
											>
												{getInitials(merchant.displayName)}
											</Avatar.Fallback>
										</Avatar.Root>
										<div class="min-w-0">
											<div class="font-medium truncate">
												{merchant.displayName}
											</div>
											{#if merchant.displayName !== merchant.domain}
												<div class="text-xs text-muted-foreground truncate">
													{merchant.domain}
												</div>
											{/if}
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="space-y-1">
										<div class="font-medium">
											{formatCurrency(merchant.totalRevenue)}
										</div>
										<div class="flex items-center gap-2">
											<div
												class="flex-1 bg-muted rounded-full h-1.5 overflow-hidden max-w-20"
											>
												<div
													class="h-full bg-primary rounded-full transition-all"
													style="width: {percentage}%"
												></div>
											</div>
											<span class="text-xs text-muted-foreground">
												{percentage.toFixed(1)}%
											</span>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell class="hidden md:table-cell">
									{merchant.totalOrders.toLocaleString()}
								</Table.Cell>
								<Table.Cell class="hidden lg:table-cell text-right">
									{formatCurrency(merchant.aov)}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
