<script>
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionCard from './session-card.svelte';

	let { onSelectSession } = $props();

	$effect(() => {
		sessionsStore.fetchSessions();
	});
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Session Recordings</h1>

	{#if sessionsStore.loading}
		<div class="flex justify-center items-center py-12">
			<p class="text-gray-500">Loading sessions...</p>
		</div>
	{:else if sessionsStore.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-600">Error: {sessionsStore.error}</p>
		</div>
	{:else if sessionsStore.sessions.length === 0}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
			<p class="text-gray-500">No sessions recorded yet</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each sessionsStore.sessions as session (session.sessionId)}
				<SessionCard {session} onclick={() => onSelectSession(session.sessionId)} />
			{/each}
		</div>
	{/if}
</div>
