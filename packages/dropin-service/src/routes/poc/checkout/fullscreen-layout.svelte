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
		class="w-full h-full flex fixed inset-0 z-40 overflow-scroll"
	>
		<slot></slot>
	</div>
{/if}
