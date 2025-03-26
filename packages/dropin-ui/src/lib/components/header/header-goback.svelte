<script>
	import Icon from '@iconify/svelte';

	/**
	 * @typedef {Object} HeaderGobackProps
	 * @property {string} logoUrl - The URL of the logo
	 * @property {Function} onclick - The function to call when the button is clicked
	 * @property {string} storeName - The name of the store
	 */

	/**
	 * @type {HeaderGobackProps}
	 */
	let { logoUrl = $bindable(), storeName, onclick } = $props();
</script>

<button
	class="group text-muted flex w-1/2 cursor-pointer items-center gap-x-2 transition-transform hover:-translate-x-1"
	{onclick}
>
	<Icon
		icon="fluent-mdl2:back"
		class="text-sm transition-colors duration-200 group-hover:text-black"
	/>
	{#if logoUrl}
		<img
			src={logoUrl}
			alt={storeName}
			class="h-4"
			onerror={() => {
				logoUrl = null;
			}}
		/>
	{:else if storeName}
		<span class="text-sm">{storeName}</span>
	{/if}
</button>
