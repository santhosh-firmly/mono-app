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
		class="fixed top-0 left-0 z-[999] flex h-full w-full flex-col items-center overflow-y-auto backdrop-blur-sm"
		data-testid="modal-overlay"
	>
		<button
			class="fixed top-0 left-0 h-full w-full cursor-default bg-[#d9d9d9] opacity-20"
			type="button"
			aria-label="Close Modal"
			data-testid="close-modal-button"
			on:click={close}
		/>
		<div
			class="pointer-events-none relative z-[1000] flex min-h-full items-center justify-center py-4"
			transition:fade={{ duration: 150 }}
		>
			<div
				class="bg-fy-surface pointer-events-auto my-auto overflow-auto rounded-lg border border-[#e0e0e0] shadow"
			>
				<slot />
			</div>
		</div>
	</div>
{/if}
