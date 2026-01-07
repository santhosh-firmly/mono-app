<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AuditLogsPage from '$lib/components/pages/merchant/audit-logs-page.svelte';

	let { data } = $props();
	let domain = $derived($page.params.domain);

	function handlePageChange(newPage) {
		goto(`/merchant/${domain}/audit-logs?page=${newPage}`);
	}
</script>

<AuditLogsPage
	{domain}
	logs={data.logs}
	isFirmlyAdmin={data.isFirmlyAdmin}
	currentPage={data.currentPage}
	totalPages={data.totalPages}
	total={data.total}
	limit={data.limit}
	onPageChange={handlePageChange}
/>
