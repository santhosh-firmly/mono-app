<script>
	import { goto } from '$app/navigation';
	import SessionPlayer from '$lib/components/player/session-player.svelte';
	import SessionDetails from '$lib/components/dashboard/session-details.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import PlayerSkeleton from '$lib/components/player/player-skeleton.svelte';

	let { sessionData, isLoading, error } = $props();
</script>

{#key sessionData?.metadata?.sessionId}
	<div>
		{#if error}
			<div class="py-12 text-center">
				<p class="text-muted text-sm">{error}</p>
				<Button variant="link" onclick={() => goto('/')} class="mt-4">Go back</Button>
			</div>
		{:else if isLoading}
			<PlayerSkeleton />
		{:else if sessionData}
			<div>
				<header class="mb-12">
					<Button variant="ghost" onclick={() => goto('/')} class="mb-3 inline-block"
						>← Back</Button
					>
					<h1 class="mb-1 font-serif text-2xl">{sessionData.metadata.sessionId}</h1>
					<p class="text-muted mb-3 text-sm" title={sessionData.metadata.url}>
						{sessionData.metadata.url}
					</p>
					<SessionDetails session={sessionData.metadata} />
				</header>
			</div>

			<div class="flex justify-center">
				<SessionPlayer events={sessionData.events} />
			</div>
		{:else}
			<div class="py-24 text-center">
				<p class="text-muted mb-4 text-sm">Session not found</p>
				<Button variant="link" onclick={() => goto('/')}>Go back</Button>
			</div>
		{/if}
	</div>
{/key}
