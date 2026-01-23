<script>
	import BottomSheet from '$lib/components/ui/bottom-sheet.svelte';
	import { onMount } from 'svelte';

	/**
	 * @typedef {Object} BottomSheetLayoutProps
	 * @property {import('svelte').Snippet} [children] - Sheet content
	 */

	/** @type {BottomSheetLayoutProps} */
	let { children } = $props();

	let open = $state(false);

	onMount(() => {
		if (document.body.clientHeight > 0) {
			open = true;
		}
	});
</script>

<div class="bg-gray-500">
	<BottomSheet snapPoints={['125px', 1]} {open}>
		{@render children?.()}
	</BottomSheet>
</div>
