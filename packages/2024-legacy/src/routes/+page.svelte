<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { sModalContent, sModalOptions } from '$lib/browser/storage.js';
	import Modal from '$lib/components/modal.svelte';
	import Home from '$lib/components/home.svelte';

	onMount(() => {
		sModalOptions.set({
			closeButton: true,
			closeOnEsc: false,
			closeOnOuterClick: false
		});
		sModalContent.set(Home);
	});

	let container;
</script>

<div
	id="container"
	bind:this={container}
	class="absolute overflow-hidden left-0 right-0 top-0 bottom-0 bg-green-500 w-screen h-screen"
/>
<Modal content={$sModalContent} modalOptions={$sModalOptions} />
