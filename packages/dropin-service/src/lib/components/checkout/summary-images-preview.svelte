<script>
	import UiImage from '$lib/components/ui/image.svelte';

	/**
	 * @typedef {Object} CartContainerProps
	 * @property {Array<string>} images - The images to display
	 * @property {number} [maxImages] - Maximum number of images to show in stack
	 * @property {string} [class] - The class to apply to the container
	 * @property {import('svelte').Snippets} [children] - The children to render
	 */

	/**
	 * @type {CartContainerProps}
	 */
	let { children, images = [], maxImages = 3, class: className } = $props();

	let stackedImages = $derived(images?.slice(0, maxImages).reverse() || []);
	let hasMultipleImages = $derived(images?.length > 1);
</script>

<div class={['flex w-full flex-col items-center justify-center gap-y-8 py-10', className]}>
	<div class="relative flex flex-row" data-testid="image-stack">
		{#each stackedImages as image, index (index)}
			<div
				class="w-32"
				style={[
					index > 0 ? 'margin-left: -104px' : '',
					hasMultipleImages ? `margin-top: ${index * 16}px` : ''
				].join('; ')}
			>
				<UiImage src={image} alt="Product {index + 1}" width={128} height={128} />
			</div>
		{/each}
	</div>
	{@render children?.()}
</div>
