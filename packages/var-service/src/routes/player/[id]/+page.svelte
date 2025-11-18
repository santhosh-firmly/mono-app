<script>
	import { goto } from '$app/navigation';
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionPlayer from '$lib/components/session-player.svelte';
	import SessionDetails from '$lib/components/session-details.svelte';
	import Button from '$lib/components/button.svelte';

	let { data } = $props();

	let sessionData = $state();
	let isLoading = $state();
	let error = $state();

	$effect(() => {
		isLoading = true;
		sessionsStore
			.fetchSessionById(data.dvrServiceUrl, data.id)
			.then((session) => (sessionData = session))
			.catch((err) => (error = err))
			.finally(() => (isLoading = false));
	});
</script>

{#key sessionData?.metadata?.sessionId}
	<div class="py-16">
		{#if error}
			<div class="py-12 text-center">
				<p class="text-muted text-sm">{error}</p>
				<Button variant="link" onclick={() => goto('/')} class="mt-4">Go back</Button>
			</div>
		{:else if isLoading}
			<div class="py-12 text-center">
				<p class="text-muted text-sm">Loading...</p>
			</div>
		{:else if sessionData}
			<header class="mb-12">
				<Button variant="ghost" onclick={() => goto('/')} class="mb-3 inline-block"
					>← Back</Button
				>
				<h1 class="mb-2 font-serif text-2xl">{sessionData.metadata.url}</h1>
				<SessionDetails session={sessionData.metadata} />
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
{/key}
