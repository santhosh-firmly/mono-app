<script>
	import { onMount } from 'svelte';
	import { Replayer } from 'rrweb';
	import Button from './button.svelte';

	let { events, metadata } = $props();

	let container;
	let replayer;
	let playing = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let speed = $state(1);

	onMount(() => {
		if (!events || events.length === 0) return;

		const firstEvent = events[0];
		const lastEvent = events[events.length - 1];
		duration = lastEvent.timestamp - firstEvent.timestamp;

		replayer = new Replayer(events, {
			root: container,
			speed: 1,
			skipInactive: false,
			showWarning: false,
			showDebug: false,
			mouseTail: true,
			pauseAnimation: true
		});

		const wrapper = container.querySelector('.replayer-wrapper');

		const updateScale = () => {
			if (!wrapper || !container) return;
			const iframe = wrapper.querySelector('iframe');
			if (!iframe) return;

			const recordedWidth = parseInt(iframe.getAttribute('width'));
			const recordedHeight = parseInt(iframe.getAttribute('height'));
			const containerWidth = container.clientWidth;

			const scale = containerWidth / recordedWidth;
			const scaledHeight = recordedHeight * scale;

			// Make wrapper position relative so children can be absolutely positioned
			wrapper.style.position = 'relative';
			wrapper.style.transform = `scale(${scale})`;
			wrapper.style.transformOrigin = 'top left';
			wrapper.style.width = `${recordedWidth}px`;
			wrapper.style.height = `${recordedHeight}px`;

			// Position all children absolutely to overlay them
			const children = wrapper.children;
			for (let i = 0; i < children.length; i++) {
				children[i].style.position = 'absolute';
				children[i].style.top = '0';
				children[i].style.left = '0';
			}

			// Ensure mouse cursor and trail are visible and properly positioned
			const mouseCursor = wrapper.querySelector('.replayer-mouse');
			const mouseCanvas = wrapper.querySelector('.replayer-mouse-tail');
			if (mouseCursor) {
				mouseCursor.style.display = 'block';
				mouseCursor.style.pointerEvents = 'none';
			}
			if (mouseCanvas) {
				mouseCanvas.style.display = 'block';
				mouseCanvas.style.pointerEvents = 'none';
			}

			container.style.height = `${scaledHeight}px`;
		};

		if (wrapper) {
			setTimeout(updateScale, 100);
			window.addEventListener('resize', updateScale);
		}

		replayer.on('finish', () => {
			playing = false;
			currentTime = duration;
		});

		const updateInterval = setInterval(() => {
			if (playing && replayer) {
				// getCurrentTime() returns time in milliseconds from the start
				const time = replayer.getCurrentTime();
				currentTime = Math.max(0, Math.min(time, duration));
			}
		}, 100);

		return () => {
			clearInterval(updateInterval);
			window.removeEventListener('resize', updateScale);
			if (replayer) replayer.destroy();
		};
	});

	function togglePlay() {
		if (!replayer) return;

		if (playing) {
			replayer.pause();
			playing = false;
		} else {
			if (currentTime >= duration) {
				currentTime = 0;
				replayer.play(0);
			} else {
				replayer.play(currentTime);
			}
			playing = true;
		}
	}

	function handleSeek(e) {
		if (!replayer) return;
		const newTime = parseInt(e.target.value);
		currentTime = newTime;
		replayer.pause(newTime);
		if (playing) {
			setTimeout(() => replayer.play(newTime), 0);
		}
	}

	function changeSpeed(newSpeed) {
		speed = newSpeed;
		if (replayer) {
			replayer.setConfig({ speed: newSpeed });
		}
	}

	function formatTime(ms) {
		const seconds = Math.floor(ms / 1000);
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="space-y-4">
	<div bind:this={container} class="border-border overflow-hidden border bg-white"></div>

	<div class="flex items-center gap-3 text-xs">
		<Button onclick={togglePlay} class="px-2">
			{playing ? 'Pause' : 'Play'}
		</Button>

		<span class="text-muted tabular-nums">
			{formatTime(currentTime)} / {formatTime(duration)}
		</span>

		<input
			type="range"
			value={currentTime}
			max={duration}
			oninput={handleSeek}
			class="bg-border h-1 flex-1 cursor-pointer appearance-none"
		/>

		<div class="flex gap-1">
			<Button
				onclick={() => changeSpeed(1)}
				class="px-2 {speed === 1 ? 'text-foreground' : 'text-muted'}"
			>
				1x
			</Button>
			<Button
				onclick={() => changeSpeed(2)}
				class="px-2 {speed === 2 ? 'text-foreground' : 'text-muted'}"
			>
				2x
			</Button>
		</div>
	</div>
</div>

<style>
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 12px;
		height: 12px;
		background: var(--color-foreground);
		border-radius: 50%;
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 12px;
		height: 12px;
		background: var(--color-foreground);
		border-radius: 50%;
		border: none;
		cursor: pointer;
	}
</style>
