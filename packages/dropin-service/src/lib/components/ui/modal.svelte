<script>
	import { fade } from 'svelte/transition';
	import ModalBackdrop from './modal-backdrop.svelte';

	/**
	 * @typedef {Object} ModalProps
	 * @property {boolean} show - Modal visibility
	 * @property {Function} onClose - Called when modal is closed
	 * @property {boolean} loading - Prevents closing when true
	 * @property {boolean} useAbsolutePosition - Use absolute positioning (for configurator)
	 * @property {string} ariaLabelledby - Aria labelledby attribute
	 * @property {string} class - Additional classes for modal content
	 * @property {import('svelte').Snippet} children - Modal content
	 */

	/** @type {ModalProps} */
	let {
		show = false,
		onClose = () => {},
		loading = false,
		useAbsolutePosition = false,
		ariaLabelledby = 'modal-title',
		class: className = '',
		children
	} = $props();

	$effect(() => {
		if (typeof document !== 'undefined' && !useAbsolutePosition) {
			if (show) {
				document.body.style.overflow = 'hidden';
				document.body.style.height = '100%';
			} else {
				document.body.style.overflow = 'auto';
				document.body.style.height = 'auto';
			}
		}
	});

	function handleClose() {
		if (!loading) {
			onClose();
		}
	}
</script>

<svelte:window
	onkeydown={(ev) => {
		if (show && ev.key === 'Escape' && !loading) {
			onClose();
		}
	}}
/>

{#if show}
	<ModalBackdrop absolute={useAbsolutePosition} zIndex="z-999" />

	<div
		class={[
			useAbsolutePosition ? 'absolute' : 'fixed',
			'top-0 left-0 z-999 flex size-full flex-col items-center overflow-y-auto'
		]}
		role="dialog"
		aria-modal="true"
		aria-labelledby={ariaLabelledby}
	>
		<button
			class={[
				useAbsolutePosition ? 'absolute' : 'fixed',
				'top-0 left-0 size-full cursor-default'
			]}
			type="button"
			aria-label="Close Modal"
			onclick={handleClose}
			disabled={loading}
		></button>

		<div
			class="pointer-events-none relative z-1000 flex min-h-full items-center justify-center px-4 py-8"
		>
			<div
				class={[
					'pointer-events-auto my-auto w-full max-w-sm overflow-auto rounded-2xl border border-gray-200 bg-white shadow-lg',
					className
				]}
				transition:fade={{ duration: 150 }}
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
