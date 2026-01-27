<script>
	import { fade } from 'svelte/transition';

	/**
	 * @typedef {Object} ModalBackdropProps
	 * @property {Function} [onclick] - Click handler (usually to close modal)
	 * @property {boolean} [absolute] - Use absolute instead of fixed positioning
	 * @property {string} [zIndex] - Tailwind z-index class
	 */

	/** @type {ModalBackdropProps} */
	let { onclick = () => {}, absolute = false, zIndex = 'z-100' } = $props();
</script>

<div
	class="{absolute ? 'absolute' : 'fixed'} inset-0 {zIndex} bg-black/40 backdrop-blur-sm"
	role="presentation"
	{onclick}
	in:fade|global={{ duration: 200 }}
	out:fade|global={{ duration: 150 }}
	data-modal-backdrop
></div>
