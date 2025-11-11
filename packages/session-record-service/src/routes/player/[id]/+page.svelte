<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionPlayer from '$lib/components/session-player.svelte';
	import Button from '$lib/components/button.svelte';

	let sessionData = $state(null);
	let loading = $state(true);

	$effect(() => {
		sessionsStore.fetchSessionById($page.params.id).then((data) => {
			sessionData = data;
			loading = false;
		});
	});

	function formatDate(timestamp) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(timestamp));
	}

	function formatDuration(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	}
</script>

<div class="py-16">
	{#if loading}
		<div class="py-24 text-center">
			<div
				class="border-foreground inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
			></div>
		</div>
	{:else if sessionsStore.error}
		<div class="py-12 text-center">
			<p class="text-muted text-sm">{sessionsStore.error}</p>
			<Button variant="link" onclick={() => goto('/')} class="mt-4">Go back</Button>
		</div>
	{:else if sessionData}
		<header class="mb-12">
			<Button variant="ghost" onclick={() => goto('/')} class="mb-3 inline-block"
				>← Back</Button
			>
			<h1 class="mb-2 font-serif text-2xl">{sessionData.metadata.url}</h1>
			<div class="text-muted text-xs">
				{sessionData.metadata.eventCount} events · {formatDuration(
					sessionData.metadata.duration
				)} · {formatDate(sessionData.metadata.timestamp)}
			</div>
		</header>

		<div class="border-border border bg-white p-4">
			<SessionPlayer events={sessionData.events} metadata={sessionData.metadata} />
		</div>
	{:else}
		<div class="py-24 text-center">
			<p class="text-muted mb-4 text-sm">Session not found</p>
			<Button variant="link" onclick={() => goto('/')}>Go back</Button>
		</div>
	{/if}
</div>
