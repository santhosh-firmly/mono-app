<script>
	import { onMount } from 'svelte';
	import BrowserFrame from './browser-frame.svelte';
	import FlowPlayer from './flow-player.svelte';
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} ResponsiveWrapperProps
	 * @property {number} [width] - Two-way bindable viewport width
	 * @property {Function} [onReload] - Reload button handler
	 * @property {Object} [flowPlayer] - Flow player state
	 * @property {HTMLElement} [browserContentRef] - Two-way bindable ref to browser content
	 * @property {import('svelte').Snippet} [children] - Wrapper content
	 */

	/** @type {ResponsiveWrapperProps} */
	let {
		width = $bindable(400),
		onReload,
		flowPlayer = null,
		browserContentRef = $bindable(null),
		children
	} = $props();

	const MIN_WIDTH = 320;
	const MAX_WIDTH = 1200;

	const viewports = [
		{ id: 'mobile', icon: 'mdi:cellphone', width: 400, label: 'Mobile' },
		{ id: 'widescreen', icon: 'mdi:monitor', width: 1200, label: 'Widescreen' }
	];

	let containerRef = $state(null);
	let containerWidth = $state(1200);
	let containerHeight = $state(800);
	let dragging = $state(false);
	let initialX = 0;
	let initialWidth = 0;

	let frameHeight = $derived(Math.max(600, containerHeight - 100));

	let currentViewport = $derived(width <= 640 ? 'mobile' : 'widescreen');

	function handleMouseDown(event) {
		event.preventDefault();
		dragging = true;
		initialX = event.clientX;
		initialWidth = width;
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(event) {
		if (!dragging) return;
		const delta = event.clientX - initialX;
		const newWidth = Math.min(
			Math.max(initialWidth + delta, MIN_WIDTH),
			Math.min(MAX_WIDTH, containerWidth - 50)
		);
		width = newWidth;
	}

	function handleMouseUp() {
		dragging = false;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	}

	function setViewport(vp) {
		width = Math.min(vp, containerWidth - 50);
	}

	onMount(() => {
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<section class="flex h-full flex-col overflow-hidden bg-gray-100">
	<header class="flex h-13 items-center justify-between border-b border-gray-200 bg-white px-4">
		<div class="flex items-center gap-4">
			<div class="flex items-center rounded-md border border-gray-200 p-0.5">
				{#each viewports as vp (vp.id)}
					<button
						type="button"
						class={[
							'flex h-7 w-7 items-center justify-center rounded transition-colors',
							currentViewport === vp.id
								? 'bg-gray-100 text-gray-900'
								: 'text-gray-400 hover:text-gray-600'
						]}
						onclick={() => setViewport(vp.width)}
						title={vp.label}
					>
						<Icon icon={vp.icon} class="text-base" />
					</button>
				{/each}
			</div>

			{#if flowPlayer}
				<div class="border-l border-gray-200 pl-4">
					<FlowPlayer {flowPlayer} />
				</div>
			{/if}
		</div>

		<span class="font-mono text-xs text-gray-500">{width}px</span>
	</header>

	<div
		bind:this={containerRef}
		bind:clientWidth={containerWidth}
		bind:clientHeight={containerHeight}
		class="flex flex-1 items-center justify-center overflow-auto p-8"
	>
		<div class="flex items-center">
			<BrowserFrame
				{width}
				height={frameHeight}
				{onReload}
				bind:contentRef={browserContentRef}
			>
				<div class="size-full" style="pointer-events: {dragging ? 'none' : 'auto'};">
					{@render children()}
				</div>
			</BrowserFrame>

			<div class="flex items-center px-2">
				<button
					type="button"
					class="cursor-ew-resize rounded p-2 transition-colors hover:bg-gray-200"
					onmousedown={handleMouseDown}
					aria-label="Resize viewport"
				>
					<div class="h-12 w-1.5 rounded-full bg-gray-400"></div>
				</button>
			</div>
		</div>
	</div>
</section>
