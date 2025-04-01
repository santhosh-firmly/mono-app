<script>
	// @ts-nocheck

	import BottomSheet from '$lib-v4/components/layout/bottom-sheet.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		if (document.body.clientHeight > 0) {
			open();
		}
	});
</script>

<div class="bg-gray-500">
	<BottomSheet
		snapPoints={['125px', 1]}
		dismissible={false}
		open={true}
		onOpenChange={(...args) => {
			console.log('open state changed', args);
		}}
	>
		<!-- <div class="flex flex-col w-full h-screen relative"> -->
		<slot></slot>
		<!-- </div> -->
	</BottomSheet>
</div>
