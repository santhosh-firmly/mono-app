<script>
	import { DotsThree } from 'phosphor-svelte';
	import DropdownMenu from './dropdown-menu.svelte';
	import SessionDetails from './session-details.svelte';

	let { session, onPlay, onDelete, children, class: className, ...rest } = $props();
</script>

<div
	class="hover:bg-hover group relative flex items-start gap-3 rounded-xl px-4 py-4 transition-colors {className ??
		''}"
	{...rest}
>
	<button
		type="button"
		onclick={() => onPlay?.(session.sessionId)}
		class="block flex-1 text-left"
	>
		{#if children}
			{@render children()}
		{:else}
			<h2 class="text-foreground mb-0.5 font-serif text-base">{session.sessionId}</h2>
			<p class="text-muted mb-2 text-sm" title={session.url}>{session.url}</p>
			<SessionDetails {session} />
		{/if}
	</button>

	<DropdownMenu
		items={[
			{
				label: 'Play',
				onSelect: () => onPlay?.(session.sessionId)
			},
			{
				separator: true
			},
			{
				label: 'Delete',
				destructive: true,
				onSelect: () => onDelete?.(session.sessionId),
				disabled: !onDelete
			}
		]}
	>
		{#snippet trigger()}
			<button
				type="button"
				class="text-muted hover:text-foreground transition-colors"
				aria-label="More options"
			>
				<DotsThree size={16} weight="bold" />
			</button>
		{/snippet}
	</DropdownMenu>
</div>
