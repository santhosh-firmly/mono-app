<script>
	import { goto } from '$app/navigation';
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';

	let searchQuery = $state('');

	$effect(() => {
		// Fetch sessions when component mounts or when navigating back
		sessionsStore.fetchSessions();
	});

	const filteredSessions = $derived(() => {
		if (!searchQuery) return sessionsStore.sessions;

		const query = searchQuery.toLowerCase();
		return sessionsStore.sessions.filter(
			(session) =>
				session.url.toLowerCase().includes(query) ||
				session.sessionId.toLowerCase().includes(query)
		);
	});

	function formatDate(timestamp) {
		const date = new Date(timestamp);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(date);
	}

	function formatDuration(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		if (minutes === 0) return `${remainingSeconds}s`;
		return `${minutes}m ${remainingSeconds}s`;
	}
</script>

<div class="py-16">
	<header class="mb-12 text-center">
		<h1 class="mb-2 font-serif text-2xl">Session Recordings</h1>
		<p class="text-muted text-sm">View and replay recorded user sessions</p>
	</header>

	<div class="mb-8">
		<Input bind:value={searchQuery} placeholder="Search sessions..." />
	</div>

	{#if sessionsStore.loading}
		<div class="py-24 text-center">
			<div
				class="border-foreground inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
			></div>
		</div>
	{:else if sessionsStore.error}
		<div class="py-12 text-center">
			<p class="text-muted text-sm">{sessionsStore.error}</p>
		</div>
	{:else if filteredSessions().length === 0}
		<div class="py-24 text-center">
			{#if searchQuery}
				<p class="text-muted text-sm">No sessions found matching "{searchQuery}"</p>
			{:else}
				<p class="text-muted mb-4 text-sm">No sessions yet</p>
				<Button variant="link" onclick={() => goto('/example')}>Try the example page</Button
				>
			{/if}
		</div>
	{:else}
		<div class="space-y-px">
			{#each filteredSessions() as session (session.sessionId)}
				<a
					href="/player/{session.sessionId}"
					class="hover:bg-hover block w-full px-4 py-4 text-left transition-colors"
				>
					<h2 class="text-foreground mb-1 font-serif text-base">{session.url}</h2>
					<div class="text-muted text-xs">
						{session.eventCount} events · {formatDuration(session.duration)} · {formatDate(
							session.timestamp
						)}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
