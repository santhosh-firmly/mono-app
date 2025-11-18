<script>
	import { goto } from '$app/navigation';
	import SessionPlayer from '$lib/components/session-player.svelte';
	import SessionDetails from '$lib/components/session-details.svelte';
	import Button from '$lib/components/button.svelte';

	let { data } = $props();
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
				<SessionDetails session={data.sessionData.metadata} />
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
