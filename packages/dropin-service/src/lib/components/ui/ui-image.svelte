<script>
	import Icon from '@iconify/svelte';

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
</script>

<img
	{src}
	{alt}
	{title}
	class="image bg-border rounded-lg shadow-md"
	style="width: {width}px; height: {height}px;"
	onerror={(e) => {
		e.target.style.display = 'none';
		e.target.nextElementSibling.style.display = 'flex';
	}}
/>
<div
	class="bg-border hidden items-center justify-center rounded-lg shadow-md"
	style="width: {width}px; height: {height}px;"
>
	<Icon icon="mdi:image-off" class="text-muted text-2xl" />
</div>
