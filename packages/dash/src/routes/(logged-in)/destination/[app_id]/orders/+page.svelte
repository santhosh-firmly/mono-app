<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import OrdersPage from '$lib/components/pages/destination/orders-page.svelte';

	let appId = $derived($page.params.app_id);

	// State
	let orders = $state([]);
	let merchants = $state([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let selectedMerchant = $state('');
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

			if (selectedMerchant) {
				params.set('merchant', selectedMerchant);
			}

			const response = await fetch(`/destination/${appId}/api/orders?${params.toString()}`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch orders');
			}

			orders = result.orders;
			merchants = result.merchants;
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

	function handleMerchantChange(merchant) {
		selectedMerchant = merchant;
		currentPage = 1;
		fetchOrders();
	}

	function handlePageChange(pageNum) {
		currentPage = pageNum;
		fetchOrders();
	}

	function handleViewOrder(orderId) {
		goto(`/destination/${appId}/orders/${orderId}`);
	}
</script>

<OrdersPage
	{orders}
	{merchants}
	{total}
	{loading}
	{error}
	searchValue={searchQuery}
	{selectedMerchant}
	{currentPage}
	{limit}
	onSearch={handleSearch}
	onMerchantChange={handleMerchantChange}
	onPageChange={handlePageChange}
	onViewOrder={handleViewOrder}
/>
