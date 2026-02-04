<script module>
	export const TRANSITION_DURATION = 300;
</script>

<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { clickOutside } from '$lib/directives/click-outside';

	/**
	 * @typedef {Object} SidebarLayoutProps
	 * @property {import('svelte').Snippet} [children] - Sidebar content
	 * @property {Function} [onClose] - Called when sidebar closes
	 * @property {boolean} [visible] - Two-way bindable visibility state
	 * @property {boolean} [useAbsolutePosition] - Use absolute instead of fixed positioning
	 */

	/** @type {SidebarLayoutProps} */
	let {
		children,
		onClose = () => {},
		visible = $bindable(true),
		useAbsolutePosition = false
	} = $props();

	let positionClass = $derived(useAbsolutePosition ? 'absolute' : 'fixed');

	function handleOutsideClick() {
		visible = false;
	}

	onMount(() => {
		visible = true;
	});
</script>

<div class="{positionClass} inset-0 z-40 flex size-full justify-end">
	{#if visible}
		<div
			transition:fade={{ duration: TRANSITION_DURATION, easing: cubicInOut }}
			onoutroend={onClose}
			class="{positionClass} inset-0 z-40 flex size-full justify-end bg-black/50"
		>
			<div
				class="relative h-full overflow-y-auto bg-white shadow-xl max-sm:w-full sm:w-110"
				transition:slide={{ duration: TRANSITION_DURATION, easing: cubicInOut, axis: 'x' }}
				use:clickOutside={{ callback: handleOutsideClick }}
			>
				{@render children?.()}
			</div>
		</div>
	{/if}
</div>
