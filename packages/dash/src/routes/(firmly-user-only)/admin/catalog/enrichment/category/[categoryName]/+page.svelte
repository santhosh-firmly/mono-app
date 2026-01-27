<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import ImageOff from 'lucide-svelte/icons/image-off';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import X from 'lucide-svelte/icons/x';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { enrichmentApi } from '$lib/api/catalog/index.js';

	// Get category name from URL
	const categoryName = $derived(decodeURIComponent($page.params.categoryName));

	// Data state
	let categoryDetail = $state(null);
	let products = $state([]);
	let loading = $state(true);
	let loadingProducts = $state(false);
	let loadingMore = $state(false);
	let error = $state(null);

	// All categories for override dropdown
	let allCategories = $state([]);

	// Pagination
	let offset = $state(0);
	let hasMore = $state(false);
	let totalProducts = $state(0);
	const LIMIT = 50;

	// Filters
	let selectedDomain = $state(null);
	let nativeTypeFilter = $state('all');

	// Product detail modal state
	let showProductModal = $state(false);
	let selectedProduct = $state(null);
	let overrideCategory = $state('');
	let overrideReason = $state('');
	let savingOverride = $state(false);
	let overrideSuccess = $state(null);
	let overrideError = $state(null);

	// Domain options for filter
	let domainOptions = $derived.by(() => {
		if (!categoryDetail?.domains) return [];
		return categoryDetail.domains.map((d) => ({
			value: d.domain,
			label: `${d.domain} (${d.mappingCount} types)`
		}));
	});

	// Collect all unique native types from all domains
	let allNativeTypes = $derived.by(() => {
		/** @type {Map<string, number>} */
		const types = new Map();
		if (categoryDetail?.domains) {
			categoryDetail.domains.forEach((d) => {
				d.nativeTypes?.forEach((t) => {
					types.set(t.nativeType, (types.get(t.nativeType) || 0) + 1);
				});
			});
		}
		return Array.from(types.entries()).map(([nativeType, count]) => ({ nativeType, count }));
	});

	// Client-side filtering by native type
	let filteredProducts = $derived.by(() => {
		if (nativeTypeFilter === 'all') return products;
		return products.filter((p) => p.product_type === nativeTypeFilter);
	});

	// Category options for override dropdown
	let categoryOptions = $derived.by(() => {
		return allCategories.map((c) => ({ value: c.name, label: c.name }));
	});

	onMount(async () => {
		await Promise.all([loadCategoryDetail(), loadAllCategories()]);
	});

	async function loadAllCategories() {
		try {
			const response = await enrichmentApi.categories.list();
			allCategories = response.categories || [];
		} catch (e) {
			console.error('Failed to load categories:', e);
		}
	}

	async function loadCategoryDetail() {
		loading = true;
		error = null;
		try {
			categoryDetail = await enrichmentApi.categories.get(categoryName);
			// Auto-select first domain if available
			if (categoryDetail?.domains?.length) {
				selectedDomain = categoryDetail.domains[0].domain;
				await loadProducts(true);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load category';
		} finally {
			loading = false;
		}
	}

	async function loadProducts(reset = false) {
		if (!selectedDomain) {
			products = [];
			totalProducts = 0;
			hasMore = false;
			return;
		}

		if (reset) {
			products = [];
			offset = 0;
			hasMore = false;
		}

		if (!hasMore && !reset) return;

		loadingProducts = reset;
		loadingMore = !reset;
		error = null;

		try {
			const response = await enrichmentApi.categories.getProducts(categoryName, {
				domain: selectedDomain,
				limit: LIMIT,
				offset: offset
			});

			if (reset) {
				products = response.products || [];
			} else {
				products = [...products, ...(response.products || [])];
			}

			totalProducts = response.pagination?.total ?? 0;
			hasMore = response.pagination?.hasMore ?? false;
			offset += response.products?.length || 0;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load products';
		} finally {
			loadingProducts = false;
			loadingMore = false;
		}
	}

	function handleDomainChange(e) {
		selectedDomain = e.target.value;
		loadProducts(true);
	}

	function handleScroll(event) {
		const target = event.target;
		const scrollPosition = target.scrollTop + target.clientHeight;
		const scrollHeight = target.scrollHeight;

		if (scrollPosition >= scrollHeight - 200 && !loadingMore && hasMore && selectedDomain) {
			loadProducts();
		}
	}

	function openProductModal(product) {
		selectedProduct = product;
		overrideCategory = product.enriched_product_type || categoryName;
		overrideReason = '';
		overrideSuccess = null;
		overrideError = null;
		showProductModal = true;
	}

	function closeProductModal() {
		showProductModal = false;
		selectedProduct = null;
		overrideCategory = '';
		overrideReason = '';
		overrideSuccess = null;
		overrideError = null;
	}

	async function saveOverride() {
		if (!selectedProduct || !selectedDomain || !overrideCategory) return;

		savingOverride = true;
		overrideError = null;
		overrideSuccess = null;

		try {
			const countryCode = 'US';
			const pdpUrl = selectedProduct.pdp_url || '';

			if (!pdpUrl) {
				throw new Error('Product URL is required for override');
			}

			await enrichmentApi.products.setOverride(selectedDomain, countryCode, {
				pdp_url: pdpUrl,
				enriched_product_type: overrideCategory,
				notes: overrideReason || undefined
			});

			overrideSuccess = `Category updated to "${overrideCategory}"`;

			// Update the product in the local list
			const productIndex = products.findIndex((p) => p.pdp_url === pdpUrl);
			if (productIndex !== -1) {
				products[productIndex] = {
					...products[productIndex],
					enriched_product_type: overrideCategory
				};
				products = [...products];
			}

			setTimeout(() => {
				closeProductModal();
			}, 1500);
		} catch (e) {
			overrideError = e instanceof Error ? e.message : 'Failed to save override';
		} finally {
			savingOverride = false;
		}
	}

	async function deleteOverride() {
		if (!selectedProduct || !selectedDomain) return;

		savingOverride = true;
		overrideError = null;

		try {
			const countryCode = 'US';
			const pdpUrl = selectedProduct.pdp_url || '';

			if (!pdpUrl) {
				throw new Error('Product URL is required');
			}

			await enrichmentApi.products.deleteOverride(selectedDomain, countryCode, pdpUrl);
			overrideSuccess = 'Override removed successfully';

			setTimeout(() => {
				closeProductModal();
				loadProducts(true);
			}, 1500);
		} catch (e) {
			overrideError = e instanceof Error ? e.message : 'Failed to delete override';
		} finally {
			savingOverride = false;
		}
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<!-- Header -->
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
			<a href="/admin/catalog/enrichment" class="text-primary hover:underline">Enrichment</a>
			<span>/</span>
			<span>{categoryName}</span>
		</div>
		<PageHeader
			title={categoryName}
			description={categoryDetail?.category?.description || 'Category details'}
		/>
	</div>

	{#if error}
		<div
			class="rounded-lg bg-destructive/10 p-4 text-destructive flex items-center justify-between"
		>
			<span>{error}</span>
			<Button variant="ghost" size="sm" onclick={() => (error = null)}>Dismiss</Button>
		</div>
	{/if}

	{#if loading && !products.length}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading category data...
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Stats Row -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Total Products</div>
					<div class="text-2xl font-bold">
						{(
							categoryDetail?.category?.product_count ??
							categoryDetail?.totalProducts ??
							0
						).toLocaleString()}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Domains</div>
					<div class="text-2xl font-bold">{categoryDetail?.domains?.length ?? 0}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Native Types</div>
					<div class="text-2xl font-bold">{allNativeTypes.length}</div>
				</Card.Content>
			</Card.Root>
			{#if categoryDetail?.category?.aliases?.length}
				<Card.Root>
					<Card.Content class="p-4">
						<div class="text-xs text-muted-foreground uppercase mb-1">Aliases</div>
						<div class="text-2xl font-bold">
							{categoryDetail.category.aliases.length}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Breakdown Charts -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- By Domain -->
			{#if categoryDetail?.domains && categoryDetail.domains.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">By Domain</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
							{#each categoryDetail.domains as item (item.domain)}
								{@const maxMappings = Math.max(
									...categoryDetail.domains.map((d) => d.mappingCount)
								)}
								<div class="flex items-center gap-3 text-sm">
									<span
										class="flex-1 truncate text-muted-foreground"
										title={item.domain}
									>
										{item.domain}
									</span>
									<div class="w-24 h-2 bg-muted rounded-full overflow-hidden">
										<div
											class="h-full bg-primary rounded-full"
											style="width: {(item.mappingCount / maxMappings) *
												100}%"
										></div>
									</div>
									<span class="w-20 text-right text-muted-foreground"
										>{item.mappingCount} types</span
									>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- By Native Type -->
			{#if allNativeTypes.length > 0}
				{@const maxCount = Math.max(...allNativeTypes.map((t) => t.count))}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">By Native Type</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
							{#each allNativeTypes.slice(0, 15) as item (item.nativeType)}
								<div class="flex items-center gap-3 text-sm">
									<span
										class="flex-1 truncate text-muted-foreground"
										title={item.nativeType}
									>
										{item.nativeType || '(empty)'}
									</span>
									<div class="w-24 h-2 bg-muted rounded-full overflow-hidden">
										<div
											class="h-full bg-yellow-500 rounded-full"
											style="width: {(item.count / maxCount) * 100}%"
										></div>
									</div>
									<span class="w-12 text-right text-muted-foreground"
										>{item.count}</span
									>
								</div>
							{/each}
							{#if allNativeTypes.length > 15}
								<div class="text-xs text-muted-foreground">
									+{allNativeTypes.length - 15} more types
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Products Section -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">
					Products {#if selectedDomain}<span class="font-normal text-muted-foreground"
							>from {selectedDomain}</span
						>{/if}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<!-- Filters -->
				<div class="flex gap-4 flex-wrap mb-4">
					<div class="min-w-[200px]">
						<Label for="domain-select">Domain (required)</Label>
						<select
							id="domain-select"
							value={selectedDomain || ''}
							onchange={handleDomainChange}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
						>
							<option value="" disabled>Select domain...</option>
							{#each domainOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>
					<div class="min-w-[200px]">
						<Label for="type-filter">Native Type</Label>
						<select
							id="type-filter"
							bind:value={nativeTypeFilter}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
						>
							<option value="all">All Native Types</option>
							{#each allNativeTypes.slice(0, 20) as t (t.nativeType)}
								<option value={t.nativeType}>{t.nativeType} ({t.count})</option>
							{/each}
						</select>
					</div>
				</div>

				{#if !selectedDomain}
					<div class="py-12 text-center text-muted-foreground">
						<p>Select a domain to view products.</p>
					</div>
				{:else if loadingProducts}
					<div class="flex items-center justify-center py-12 text-muted-foreground">
						<RefreshCw class="h-5 w-5 animate-spin mr-2" />
						Loading products...
					</div>
				{:else}
					<p class="text-sm text-muted-foreground mb-4">
						Showing {filteredProducts.length} of {totalProducts.toLocaleString()} products
						{#if nativeTypeFilter !== 'all'}
							<span class="text-primary">(filtered by type)</span>
						{/if}
					</p>

					<div class="max-h-[600px] overflow-y-auto" onscroll={handleScroll}>
						{#if filteredProducts.length === 0}
							<div class="py-12 text-center text-muted-foreground">
								<p>
									No products found{nativeTypeFilter !== 'all'
										? ' matching filter'
										: ' for this domain'}.
								</p>
							</div>
						{:else}
							<div
								class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
							>
								{#each filteredProducts as product (product.pdp_url || product.handle)}
									<button
										type="button"
										class="border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all text-left bg-background"
										onclick={() => openProductModal(product)}
									>
										{#if product.imageUrl}
											<img
												src={product.imageUrl}
												alt={product.title}
												class="w-full h-28 object-contain bg-muted rounded mb-3"
											/>
										{:else}
											<div
												class="w-full h-28 bg-muted rounded mb-3 flex items-center justify-center"
											>
												<ImageOff class="h-8 w-8 text-muted-foreground" />
											</div>
										{/if}

										<div
											class="font-medium text-sm line-clamp-2 mb-1"
											title={product.title}
										>
											{product.title}
										</div>

										<div class="text-xs text-muted-foreground mb-2">
											{product.handle}
										</div>

										<div class="flex flex-wrap gap-1">
											{#if product.product_type}
												<Badge
													variant="outline"
													class="text-xs bg-yellow-500/10 text-yellow-600"
												>
													{product.product_type}
												</Badge>
											{/if}
											{#if product.enriched_product_type}
												<Badge
													variant="default"
													class="text-xs bg-green-500/10 text-green-600"
												>
													{product.enriched_product_type}
												</Badge>
											{/if}
										</div>
									</button>
								{/each}
							</div>
						{/if}

						{#if loadingMore}
							<div
								class="flex items-center justify-center py-4 text-muted-foreground"
							>
								<RefreshCw class="h-4 w-4 animate-spin mr-2" />
								Loading more products...
							</div>
						{:else if hasMore}
							<div class="text-center py-4">
								<Button variant="outline" size="sm" onclick={() => loadProducts()}>
									Load more
								</Button>
							</div>
						{:else if products.length > 0}
							<div class="text-center py-4 text-sm text-muted-foreground">
								No more products to load
							</div>
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- Product Review/Override Modal -->
{#if showProductModal && selectedProduct}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={closeProductModal}
		onkeydown={(e) => {
			if (e.key === 'Escape') closeProductModal();
		}}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="bg-background rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] flex flex-col"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between p-4 border-b">
				<h3 class="font-semibold">Review Product Enrichment</h3>
				<Button variant="ghost" size="sm" onclick={closeProductModal}>
					<X class="h-4 w-4" />
				</Button>
			</div>
			<div class="flex-1 overflow-auto p-4">
				<!-- Product Details -->
				<div class="flex gap-4 mb-4">
					{#if selectedProduct.imageUrl}
						<img
							src={selectedProduct.imageUrl}
							alt={selectedProduct.title}
							class="w-24 h-24 object-contain bg-muted rounded flex-shrink-0"
						/>
					{:else}
						<div
							class="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0"
						>
							<ImageOff class="h-8 w-8 text-muted-foreground" />
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<h4 class="font-semibold mb-1">{selectedProduct.title}</h4>
						<p class="text-sm text-muted-foreground mb-1">
							Handle: {selectedProduct.handle}
						</p>
						{#if selectedProduct.vendor}
							<p class="text-sm text-muted-foreground mb-1">
								Vendor: {selectedProduct.vendor}
							</p>
						{/if}
						{#if selectedProduct.pdp_url}
							<a
								href={selectedProduct.pdp_url}
								target="_blank"
								rel="noopener"
								class="text-sm text-primary hover:underline inline-flex items-center gap-1"
							>
								View Product Page <ExternalLink class="h-3 w-3" />
							</a>
						{/if}
					</div>
				</div>

				<!-- Current Enrichment Info -->
				<div class="flex items-center gap-2 p-3 bg-muted/50 rounded mb-4 text-sm flex-wrap">
					<span class="text-muted-foreground">Native Type:</span>
					<span class="font-medium">{selectedProduct.product_type || '(none)'}</span>
					<span class="text-muted-foreground mx-2">|</span>
					<span class="text-muted-foreground">Current Category:</span>
					<span class="font-medium"
						>{selectedProduct.enriched_product_type || '(none)'}</span
					>
				</div>

				<!-- Success/Error Messages -->
				{#if overrideSuccess}
					<div class="bg-green-500/10 text-green-600 p-3 rounded text-sm mb-4">
						{overrideSuccess}
					</div>
				{/if}
				{#if overrideError}
					<div class="bg-destructive/10 text-destructive p-3 rounded text-sm mb-4">
						{overrideError}
					</div>
				{/if}

				<!-- Override Form -->
				<div class="bg-muted/50 rounded-lg p-4">
					<h4 class="font-semibold text-sm mb-3">Override Enrichment Category</h4>
					<div class="flex flex-col gap-4">
						<div>
							<Label for="override-category">New Category</Label>
							<select
								id="override-category"
								bind:value={overrideCategory}
								class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
							>
								<option value="" disabled>Select a category...</option>
								{#each categoryOptions as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>
						<div>
							<Label for="override-reason">Reason (optional)</Label>
							<Input
								id="override-reason"
								placeholder="Why are you changing this category?"
								bind:value={overrideReason}
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="flex justify-between p-4 border-t">
				<Button
					variant="ghost"
					size="sm"
					onclick={deleteOverride}
					disabled={savingOverride}
				>
					Remove Override
				</Button>
				<div class="flex gap-3">
					<Button variant="outline" size="sm" onclick={closeProductModal}>Cancel</Button>
					<Button
						size="sm"
						onclick={saveOverride}
						disabled={!overrideCategory ||
							overrideCategory === selectedProduct.enriched_product_type ||
							savingOverride}
					>
						{#if savingOverride}
							<RefreshCw class="h-3 w-3 mr-1 animate-spin" />
						{/if}
						Save Override
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
