<script>
	import { DotsThree } from 'phosphor-svelte';
	import DropdownMenu from '$lib/components/ui/dropdown-menu.svelte';
	import SessionDetails from './session-details.svelte';

	let { session, onPlay, children, class: className, ...rest } = $props();

	const playerDisabled = $derived(session.status === 'recording');

	function handlePlayRecord() {
		if (playerDisabled) return;
		onPlay?.(session.sessionId);
	}
</script>

<div
	class={[
		'hover:bg-hover group relative flex items-start gap-3 rounded-xl px-4 py-4 transition-colors',
		{ 'cursor-not-allowed': playerDisabled },
		className
	]}
	{...rest}
>
	<button
		type="button"
		onclick={handlePlayRecord}
		disabled={playerDisabled}
		class={['block min-w-0 flex-1 text-left', { 'cursor-not-allowed': playerDisabled }]}
	>
		{#if children}
			{@render children()}
		{:else}
			<h2 class="text-foreground mb-0.5 font-serif text-base">{session.sessionId}</h2>
			<p class="text-muted mb-2 truncate text-sm" title={session.url}>{session.url}</p>
			<SessionDetails {session} />
		{/if}
	</button>

	<DropdownMenu
		items={[
			{
				label: 'Play',
				onSelect: handlePlayRecord,
				disabled: playerDisabled
			}
		]}
	>
		{#snippet trigger()}
			<button
				type="button"
				disabled={playerDisabled}
				class={[
					'text-muted hover:text-foreground transition-colors',
					{ 'cursor-not-allowed': playerDisabled, 'pointer-events-none': playerDisabled }
				]}
				aria-label="More options"
			>
				<DotsThree size={16} weight="bold" />
			</button>
		{/snippet}
	</DropdownMenu>
</div>
