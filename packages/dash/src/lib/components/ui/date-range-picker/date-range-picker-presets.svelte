<script>
	import { cn } from '$lib/utils.js';
	import { isSameDay } from 'date-fns';

	let {
		presets = [],
		value = { start: null, end: null },
		onSelect = () => {}
	} = $props();

	function isActivePreset(preset) {
		const presetValue = preset.getValue();
		if (presetValue.start === null && presetValue.end === null) {
			return value.start === null && value.end === null;
		}
		if (!value.start || !presetValue.start) return false;
		if (!value.end || !presetValue.end) return false;
		return isSameDay(value.start, presetValue.start) && isSameDay(value.end, presetValue.end);
	}

	function handlePresetClick(preset) {
		const range = preset.getValue();
		onSelect(range);
	}
</script>

<div class="flex flex-col gap-1 border-r pr-4">
	{#each presets as preset}
		{@const isActive = isActivePreset(preset)}
		<button
			type="button"
			class={cn(
				'rounded-md px-3 py-1.5 text-left text-sm transition-colors',
				'hover:bg-accent hover:text-accent-foreground',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				isActive && 'bg-accent font-medium text-accent-foreground'
			)}
			onclick={() => handlePresetClick(preset)}
		>
			{preset.label}
		</button>
	{/each}
</div>
