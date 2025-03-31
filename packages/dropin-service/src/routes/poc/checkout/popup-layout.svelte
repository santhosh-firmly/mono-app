<script>
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	let visible = false;

	onMount(() => {
		visible = true;
	});
</script>

{#if visible}
	<div
		transition:fade={{ duration: 300, easing: cubicInOut }}
		class="w-full h-full fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
	>
		<!-- Backdrop is handled by the bg-black bg-opacity-50 classes above -->
		<div
			class="relative md:w-[85vh] max-md:w-[100vh] min-h-[75vh] max-h-[90vh] rounded-lg shadow-xl overflow-auto m-4 bg-white"
		>
			<slot></slot>
		</div>
	</div>
{/if}
