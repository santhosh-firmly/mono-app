<script>
	/**
	 * @typedef {Object} BrowserFrameProps
	 * @property {number} width - Frame width in pixels
	 * @property {number} [height] - Frame height in pixels
	 * @property {Function} [onReload] - Reload button handler
	 * @property {HTMLElement} [contentRef] - Two-way bindable ref to content container
	 * @property {import('svelte').Snippet} [children] - Frame content
	 */

	/** @type {BrowserFrameProps} */
	let {
		width,
		height = 800,
		onReload,
		contentRef = $bindable(null),
		url = 'checkout.firmly.ai',
		children
	} = $props();
</script>

<div
	class="flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg"
	style="width: {width}px; height: {height}px;"
>
	<div class="flex items-center border-b border-gray-200 bg-gray-50 px-3 py-2">
		<div class="flex w-14 gap-1.5">
			<div class="size-2.5 rounded-full bg-gray-300"></div>
			<div class="size-2.5 rounded-full bg-gray-300"></div>
			<div class="size-2.5 rounded-full bg-gray-300"></div>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div
				class="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-0.5"
			>
				<svg
					class="size-3 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				<span class="text-xs text-gray-500">{url}</span>
			</div>
		</div>
		<div class="flex w-14 justify-end">
			{#if onReload}
				<button
					type="button"
					onclick={onReload}
					class="flex size-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
					title="Reload checkout"
				>
					<svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
	<div bind:this={contentRef} data-browser-frame class="relative isolate flex-1 overflow-auto">
		{@render children()}
	</div>
</div>
