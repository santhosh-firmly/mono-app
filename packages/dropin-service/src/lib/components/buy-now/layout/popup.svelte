<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	/**
	 * @typedef {Object} PopupLayoutProps
	 * @property {import('svelte').Snippet} [children] - Popup content
	 */

	/** @type {PopupLayoutProps} */
	let { children } = $props();
	let visible = $state(false);

	onMount(() => {
		visible = true;
	});
</script>

{#if visible}
	<div
		transition:fade={{ duration: 300, easing: cubicInOut }}
		class="bg-opacity-50 fixed inset-0 z-40 flex size-full items-center justify-center bg-black"
	>
		<div
			class="relative m-4 max-h-[90vh] min-h-[75vh] overflow-auto rounded-lg bg-white shadow-xl max-md:w-[100vh] md:w-[85vh]"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
