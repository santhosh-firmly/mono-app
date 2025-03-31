<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	const dispatch = createEventDispatcher();

	export let isModalOpen;

	export let canCloseModal = true;

	$: {
		if (typeof document !== 'undefined') {
			if (isModalOpen) {
				document.body.style.overflow = 'hidden';
				document.body.style.height = '100%';
			} else {
				document.body.style.overflow = 'auto';
				document.body.style.height = 'auto';
			}
		}
	}

	function close() {
		if (canCloseModal) {
			isModalOpen = false;
			dispatch('modalClosed');
		}
	}
</script>

<svelte:window
	on:keydown={(ev) => {
		if (isModalOpen && ev.key === 'Escape') {
			close();
		}
	}}
/>

{#if isModalOpen}
	<div
		class="fixed top-0 left-0 h-full w-full z-[999] flex flex-col items-center backdrop-blur-sm overflow-y-auto"
		data-testid="modal-overlay"
	>
		<button
			class="fixed left-0 top-0 w-full h-full bg-[#d9d9d9] opacity-20 cursor-default"
			type="button"
			aria-label="Close Modal"
			data-testid="close-modal-button"
			on:click={close}
		/>
		<div
			class="relative pointer-events-none z-[1000] flex items-center justify-center min-h-full py-4"
			transition:fade={{ duration: 150 }}
		>
			<div
				class="bg-fy-surface border border-[#e0e0e0] rounded-lg shadow pointer-events-auto overflow-auto my-auto"
			>
				<slot />
			</div>
		</div>
	</div>
{/if}
