<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let visible = false;

	onMount(() => {
		visible = true;
	});
</script>

{#if visible}
	<div
		transition:fade={{ duration: 300, easing: cubicInOut }}
		class="fixed inset-0 z-40 flex size-full overflow-scroll"
	>
		<slot></slot>
	</div>
{/if}
