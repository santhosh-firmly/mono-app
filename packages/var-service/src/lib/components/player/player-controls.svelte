<script>
	import Button from '$lib/components/ui/button.svelte';

	let {
		playing,
		currentTime,
		duration,
		speed,
		skipInactive,
		inactivePeriods,
		onTogglePlay,
		onSeek,
		onChangeSpeed,
		onToggleSkipInactive,
		onToggleFullscreen
	} = $props();

	function handleSeek(e) {
		const newTime = parseInt(e.target.value, 10);
		onSeek(newTime);
	}

	function formatTime(ms) {
		const seconds = Math.floor(ms / 1000);
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	const speeds = [0.5, 1, 2, 4];
</script>

<div class="flex items-center gap-3 text-xs">
	<Button onclick={onTogglePlay} class="px-2">
		{playing ? 'Pause' : 'Play'}
	</Button>

	<span class="text-muted tabular-nums">
		{formatTime(currentTime)} / {formatTime(duration)}
	</span>

	<div class="relative flex-1">
		<div class="progress-track">
			<div
				class="progress-fill"
				style="width: {(duration ? currentTime / duration : 0) * 100}%"
			></div>
			{#each inactivePeriods as period, i (i)}
				<div
					class="inactive-period"
					style="left: {(duration ? period.start / duration : 0) *
						100}%; width: {(duration ? (period.end - period.start) / duration : 0) *
						100}%;"
				></div>
			{/each}
		</div>
		<input
			type="range"
			value={currentTime}
			max={duration}
			oninput={handleSeek}
			class="progress-input"
		/>
	</div>

	<div class="border-border flex gap-1 border-l pl-3">
		{#each speeds as speedValue (speedValue)}
			<Button
				onclick={() => onChangeSpeed(speedValue)}
				class="px-2 {speed === speedValue ? 'text-foreground' : 'text-muted'}"
			>
				{speedValue}x
			</Button>
		{/each}
	</div>

	<div class="border-border border-l pl-3">
		<Button
			onclick={onToggleSkipInactive}
			class="px-2 {skipInactive ? 'text-foreground' : 'text-muted'}"
		>
			Skip idle
		</Button>
	</div>

	<div class="border-border border-l pl-3">
		<Button onclick={onToggleFullscreen} class="px-2">Fullscreen</Button>
	</div>
</div>

<style>
	.progress-track {
		position: relative;
		height: 6px;
		background: var(--color-hover);
		border: 1px solid var(--color-border);
		overflow: visible;
		display: flex;
		align-items: center;
	}

	.progress-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: var(--color-foreground);
		pointer-events: none;
		transition: width 100ms linear;
	}

	.inactive-period {
		position: absolute;
		top: 0;
		height: 100%;
		background: var(--color-muted);
		opacity: 0.2;
		pointer-events: none;
	}

	.progress-input {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: 0;
		height: 100%;
		width: 100%;
		cursor: pointer;
		appearance: none;
		background: transparent;
		margin: 0;
	}

	.progress-input::-webkit-slider-thumb {
		appearance: none;
		width: 12px;
		height: 12px;
		background: var(--color-foreground);
		border-radius: 50%;
		cursor: pointer;
		margin-top: -4px;
		z-index: 10;
	}

	.progress-input::-moz-range-thumb {
		width: 12px;
		height: 12px;
		background: var(--color-foreground);
		border-radius: 50%;
		border: none;
		cursor: pointer;
		z-index: 10;
	}

	.progress-input::-webkit-slider-runnable-track {
		background: transparent;
		height: 100%;
	}

	.progress-input::-moz-range-track {
		background: transparent;
		height: 100%;
	}
</style>
