<script>
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionList from '$lib/components/session-list.svelte';

	$effect(() => {
		sessionsStore.fetchSessions();
	});
</script>

<div class="py-16">
	<header class="mb-12 text-center">
		<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
		<p class="text-muted text-sm">View and replay recorded user sessions</p>
	</header>

	<SessionList
		sessions={sessionsStore.sessions}
		loading={sessionsStore.loading}
		error={sessionsStore.error}
		emptyAction={{
			label: 'Try the example page',
			onClick: () => (window.location.href = '/example')
		}}
	/>
</div>
