<script>
	import SessionsService from '$lib/services/sessions.js';
	import Player from '$lib/views/player.svelte';

	let { data } = $props();

	let sessionData = $state();
	let isLoading = $state(true);
	let error = $state(null);

	let service = $derived(new SessionsService(data.dvrServiceUrl, data.auth.jwt));

	$effect(async () => {
		isLoading = true;
		error = null;
		sessionData = null;

		try {
			sessionData = await service.fetchSessionById(data.id);
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	});
</script>

<Player {sessionData} {isLoading} {error} />
