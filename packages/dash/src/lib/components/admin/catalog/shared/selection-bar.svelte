<script>
	import { Button } from '$lib/components/ui/button/index.js';

	let { selectedCount = 0, totalCount = 0, onClear, children } = $props();
</script>

{#if selectedCount > 0}
	<div
		class="flex items-center justify-between p-3 mb-4 bg-primary/5 border border-primary/20 rounded-lg flex-wrap gap-3"
	>
		<div class="flex items-center gap-4">
			<span class="font-semibold text-primary">
				{selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
			</span>
			{#if totalCount > 0}
				<span class="text-sm text-muted-foreground">of {totalCount} total</span>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<Button variant="ghost" size="sm" onclick={onClear}>Clear</Button>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
{/if}
