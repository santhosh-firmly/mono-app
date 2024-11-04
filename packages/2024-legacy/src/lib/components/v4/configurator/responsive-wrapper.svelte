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

<section class="dark:bg-[#0f172a] overflow-hidden h-screen min-h-max">
	<div class="mt-16 border-b border-slate-100 xl:mb-0 block dark:border-slate-800">
		<div bind:this={markerContainer} class="mb-[-3px] flex mx-auto px-6 sm:px-8 md:px-10">
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
		<div class="mx-auto sm:px-6 md:px-8 mb-64 h-full">
			<div class="sm:px-2 xl:mt-0 h-full">
				<div bind:clientWidth={browserContainerWidth} class="flex flex-row items-center h-3/4">
					<Browser width={browserWidth}>
						<iframe
							bind:this={checkoutWindow}
							{src}
							{title}
							class="w-full h-full"
							style={`pointer-events: ${dragging ? 'none' : 'auto'};`}
						/>
					</Browser>
					<div bind:clientWidth={draggerWidth} class="inset-y-0">
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							class="z-10 top-1/2 left-0 p-2 -mt-6 items-center justify-center pointer-events-auto cursor-ew-resize"
							on:mousedown={onDragStart}
						>
							<div class="w-1.5 h-8 bg-slate-500/60 rounded-full"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
