<script>
	import Copy from 'lucide-svelte/icons/copy';
	import Checkmark from 'lucide-svelte/icons/check';
	import Button from '$lib/components/ui/button/button.svelte';
	import { onMount } from 'svelte';

	let isClipboardAvailable = false;
	let copied = false;
	export let value;

	onMount(() => {
		isClipboardAvailable = !!window.navigator?.clipboard;
	});
</script>

{#if isClipboardAvailable}
	<Button
		size="icon"
		variant="outline"
		class="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
		on:click={() => {
			try {
				navigator.clipboard.writeText(value);
				copied = true;
				setTimeout(() => {
					copied = false;
				}, 3000);
			} catch {
				console.error('Failed to copy to clipboard');
			}
		}}
	>
		{#if copied}
			<Checkmark class="h-3 w-3" />
		{:else}
			<Copy class="h-3 w-3" />
		{/if}
		<span class="sr-only">Copy Order ID</span>
	</Button>
{/if}
