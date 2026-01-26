<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} FlowPlayerProps
	 * @property {Object} flowPlayer - Flow player state with play/stop controls
	 */

	/** @type {FlowPlayerProps} */
	let { flowPlayer } = $props();

	let flowOptions = $derived(
		flowPlayer.availableFlows.map((flow) => ({
			value: flow.id,
			label: flow.name
		}))
	);

	function handleSelect(event) {
		flowPlayer.selectFlow(event.target.value);
	}

	function handlePlayStop() {
		if (flowPlayer.isPlaying) {
			flowPlayer.stop();
		} else {
			flowPlayer.play();
		}
	}
</script>

<div class="flex items-center gap-2">
	<select
		class="h-7 w-36 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 transition-colors hover:border-gray-300 focus:ring-2 focus:ring-black/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		value={flowPlayer.currentFlowId || ''}
		onchange={handleSelect}
		disabled={flowPlayer.isPlaying}
	>
		<option value="" disabled>Select flow...</option>
		{#each flowOptions as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	<button
		type="button"
		onclick={handlePlayStop}
		disabled={!flowPlayer.currentFlowId}
		class={[
			'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-colors',
			flowPlayer.isPlaying
				? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
				: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
			!flowPlayer.currentFlowId && 'cursor-not-allowed opacity-50'
		]}
		title={flowPlayer.isPlaying ? 'Stop' : 'Play'}
	>
		<Icon icon={flowPlayer.isPlaying ? 'mdi:stop' : 'mdi:play'} class="text-sm" />
	</button>

	{#if flowPlayer.isPlaying}
		<div class="flex items-center gap-1.5">
			<div class="h-1 w-16 overflow-hidden rounded-full bg-gray-200">
				<div
					class="h-full bg-gray-900 transition-all duration-300"
					style="width: {flowPlayer.progress}%"
				></div>
			</div>
			<span class="text-[10px] text-gray-500">
				{flowPlayer.currentStepIndex + 1}/{flowPlayer.totalSteps}
			</span>
		</div>
	{/if}

	{#if flowPlayer.error}
		<div class="flex items-center gap-1 text-red-500" title={flowPlayer.error}>
			<Icon icon="mdi:alert-circle" class="text-sm" />
		</div>
	{/if}
</div>
