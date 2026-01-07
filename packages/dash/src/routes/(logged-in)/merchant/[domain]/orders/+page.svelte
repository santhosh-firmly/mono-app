<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import OrdersPage from '$lib/components/pages/merchant/orders-page.svelte';

	let domain = $derived($page.params.domain);

	// State
	let orders = $state([]);
	let destinations = $state([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let currentPage = $state(1);
	const limit = 25;

	// Fetch orders on mount and when params change
	$effect(() => {
		fetchOrders();
	});

	async function fetchOrders() {
		loading = true;
		error = '';

		try {
			const offset = (currentPage - 1) * limit;
			const params = new SvelteURLSearchParams({
				limit: limit.toString(),
				offset: offset.toString()
			});

			if (searchQuery) {
				params.set('search', searchQuery);
			}

			const response = await fetch(`/merchant/${domain}/api/orders?${params.toString()}`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch orders');
			}

			orders = result.orders;
			destinations = result.destinations;
			total = result.total;
		} catch (err) {
			error = err.message;
			orders = [];
		} finally {
			loading = false;
		}
	}

	function handleSearch(query) {
		searchQuery = query;
		currentPage = 1;
		fetchOrders();
	}

	function handlePageChange(pageNum) {
		currentPage = pageNum;
		fetchOrders();
	}

	function handleViewOrder(orderId) {
		goto(`orders/${orderId}`);
	}
</script>

<OrdersPage
	{orders}
	{destinations}
	{total}
	{loading}
	{error}
	searchValue={searchQuery}
	{currentPage}
	{limit}
	onSearch={handleSearch}
	onPageChange={handlePageChange}
	onViewOrder={handleViewOrder}
/>
