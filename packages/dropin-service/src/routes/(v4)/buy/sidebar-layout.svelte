<script module>
	export const TRANSITION_DURATION = 300;
</script>

<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { clickOutside } from '$lib/directives/click-outside';

	let { children, onClose = () => {}, visible = $bindable(false) } = $props();

	function handleOutsideClick() {
		visible = false;
	}

	onMount(() => {
		visible = true;
	});
</script>

<div class="fixed inset-0 z-40 flex size-full justify-end">
	{#if visible}
		<div
			transition:fade={{ duration: TRANSITION_DURATION, easing: cubicInOut }}
			onoutroend={onClose}
			class="fixed inset-0 z-40 flex size-full justify-end bg-black/50"
		>
			<div
				class="relative h-full overflow-y-auto bg-white shadow-xl max-sm:w-full sm:w-[440px]"
				transition:slide={{ duration: TRANSITION_DURATION, easing: cubicInOut, axis: 'x' }}
				use:clickOutside={{ callback: handleOutsideClick }}
			>
				{@render children?.()}
			</div>
		</div>
	{/if}
</div>
