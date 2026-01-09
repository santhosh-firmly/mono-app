<script>
	import { goto } from '$app/navigation';
	import SessionPlayer from '$lib/components/session-player.svelte';
	import SessionDetails from '$lib/components/session-details.svelte';
	import SessionsService from '$lib/services/sessions.js';
	import Button from '$lib/components/button.svelte';
	import PlayerSkeleton from '$lib/components/player-skeleton.svelte';

	let { data } = $props();

	let sessionData = $state();
	let isLoading = $state();
	let error = $state();

	let service = $derived(new SessionsService(data.dvrServiceUrl, data.auth.jwt));

	let isBuffering = $derived(sessionData?.metadata?.status === 'buffering');

	$effect(async () => {
		isLoading = true;
		error = null;
		sessionData = null;

		try {
			sessionData = await service.fetchSessionById(data.id);
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	});
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
			{#if isBuffering}
				<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<div class="flex items-start gap-3">
						<svg
							class="h-5 w-5 shrink-0 text-yellow-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<div>
							<h3 class="mb-1 text-sm font-medium text-yellow-900">
								Processing session
							</h3>
							<p class="text-sm text-yellow-700">
								This session is currently being processed. This may take a few
								minutes depending on the session length. The player will be
								available once processing is complete.
							</p>
						</div>
					</div>
				</div>
			{/if}

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
