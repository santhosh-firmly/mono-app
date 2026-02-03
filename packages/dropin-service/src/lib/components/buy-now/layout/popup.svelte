<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	/**
	 * @typedef {Object} PopupLayoutProps
	 * @property {import('svelte').Snippet} [children] - Popup content
	 * @property {Function} [onClose] - Called when popup closes
	 * @property {boolean} [visible] - Two-way bindable visibility state
	 * @property {boolean} [useAbsolutePosition] - Use absolute instead of fixed positioning
	 */

	/** @type {PopupLayoutProps} */
	let {
		children,
		onClose = () => {},
		visible = $bindable(true),
		useAbsolutePosition = false
	} = $props();

	let positionClass = $derived(useAbsolutePosition ? 'absolute' : 'fixed');

	onMount(() => {
		visible = true;
	});

	function handleBackdropClick() {
		visible = false;
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			visible = false;
		}
	}
</script>

{#if visible}
	<div
		transition:fade={{ duration: 300, easing: cubicInOut }}
		onoutroend={onClose}
		class="{positionClass} inset-0 z-40 flex size-full items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
	>
		<div
			class="relative m-4 flex max-h-[90vh] min-h-[75vh] flex-col overflow-hidden rounded-lg bg-white shadow-xl max-md:w-[100vh] md:w-[85vh]"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
