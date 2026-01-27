<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} ImageProps
	 * @property {string} src
	 * @property {string} alt
	 * @property {string} title
	 * @property {number} width
	 * @property {number} height
	 */

	/**
	 * @type {ImageProps}
	 */
	let { src, alt, title, width = 80, height = 80 } = $props();

	let hasError = $state(false);

	function handleError() {
		hasError = true;
	}
</script>

{#if !hasError}
	<img
		{src}
		{alt}
		{title}
		class="image bg-border rounded-lg shadow-md"
		style="width: {width}px; height: {height}px;"
		onerror={handleError}
	/>
{:else}
	<div
		class="bg-border flex items-center justify-center rounded-lg shadow-md"
		style="width: {width}px; height: {height}px;"
	>
		<Icon icon="mdi:image-off" class="text-muted text-2xl" />
	</div>
{/if}
