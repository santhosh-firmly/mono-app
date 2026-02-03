<script>
	import BottomSheet from '$lib/components/ui/bottom-sheet.svelte';
	import { onMount } from 'svelte';

	/**
	 * @typedef {Object} BottomSheetLayoutProps
	 * @property {import('svelte').Snippet} [children] - Sheet content
	 * @property {Function} [onClose] - Called when sheet closes
	 * @property {boolean} [visible] - Two-way bindable visibility state
	 * @property {boolean} [useAbsolutePosition] - Use absolute instead of fixed positioning
	 */

	/** @type {BottomSheetLayoutProps} */
	let {
		children,
		onClose = () => {},
		visible = $bindable(true),
		useAbsolutePosition = false
	} = $props();

	let open = $state(false);

	let positionClass = $derived(useAbsolutePosition ? 'absolute' : 'fixed');

	function handleOpenChange(newOpen) {
		if (!newOpen) {
			visible = false;
			onClose();
		}
	}

	onMount(() => {
		if (document.body.clientHeight > 0) {
			open = true;
		}
	});
</script>

<div class="{positionClass} inset-0 z-40 bg-gray-500">
	<BottomSheet snapPoints={['125px', 1]} {open} onOpenChange={handleOpenChange}>
		{@render children?.()}
	</BottomSheet>
</div>
