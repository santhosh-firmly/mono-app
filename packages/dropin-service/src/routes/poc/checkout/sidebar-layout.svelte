<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	let visible = false;

	onMount(() => {
		visible = true;
	});
</script>

<div class="w-full h-full flex justify-end fixed inset-0 z-40">
	{#if visible}
		<div
			transition:fade={{ duration: 300, easing: cubicInOut }}
			class="w-full h-full flex justify-end bg-black/50 fixed inset-0 z-40"
		>
			<div
				class="max-sm:w-full sm:w-[440px] bg-white h-full shadow-xl relative overflow-y-auto"
				transition:slide={{ duration: 300, easing: cubicInOut, axis: 'x' }}
			>
				<slot></slot>
			</div>
		</div>
	{/if}
</div>
