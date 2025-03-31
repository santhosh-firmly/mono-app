<script lang="js">
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { Drawer } from 'vaul-svelte';

	export let open = false;
	export let onOpenChange = undefined;
	export let snapPoints = ['148px', '355px', 1];
	let snapPoint = 1;
	let container;
	let closeSlot;

	$: {
		if (snapPoint !== 1 && container) {
			container.scrollTo({
				top: 0
			});
		}
	}

	function dismissOnClick(event) {
		if (container) {
			const rect = container.getBoundingClientRect();
			const closeRect = closeSlot?.getBoundingClientRect();
			const closeRectWithMargins = closeRect
				? {
						top: closeRect.top - parseInt(getComputedStyle(closeSlot).marginTop),
						bottom: closeRect.bottom + parseInt(getComputedStyle(closeSlot).marginBottom)
					}
				: null;
			const clickY = event.clientY ?? event.touches[0].clientY;
			const isOutsideContainer = clickY < rect.top || clickY > rect.bottom;
			const isOutsideCloseSlot =
				!closeRectWithMargins ||
				clickY < closeRectWithMargins.top ||
				clickY > closeRectWithMargins.bottom;
			console.log('isOutsideContainer', isOutsideContainer, clickY, rect.top, rect.bottom, event);
			console.log(
				'isOutsideCloseSlot',
				isOutsideCloseSlot,
				clickY,
				closeRectWithMargins.top,
				closeRectWithMargins.bottom
			);

			if (isOutsideContainer && isOutsideCloseSlot) {
				console.log('collapsing');
				// Collapse the bottom sheet
				snapPoint = snapPoints[0];
			}
		}
	}

	onMount(() => {
		window.addEventListener('mousedown', dismissOnClick, true);
		window.addEventListener('touchstart', dismissOnClick, true);
		// window.addEventListener('click', dismissOnClick, true);
		return () => {
			window.removeEventListener('mousedown', dismissOnClick, true);
			window.removeEventListener('touchstart', dismissOnClick, true);
			// window.removeEventListener('click', dismissOnClick, true);
		};
	});
</script>

<Drawer.Root
	{snapPoints}
	{open}
	{onOpenChange}
	dismissible={false}
	bind:activeSnapPoint={snapPoint}
>
	{#if $$slots.trigger}
		<Drawer.Trigger>
			<slot name="trigger" />
		</Drawer.Trigger>
	{/if}

	<Drawer.Portal
		onRelease={() => {
			console.log('firmly onRelease');
			snapPoint = snapPoints[0];
		}}
	>
		<Drawer.Overlay class="fixed inset-0 bg-black/40" />
		<Drawer.Content
			class="fixed flex flex-col bg-white border-b-none rounded-t-[20px] bottom-0 left-0 right-0 max-h-[95%] border-t-2 border-gray-100 outline-none {$$restProps.class}"
		>
			<slot name="close">
				<div
					bind:this={closeSlot}
					class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-2 mt-3 sticky top-0"
				></div>
			</slot>

			<div
				bind:this={container}
				class="grow relative h-screen bg-white"
				class:overflow-y-auto={snapPoint === 1}
				class:overflow-y-hidden={snapPoint !== 1}
			>
				<slot />
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
