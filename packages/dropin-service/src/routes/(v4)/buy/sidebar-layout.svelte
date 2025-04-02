<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	let visible = false;

	onMount(() => {
		visible = true;
	});
</script>

<div class="fixed inset-0 z-40 flex h-full w-full justify-end">
	{#if visible}
		<div
			transition:fade={{ duration: 300, easing: cubicInOut }}
			class="fixed inset-0 z-40 flex h-full w-full justify-end bg-black/50"
		>
			<div
				class="relative h-full overflow-y-auto bg-white shadow-xl max-sm:w-full sm:w-[440px]"
				transition:slide={{ duration: 300, easing: cubicInOut, axis: 'x' }}
			>
				<slot></slot>
			</div>
		</div>
	{/if}
</div>
