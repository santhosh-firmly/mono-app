<script>
	import { onMount } from 'svelte';
	import rrwebPlayer from 'rrweb-player';
	import 'rrweb-player/dist/style.css';

	let { events, metadata } = $props();
	let playerContainer;
	let player;

	onMount(() => {
		if (events && events.length > 0) {
			player = new rrwebPlayer({
				target: playerContainer,
				props: {
					events,
					autoPlay: false,
					width: 1024,
					height: 768,
					showController: true,
					tags: {
						[metadata?.sessionId]: metadata?.url || 'Session Recording'
					}
				}
			});
		}

		return () => {
			if (player) {
				player.$destroy();
			}
		};
	});
</script>

<div bind:this={playerContainer} class="w-full"></div>
