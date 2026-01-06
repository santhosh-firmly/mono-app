<script>
	import Button from './button.svelte';

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
		const newTime = parseInt(e.target.value);
		onSeek(newTime);
	}

	function formatTime(ms) {
		const seconds = Math.floor(ms / 1000);
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
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
			<div class="progress-fill" style="width: {(currentTime / duration) * 100}%"></div>
			{#each inactivePeriods as period, i (i)}
				<div
					class="inactive-period"
					style="left: {(period.start / duration) * 100}%; width: {((period.end -
						period.start) /
						duration) *
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
		<Button
			onclick={() => onChangeSpeed(0.5)}
			class="px-2 {speed === 0.5 ? 'text-foreground' : 'text-muted'}"
		>
			0.5x
		</Button>
		<Button
			onclick={() => onChangeSpeed(1)}
			class="px-2 {speed === 1 ? 'text-foreground' : 'text-muted'}"
		>
			1x
		</Button>
		<Button
			onclick={() => onChangeSpeed(2)}
			class="px-2 {speed === 2 ? 'text-foreground' : 'text-muted'}"
		>
			2x
		</Button>
		<Button
			onclick={() => onChangeSpeed(4)}
			class="px-2 {speed === 4 ? 'text-foreground' : 'text-muted'}"
		>
			4x
		</Button>
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
