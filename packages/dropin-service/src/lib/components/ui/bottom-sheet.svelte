<script>
	import { fly } from 'svelte/transition';
	import ModalBackdrop from './modal-backdrop.svelte';

	/**
	 * @typedef {Object} BottomSheetProps
	 * @property {boolean} [open] - Two-way bindable open state
	 * @property {Function} [onOpenChange] - Called when open state changes
	 * @property {import('svelte').Snippet} [trigger] - Trigger button content
	 * @property {import('svelte').Snippet} [close] - Custom close indicator (replaces drag handle)
	 * @property {import('svelte').Snippet} [children] - Sheet content
	 * @property {string} [class] - Additional CSS classes for the sheet container
	 */

	/** @type {BottomSheetProps} */
	let {
		open = $bindable(false),
		onOpenChange = undefined,
		trigger,
		close,
		children,
		class: className = '',
		...restProps
	} = $props();

	function handleOpenChange(newOpen) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}

	function handleKeydown(event) {
		if (open && event.key === 'Escape') {
			handleOpenChange(false);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if trigger}
	<button type="button" onclick={() => handleOpenChange(true)}>
		{@render trigger?.()}
	</button>
{/if}

{#if open}
	<ModalBackdrop absolute onclick={() => handleOpenChange(false)} />

	<!-- Content -->
	<div
		class={[
			'absolute inset-x-0 bottom-0 z-101 flex max-h-[95%] flex-col rounded-t-2xl border-t-2 border-gray-100 bg-white outline-none',
			className
		]}
		in:fly|global={{ y: 300, duration: 300 }}
		out:fly|global={{ y: 300, duration: 200 }}
		role="dialog"
		aria-modal="true"
		data-bottom-sheet-content
		{...restProps}
	>
		{#if close}
			{@render close?.()}
		{:else}
			<div
				class="sticky top-0 mx-auto mt-3 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300"
			></div>
		{/if}

		<div class="relative grow overflow-y-auto bg-white">
			{@render children?.()}
		</div>
	</div>
{/if}
