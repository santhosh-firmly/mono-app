<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { clickOutside } from '$lib/directives/click-outside';

	const TRANSITION_DURATION = 300;

	let visible = $state(false);
	let { children, onClose = () => {} } = $props();

	function handleOutsideClick() {
		visible = false;

		// Only call onClose after transition duration
		setTimeout(() => {
			onClose();
		}, TRANSITION_DURATION);
	}

	onMount(() => {
		visible = true;
	});
</script>

<div class="fixed inset-0 z-40 flex h-full w-full justify-end">
	{#if visible}
		<div
			transition:fade={{ duration: TRANSITION_DURATION, easing: cubicInOut }}
			class="fixed inset-0 z-40 flex h-full w-full justify-end bg-black/50"
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
