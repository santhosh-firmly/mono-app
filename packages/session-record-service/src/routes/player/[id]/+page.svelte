<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionPlayer from '$lib/components/session-player.svelte';

	let sessionData = $state(null);
	let loading = $state(true);

	$effect(() => {
		const sessionId = $page.params.id;

		sessionsStore.fetchSessionById(sessionId).then((data) => {
			sessionData = data;
			loading = false;
		});
	});

	function formatDate(timestamp) {
		return new Date(timestamp).toLocaleString();
	}

	function goBack() {
		goto('/');
	}
</script>

<div class="container mx-auto px-4 py-8">
	<button
		onclick={goBack}
		class="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
	>
		← Back to Sessions
	</button>

	{#if loading}
		<div class="flex justify-center items-center py-12">
			<p class="text-gray-500">Loading session...</p>
		</div>
	{:else if sessionsStore.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-red-600">Error: {sessionsStore.error}</p>
		</div>
	{:else if sessionData}
		<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
			<h1 class="text-2xl font-bold mb-4">Session Replay</h1>

			<div class="grid grid-cols-2 gap-4 mb-6 text-sm">
				<div>
					<p class="text-gray-600">
						<span class="font-medium">URL:</span>
						{sessionData.metadata.url}
					</p>
					<p class="text-gray-600">
						<span class="font-medium">Date:</span>
						{formatDate(sessionData.metadata.timestamp)}
					</p>
				</div>
				<div>
					<p class="text-gray-600">
						<span class="font-medium">Events:</span>
						{sessionData.metadata.eventCount}
					</p>
					<p class="text-gray-600">
						<span class="font-medium">Duration:</span>
						{Math.floor(sessionData.metadata.duration / 1000)}s
					</p>
				</div>
			</div>

			<div class="border rounded-lg p-4 bg-gray-50">
				<SessionPlayer events={sessionData.events} metadata={sessionData.metadata} />
			</div>
		</div>
	{:else}
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
			<p class="text-gray-500">Session not found</p>
		</div>
	{/if}
</div>
