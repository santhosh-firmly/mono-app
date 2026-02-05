<script>
	import * as m from '$lib/paraglide/messages';

	let { presentation, onBackClick } = $props();

	let displayName = $derived(presentation?.displayName || 'FIRMLY');
	let largeLogo = $derived(presentation?.largeLogo);
</script>

<div class="relative z-10 flex flex-col bg-white">
	<div class="flex flex-col items-center border-b border-border py-3">
		{#if largeLogo}
			<img src={largeLogo} alt={displayName} class="h-8" />
		{:else}
			<span class="text-base font-bold">{displayName}</span>
		{/if}
	</div>
	<div class="relative px-4 pt-4 pb-1">
		<button
			type="button"
			class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-surface-alt px-4 py-2.5 text-xs font-semibold tracking-wide text-black uppercase transition-colors hover:bg-border/30"
			onclick={onBackClick}
			aria-label={m.return_to({ partner: displayName })}
		>
			<span class="text-xs">&lsaquo;</span>
			{m.return_to({ partner: displayName })}
		</button>
	</div>
	<div
		class="pointer-events-none absolute bottom-0 left-0 h-10 w-full translate-y-full bg-linear-to-b from-white via-white/60 via-30% to-transparent"
	></div>
</div>
