<script>
	import SessionsService from '$lib/services/sessions.js';
	import Dashboard from '$lib/views/dashboard.svelte';
	import { DEFAULT_ITEMS_PER_PAGE } from '$lib/constants/pagination.js';

	let { data } = $props();

	let sessions = $state([]);
	let totalItems = $state(0);
	let loading = $state(true);
	let error = $state(null);
	let searchQuery = $state('');
	let currentPage = $state(1);

	let service = $derived(new SessionsService(data.dvrServiceUrl, data.auth.jwt));

	function handleSearch(query) {
		searchQuery = query;
		currentPage = 1;
		fetchSessions({ sessionId: query });
	}

	function handlePageChange(page) {
		currentPage = page;
		fetchSessions({ page, sessionId: searchQuery });
	}

	async function fetchSessions({ page = 1, sessionId } = {}) {
		loading = true;
		error = null;

		try {
			const offset = (page - 1) * DEFAULT_ITEMS_PER_PAGE;
			const result = await service.fetchSessions({
				limit: DEFAULT_ITEMS_PER_PAGE,
				offset,
				sessionId
			});

			sessions = result.sessions;
			totalItems = result.total;
		} catch (err) {
			error = err.message;
			sessions = [];
			totalItems = 0;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		service;
		fetchSessions();
	});
</script>

<Dashboard
	{sessions}
	{totalItems}
	{loading}
	{error}
	auth={data.auth}
	onSearch={handleSearch}
	onPageChange={handlePageChange}
/>
