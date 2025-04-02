<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import Marker from './marker.svelte';
	import Browser from './browser.svelte';

	const minBrowserWidth = 320;
	let browserWidth = 400;

	export let src;
	export let title;
	export let checkoutWindow;

	let initialX = 0;
	let initialBrowserWidth = browserWidth;
	let dragging = false;
	let browserContainerWidth;
	let draggerWidth;
	let markerContainer;
	let markerOffset = 0;

	function onMouseMove(event) {
		const maxBrowserWidth = browserContainerWidth - draggerWidth;

		browserWidth = event.clientX - initialX + initialBrowserWidth;
		browserWidth = Math.min(browserWidth, maxBrowserWidth);
		browserWidth = Math.max(browserWidth, minBrowserWidth);
	}

	function onDragStart(event) {
		event.preventDefault();
		initialX = event.clientX;
		initialBrowserWidth = browserWidth;
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onDragEnd);
		dragging = true;
	}

	function onDragEnd() {
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onDragEnd);
		dragging = false;
	}

	onMount(() => {
		markerOffset = parseInt(
			window.getComputedStyle(markerContainer, null).getPropertyValue('padding-left')
		);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onDragEnd);
		};
	});
</script>

<section class="h-screen min-h-max overflow-hidden dark:bg-[#0f172a]">
	<div class="mt-16 block border-b border-slate-100 xl:mb-0 dark:border-slate-800">
		<div bind:this={markerContainer} class="mx-auto mb-[-3px] flex px-6 sm:px-8 md:px-10">
			<Marker
				width={browserWidth + markerOffset}
				label="sm"
				className="ml-[40rem] w-32"
				on:click={() => {
					browserWidth = 640;
				}}
			/>
			<Marker
				width={browserWidth + markerOffset}
				label="md"
				className="w-64"
				on:click={() => {
					browserWidth = 768;
				}}
			/>
			<Marker
				width={browserWidth + markerOffset}
				label="lg"
				className="w-64"
				on:click={() => {
					browserWidth = 1024;
				}}
			/>
			<Marker
				width={browserWidth + markerOffset}
				label="xl"
				className="w-64"
				on:click={() => {
					browserWidth = 1280;
				}}
			/>
			<Marker
				width={browserWidth + markerOffset}
				label="2xl"
				on:click={() => {
					browserWidth = 1536;
				}}
			/>
		</div>
	</div>
	<div class="relative -mt-2.5 h-full">
		<div class="mx-auto mb-64 h-full sm:px-6 md:px-8">
			<div class="h-full sm:px-2 xl:mt-0">
				<div bind:clientWidth={browserContainerWidth} class="flex h-3/4 flex-row items-center">
					<Browser width={browserWidth}>
						<iframe
							bind:this={checkoutWindow}
							{src}
							{title}
							class="h-full w-full"
							style={`pointer-events: ${dragging ? 'none' : 'auto'};`}
						/>
					</Browser>
					<div bind:clientWidth={draggerWidth} class="inset-y-0">
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							class="pointer-events-auto top-1/2 left-0 z-10 -mt-6 cursor-ew-resize items-center justify-center p-2"
							on:mousedown={onDragStart}
						>
							<div class="h-8 w-1.5 rounded-full bg-slate-500/60"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
