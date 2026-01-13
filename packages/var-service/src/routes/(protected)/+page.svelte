<script>
	import SessionsService from '$lib/services/sessions.js';
	import Dashboard from '$lib/views/dashboard.svelte';

	let { data } = $props();

	let sessions = $state([]);
	let loading = $state(true);
	let error = $state(null);

	let service = $derived(new SessionsService(data.dvrServiceUrl, data.auth.jwt));

	$effect(async () => {
		loading = true;
		error = null;
		sessions = [];

		try {
			sessions = await service.fetchSessions();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<Dashboard {sessions} {loading} {error} auth={data.auth} />
