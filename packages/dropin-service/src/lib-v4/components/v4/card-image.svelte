<script>
	// @ts-nocheck

	/**
	 * Image source URL or Blob.
	 */
	export let src;

	/**
	 * Image description.
	 */
	export let alt = '';

	export let showImageBorder = true;

	let loaded = false;
	let errored = false;

	function onLoad() {
		loaded = true;
	}

	function onError() {
		errored = true;
	}
</script>

<div class="w-full max-w-[8rem]">
	<img
		data-testid="card-image"
		{src}
		{alt}
		class:image={showImageBorder}
		class:rounded-lg={showImageBorder}
		class:outline={showImageBorder}
		class:outline-1={showImageBorder}
		class:hidden={!loaded}
		on:error={onError}
		on:load={onLoad}
	/>
	{#if errored || !loaded}
		<div
			data-testid="card-image-placeholder"
			class="aspect-square rounded-lg outline outline-1 image"
			class:animate-pulse={!errored}
		/>
	{/if}
</div>

<style lang="scss">
	.image {
		background-color: #e0e0e0;
		outline-color: adjust-color($color: #e0e0e0, $alpha: -0.75);
		outline-offset: -1px;
		box-shadow: -2px 0px 6px 0px rgba(136, 136, 136, 0.25);
	}
</style>
