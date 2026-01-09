<script>
	import MerchantPageHeader from './merchant-page-header.svelte';
	import ProductCard from './product-card.svelte';
	import ProductDetail from './product-detail.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Search from 'lucide-svelte/icons/search';
	import Package from 'lucide-svelte/icons/package';
	import X from 'lucide-svelte/icons/x';

	/**
	 * @type {{
	 *   products: Array<any>,
	 *   loading?: boolean,
	 *   error?: string,
	 *   total?: number,
	 *   hasMore?: boolean,
	 *   loadingMore?: boolean,
	 *   onLoadMore?: () => void,
	 *   onSearch?: (query: string) => void,
	 *   onRetry?: () => void,
	 *   title?: string,
	 *   description?: string
	 * }}
	 */
	let {
		products = [],
		loading = false,
		error = '',
		total = 0,
		hasMore = false,
		loadingMore = false,
		onLoadMore,
		onSearch,
		onRetry,
		title = 'Product Catalog',
		description = 'Browse and manage products available for sale across AI destinations.'
	} = $props();

	// Internal state
	let searchInput = $state('');
	let searchQuery = $state('');
	let searchTimeout;
	let selectedProduct = $state(null);

	// Handle search input with debounce
	function handleSearchInput(e) {
		searchInput = e.target.value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchQuery = searchInput;
			onSearch?.(searchQuery);
		}, 300);
	}

	// Handle search submit (Enter key)
	function handleSearchKeydown(e) {
		if (e.key === 'Enter') {
			clearTimeout(searchTimeout);
			searchQuery = searchInput;
			onSearch?.(searchQuery);
		}
	}

	// Clear search
	function clearSearch() {
		searchInput = '';
		searchQuery = '';
		onSearch?.('');
	}

	// Handle product selection
	function handleProductClick(product) {
		selectedProduct = product;
	}

	function handleBack() {
		selectedProduct = null;
	}
</script>

{#if selectedProduct}
	<ProductDetail product={selectedProduct} onBack={handleBack} />
{:else}
	<div class="space-y-6">
		<MerchantPageHeader {title} {description} />

		<!-- Search and Stats -->
		<Card.Root>
			<Card.Header class="pb-4">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<!-- Search Input -->
					<div class="relative flex-1 max-w-md">
						<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search products..."
							class="pl-8 pr-8"
							value={searchInput}
							oninput={handleSearchInput}
							onkeydown={handleSearchKeydown}
						/>
						{#if searchInput}
							<button
								type="button"
								class="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
								onclick={clearSearch}
							>
								<X class="h-4 w-4" />
							</button>
						{/if}
					</div>

					<!-- Stats -->
					<div class="flex gap-6 text-sm">
						<div>
							<span class="text-muted-foreground">Total:</span>
							<span class="ml-1 font-semibold">{total}</span>
						</div>
					</div>
				</div>
			</Card.Header>

			<Card.Content>
				{#if loading}
					<div class="flex items-center justify-center py-12">
						<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				{:else if error}
					<div class="py-12 text-center">
						<p class="text-red-600 dark:text-red-400">{error}</p>
						<Button variant="outline" class="mt-4" onclick={onRetry}>Try Again</Button>
					</div>
				{:else if products.length === 0}
					<div class="py-12 text-center">
						<Package class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						{#if searchQuery}
							<h3 class="mb-2 text-lg font-medium">No products found</h3>
							<p class="text-muted-foreground">
								No products match "{searchQuery}". Try a different search term.
							</p>
							<Button variant="outline" class="mt-4" onclick={clearSearch}>
								Clear Search
							</Button>
						{:else}
							<h3 class="mb-2 text-lg font-medium">No products available</h3>
							<p class="text-muted-foreground">
								Products will appear here once they are synced from your store.
							</p>
						{/if}
					</div>
				{:else}
					<!-- Product Grid -->
					<div
						class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					>
						{#each products as product (product.base_sku || product.handle || product.id)}
							<ProductCard {product} onclick={() => handleProductClick(product)} />
						{/each}
					</div>

					<!-- Load More -->
					{#if hasMore}
						<div class="mt-8 flex justify-center">
							<Button variant="outline" onclick={onLoadMore} disabled={loadingMore}>
								{#if loadingMore}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									Loading...
								{:else}
									Load More
								{/if}
							</Button>
						</div>
					{/if}

					<!-- Results info -->
					<div class="mt-4 text-center text-sm text-muted-foreground">
						Showing {products.length} of {total} products
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
