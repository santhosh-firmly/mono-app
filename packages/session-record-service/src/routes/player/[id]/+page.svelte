<script>
	import { goto } from '$app/navigation';
	import SessionPlayer from '$lib/components/session-player.svelte';
	import Button from '$lib/components/button.svelte';

	let { data } = $props();

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

{#key data.sessionData?.metadata?.sessionId}
	<div class="py-16">
		{#if data.error}
			<div class="py-12 text-center">
				<p class="text-muted text-sm">{data.error}</p>
				<Button variant="link" onclick={() => goto('/')} class="mt-4">Go back</Button>
			</div>
		{:else if data.sessionData}
			<header class="mb-12">
				<Button variant="ghost" onclick={() => goto('/')} class="mb-3 inline-block"
					>← Back</Button
				>
				<h1 class="mb-2 font-serif text-2xl">{data.sessionData.metadata.url}</h1>
				<div class="text-muted text-xs">
					{data.sessionData.metadata.eventCount} events · {formatDuration(
						data.sessionData.metadata.duration
					)} · {formatDate(data.sessionData.metadata.timestamp)}
				</div>
			</header>

			<div class="border-border border bg-white p-4">
				<SessionPlayer
					events={data.sessionData.events}
					metadata={data.sessionData.metadata}
				/>
			</div>
		{:else}
			<div class="py-24 text-center">
				<p class="text-muted mb-4 text-sm">Session not found</p>
				<Button variant="link" onclick={() => goto('/')}>Go back</Button>
			</div>
		{/if}
	</div>
{/key}
