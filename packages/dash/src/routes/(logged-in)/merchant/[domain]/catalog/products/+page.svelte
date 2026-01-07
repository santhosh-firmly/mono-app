<script>
	import { page } from '$app/stores';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import ProductCatalog from '$lib/components/merchant/product-catalog.svelte';

	let domain = $derived($page.params.domain);

	// State
	let products = $state([]);
	let loading = $state(true);
	let error = $state('');
	let total = $state(0);
	let hasMore = $state(false);
	let offset = $state(0);
	let loadingMore = $state(false);
	let searchQuery = $state('');

	const LIMIT = 24;

	// Fetch products
	async function fetchProducts(reset = false) {
		if (reset) {
			offset = 0;
			loading = true;
		} else {
			loadingMore = true;
		}
		error = '';

		try {
			const params = new SvelteURLSearchParams({
				limit: LIMIT.toString(),
				offset: reset ? '0' : offset.toString()
			});

			if (searchQuery) {
				params.set('search', searchQuery);
			}

			const response = await fetch(`/merchant/${domain}/catalog/products/api?${params}`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch products');
			}

			if (reset) {
				products = result.products;
			} else {
				products = [...products, ...result.products];
			}

			total = result.total;
			hasMore = result.hasMore;
			offset = reset ? LIMIT : offset + LIMIT;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	// Handle search
	function handleSearch(query) {
		searchQuery = query;
		fetchProducts(true);
	}

	// Handle load more
	function handleLoadMore() {
		fetchProducts(false);
	}

	// Handle retry
	function handleRetry() {
		fetchProducts(true);
	}

	// Initial fetch
	$effect(() => {
		fetchProducts(true);
	});
</script>

<ProductCatalog
	{products}
	{loading}
	{error}
	{total}
	{hasMore}
	{loadingMore}
	onSearch={handleSearch}
	onLoadMore={handleLoadMore}
	onRetry={handleRetry}
/>
