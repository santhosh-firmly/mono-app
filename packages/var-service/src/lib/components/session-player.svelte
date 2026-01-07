<script>
	import { onMount } from 'svelte';
	import rrwebPlayer from 'rrweb-player';
	import 'rrweb-player/dist/style.css';
	import PlayerControls from './player-controls.svelte';

	let { events } = $props();

	let playerContainer;
	let player;
	let playing = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let speed = $state(1);
	let skipInactive = $state(false);
	let inactivePeriods = $state([]);

	onMount(() => {
		if (!events || events.length === 0) return;

		// Calculate duration from events
		const firstEvent = events[0];
		const lastEvent = events[events.length - 1];
		duration = lastEvent.timestamp - firstEvent.timestamp;

		// Calculate inactive periods (periods with no events > 1 second)
		const periods = [];
		for (let i = 0; i < events.length - 1; i++) {
			const gap = events[i + 1].timestamp - events[i].timestamp;
			if (gap > 1000) {
				periods.push({
					start: events[i].timestamp - firstEvent.timestamp,
					end: events[i + 1].timestamp - firstEvent.timestamp
				});
			}
		}
		inactivePeriods = periods;

		// Initialize rrweb-player without controller
		player = new rrwebPlayer({
			target: playerContainer,
			props: {
				events,
				autoPlay: false,
				speed: 1,
				speedOption: [0.5, 1, 2, 4],
				showController: false,
				skipInactive: false,
				mouseTail: true,
				UNSAFE_replayCanvas: true
			}
		});

		// Listen to player events
		player.addEventListener('ui-update-current-time', (event) => {
			currentTime = event.payload;
		});

		player.addEventListener('ui-update-player-state', (event) => {
			playing = event.payload === 'playing';
		});

		return () => {
			if (player) {
				try {
					player.getReplayer()?.destroy();
				} catch (e) {
					console.error('Error destroying player:', e);
				}
			}
		};
	});

	function togglePlay() {
		if (!player) return;
		player.toggle();
	}

	function handleSeek(newTime) {
		if (!player) return;
		player.goto(newTime, playing);
	}

	function changeSpeed(newSpeed) {
		speed = newSpeed;
		if (player) {
			player.setSpeed(newSpeed);
		}
	}

	function toggleSkipInactive() {
		skipInactive = !skipInactive;
		if (player) {
			player.toggleSkipInactive();
		}
	}

	function toggleFullscreen() {
		const wrapperElement = document.querySelector('.session-player-wrapper');
		if (!wrapperElement) return;

		if (!document.fullscreenElement) {
			wrapperElement.requestFullscreen().then(() => {
				// Force player to resize after entering fullscreen
				if (player) {
					setTimeout(() => {
						player.triggerResize();
					}, 100);
				}
			});
		} else {
			document.exitFullscreen();
		}
	}

	// Listen for fullscreen changes to trigger resize
	if (typeof document !== 'undefined') {
		document.addEventListener('fullscreenchange', () => {
			if (player && !document.fullscreenElement) {
				// Exited fullscreen, resize back
				setTimeout(() => {
					player.triggerResize();
				}, 100);
			}
		});
	}
</script>

<div class="session-player-wrapper">
	<div class="session-player">
		<div bind:this={playerContainer} class="player-container"></div>
	</div>

	<div class="controls-wrapper">
		<PlayerControls
			{playing}
			{currentTime}
			{duration}
			{speed}
			{skipInactive}
			{inactivePeriods}
			onTogglePlay={togglePlay}
			onSeek={handleSeek}
			onChangeSpeed={changeSpeed}
			onToggleSkipInactive={toggleSkipInactive}
			onToggleFullscreen={toggleFullscreen}
		/>
	</div>
</div>

<style>
	.session-player-wrapper {
		background: white;
		border: 1px solid var(--color-border);
		display: inline-block;
	}

	.session-player {
		width: 100%;
		height: 100%;
	}

	.player-container {
		width: 100%;
		height: 100%;
	}

	.controls-wrapper {
		padding: 1rem;
		background: white;
		border: 1px solid var(--color-border);
	}

	/* Override rrweb-player styles */
	.session-player :global(.rr-player) {
		width: 100%;
		max-width: 100%;
		height: auto;
		box-shadow: none !important;
		border: none !important;
		background: transparent !important;
	}

	.session-player :global(.rr-player__frame) {
		background: white !important;
		border: none !important;
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	/* Hide the native controller completely */
	.session-player :global(.rr-controller) {
		display: none !important;
	}

	/* Fullscreen mode styling */
	.session-player-wrapper:fullscreen {
		background: var(--color-background);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow: hidden;
	}

	.session-player-wrapper:fullscreen .session-player {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		overflow: hidden;
	}

	.session-player-wrapper:fullscreen .player-container {
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.session-player-wrapper:fullscreen .controls-wrapper {
		width: 100%;
		max-width: 1200px;
		background: white;
		border: 1px solid var(--color-border);
		margin: 0 auto;
		flex-shrink: 0;
	}

	.session-player-wrapper:fullscreen :global(.rr-player) {
		width: 100% !important;
		height: 100% !important;
		max-width: 100% !important;
		max-height: 100% !important;
	}

	.session-player-wrapper:fullscreen :global(.rr-player__frame) {
		width: 100% !important;
		height: 100% !important;
		max-width: 100% !important;
		max-height: 100% !important;
	}

	.session-player-wrapper:fullscreen :global(.replayer-wrapper) {
		transform: none !important;
		width: 100% !important;
		height: 100% !important;
		position: static !important;
	}

	.session-player-wrapper:fullscreen :global(.replayer-wrapper iframe) {
		width: 100% !important;
		height: 100% !important;
	}

	/* Global rr-player styles */
	:global(.rr-player) {
		box-shadow: none !important;
		border-radius: 0 !important;
		border: none !important;
		margin: 0 auto !important;
		background: transparent !important;
	}

	:global(.rr-player__frame) {
		background: white !important;
		border: none !important;
		border-radius: 0 !important;
		box-shadow: none !important;
	}

	:global(.rr-controller) {
		display: none !important;
	}

	:global(.rr-player:fullscreen) {
		background: var(--color-background) !important;
		padding: 2rem !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	:global(.rr-player:fullscreen .rr-player__frame) {
		max-width: 100% !important;
		max-height: calc(100vh - 100px) !important;
		width: auto !important;
		height: auto !important;
	}
</style>
