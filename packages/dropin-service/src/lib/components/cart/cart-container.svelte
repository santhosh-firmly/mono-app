<script>
	import UiImage from '$lib/components/ui/ui-image.svelte';

	/**
	 * @typedef {Object} CartContainerProps
	 * @property {Array<string>} images - The images to display
	 * @property {string} [class] - The class to apply to the container
	 * @property {import('svelte').Snippets} [children] - The children to render
	 */

	/**
	 * @type {CartContainerProps}
	 */
	let { children, images, class: className } = $props();
</script>

<div class="flex w-full flex-col items-center justify-center gap-y-8 py-10 {className}">
	<UiImage src={images[0]} alt="" width={128} height={128} />
	{@render children?.()}
</div>
