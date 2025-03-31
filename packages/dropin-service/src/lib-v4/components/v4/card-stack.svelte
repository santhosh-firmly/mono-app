<script>
	// @ts-nocheck
	import CardImage from './card-image.svelte';

	/**
	 * List of images to show.
	 */
	export let images = null;

	/**
	 * Max amount of images to be shown
	 */
	export let maxImages = 3;

	/**
	 * Offset of cards on horizontal axis
	 */
	export let horizontalOffsetPx = 24;

	/**
	 * Offset of cards on verical axis
	 */
	export let verticalOffsetPx = 16;
</script>

<div data-testid="card-stack" class="relative flex flex-row">
	{#if !images}
		<div class="w-32">
			<CardImage data-testid="card-stack-skeleton" />
		</div>
	{:else}
		{#each images.slice(-maxImages).reverse() as image, index}
			<div
				data-testid="card-stack-item-{index}"
				class="w-32"
				style={[
					index > 0 ? `margin-left: -${128 - horizontalOffsetPx}px` : '',
					`margin-top: ${index * verticalOffsetPx}px;`
				].join('; ')}
			>
				<CardImage src={image} alt="Product" />
			</div>
		{/each}
	{/if}
</div>
