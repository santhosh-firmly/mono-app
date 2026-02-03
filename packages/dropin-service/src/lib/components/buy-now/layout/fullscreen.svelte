<script>
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	/**
	 * @typedef {Object} FullscreenLayoutProps
	 * @property {import('svelte').Snippet} [children] - Layout content
	 * @property {Function} [onClose] - Called when layout closes
	 * @property {boolean} [visible] - Visibility state
	 * @property {boolean} [useAbsolutePosition] - Use absolute instead of fixed positioning
	 */

	/** @type {FullscreenLayoutProps} */
	let {
		children,
		onClose = () => {},
		visible = $bindable(true),
		useAbsolutePosition = false
	} = $props();

	let positionClass = $derived(useAbsolutePosition ? 'absolute' : 'fixed');
</script>

{#if visible}
	<div
		transition:fade={{ duration: 200, easing: cubicInOut }}
		onoutroend={onClose}
		class="bg-background {positionClass} inset-0 z-40 flex size-full overflow-scroll"
	>
		{@render children?.()}
	</div>
{/if}
