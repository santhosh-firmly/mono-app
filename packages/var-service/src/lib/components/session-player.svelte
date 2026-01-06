<script>
	import { onMount } from 'svelte';
	import rrwebPlayer from 'rrweb-player';
	import 'rrweb-player/dist/style.css';

	let { events } = $props();

	let playerContainer;
	let player;

	onMount(() => {
		if (!events || events.length === 0) return;

		player = new rrwebPlayer({
			target: playerContainer,
			props: {
				events,
				autoPlay: false,
				speed: 1,
				speedOption: [0.5, 1, 2, 4, 8],
				showController: true,
				skipInactive: true,
				mouseTail: true,
				UNSAFE_replayCanvas: true
			}
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
</script>

<div class="session-player-wrapper">
	<div class="session-player">
		<div bind:this={playerContainer}></div>
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

	.session-player :global(.rr-player) {
		width: 100%;
		max-width: 100%;
		height: auto;
	}

	.session-player :global(.rr-controller) {
		padding-left: 1rem !important;
		padding-right: 1rem !important;
		padding-bottom: 1rem !important;
	}
</style>
