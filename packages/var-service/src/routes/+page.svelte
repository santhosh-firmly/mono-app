<script>
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionList from '$lib/components/session-list.svelte';
	import Button from '$lib/components/button.svelte';
	import { goto } from '$app/navigation';

	$effect(() => {
		sessionsStore.fetchSessions();
	});

	async function handleDelete(sessionId) {
		if (!confirm('Are you sure you want to delete this session recording?')) {
			return;
		}

		try {
			const response = await fetch(`/api/sessions/${sessionId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await sessionsStore.fetchSessions();
			}
		} catch (err) {
			console.error('Failed to delete session:', err);
		}
	}

	function goToExample() {
		goto('/example');
	}
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
		onDelete={handleDelete}
	>
		{#snippet emptyState()}
			<div>
				<p class="text-muted mb-4 text-sm">No sessions yet</p>
				<Button variant="link" onclick={goToExample}>Try the example page</Button>
			</div>
		{/snippet}
	</SessionList>
</div>
