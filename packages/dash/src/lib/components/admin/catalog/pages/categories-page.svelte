<script>
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { PageErrorAlert } from '../shared/index.js';

	let {
		categories = null,
		loading = false,
		error = null,
		onRefresh = () => {},
		onDismissError = () => {}
	} = $props();

	// Local state
	let expandedCategory = $state(null);

	// Derived values
	let totalDomains = $derived(categories?.totalDomains ?? 0);
	let totalProducts = $derived(categories?.totalProducts ?? 0);
	let categoryList = $derived(categories?.categories ?? []);

	function toggleCategory(category) {
		expandedCategory = expandedCategory === category ? null : category;
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader title="Categories" description="Cross-domain product category analysis" />
		<Button variant="outline" onclick={onRefresh} disabled={loading}>
			<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading categories...
			</Card.Content>
		</Card.Root>
	{:else if categories}
		<!-- Stats Summary -->
		<div class="flex gap-6 flex-wrap">
			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground uppercase tracking-wide">Total Domains</span>
				<span class="text-2xl font-bold">{totalDomains}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground uppercase tracking-wide">Total Products</span>
				<span class="text-2xl font-bold">{totalProducts?.toLocaleString()}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground uppercase tracking-wide">Categories</span>
				<span class="text-2xl font-bold">{categoryList?.length}</span>
			</div>
		</div>

		{#if categoryList && categoryList.length > 0}
			<div class="flex flex-col gap-3">
				{#each categoryList as category (category.category)}
					{@const domainCount = Object.keys(category.byDomain || {}).length}
					<Card.Root
						class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
						onclick={() => toggleCategory(category.category)}
					>
						<div class="flex items-center justify-between p-4">
							<div class="flex items-center gap-3">
								<span class="font-semibold">{category.category || 'Uncategorized'}</span>
								<span class="text-sm text-muted-foreground">
									{category.totalCount?.toLocaleString()} products
								</span>
							</div>
							<div class="flex items-center gap-2">
								<Badge variant="outline"
									>{domainCount} {domainCount === 1 ? 'domain' : 'domains'}</Badge
								>
								<ChevronDown
									class="h-5 w-5 text-muted-foreground transition-transform {expandedCategory ===
									category.category
										? 'rotate-180'
										: ''}"
								/>
							</div>
						</div>

						{#if expandedCategory === category.category}
							<div class="px-4 pb-4 border-t">
								<div
									class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mt-3"
								>
									{#each Object.entries(category.byDomain || {}).sort((a, b) => b[1] - a[1]) as [domainName, count] (domainName)}
										<div
											class="flex items-center justify-between p-2 px-3 bg-muted rounded-md text-sm"
										>
											<span
												class="text-muted-foreground truncate max-w-[150px]"
												title={domainName}
											>
												{domainName}
											</span>
											<span class="font-semibold">{count.toLocaleString()}</span>
										</div>
									{/each}
								</div>

								{#if category.rawTypes && category.rawTypes.length > 0}
									<div class="mt-4">
										<div class="text-xs text-muted-foreground uppercase mb-2">
											Raw Types Mapped
										</div>
										<div class="flex flex-wrap gap-2">
											{#each category.rawTypes.slice(0, 10) as rawType (rawType)}
												<Badge variant="secondary" class="text-xs">{rawType}</Badge>
											{/each}
											{#if category.rawTypes.length > 10}
												<Badge variant="secondary" class="text-xs">
													+{category.rawTypes.length - 10} more
												</Badge>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</Card.Root>
				{/each}
			</div>
		{:else}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					<p>No categories found. Run workflows to categorize products.</p>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
