<script>
	import { Button } from '$lib/components/ui/button/index.js';

	let { error = null, onDismiss } = $props();
</script>

{#if error}
	<div
		class="rounded-lg bg-destructive/10 p-4 text-destructive flex items-center justify-between"
	>
		<span>{error}</span>
		{#if onDismiss}
			<Button variant="ghost" size="sm" onclick={onDismiss}>Dismiss</Button>
		{/if}
	</div>
{/if}
