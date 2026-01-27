<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';

	/**
	 * @typedef {Object} HeaderGobackProps
	 * @property {string} logoUrl - The URL of the logo
	 * @property {Function} onclick - The function to call when the button is clicked
	 * @property {string} storeName - The name of the store
	 * @property {boolean} isLoading - Whether the component is in loading state
	 * @property {boolean} isFullscreen - Whether the layout is in fullscreen mode
	 */

	/**
	 * @type {HeaderGobackProps}
	 */
	let {
		logoUrl = $bindable(),
		storeName,
		onclick,
		isLoading = false,
		isFullscreen = false
	} = $props();
</script>

{#if isFullscreen}
	<div class="flex items-center gap-x-2">
		{#if isLoading}
			<Skeleton variant="text" width="60px" />
		{:else if logoUrl}
			<img
				src={logoUrl}
				alt={storeName}
				class="h-4"
				onerror={() => {
					logoUrl = null;
				}}
			/>
		{:else if storeName}
			<span class="text-muted text-sm uppercase">{storeName}</span>
		{/if}
	</div>
{:else}
	<button
		class="group text-muted flex cursor-pointer items-center gap-x-2 transition-transform hover:-translate-x-1"
		{onclick}
		disabled={isLoading}
	>
		<Icon
			icon="fluent-mdl2:back"
			class="text-sm transition-colors duration-200 group-hover:text-black"
		/>
		{#if isLoading}
			<Skeleton variant="text" width="60px" />
		{:else if logoUrl}
			<img
				src={logoUrl}
				alt={storeName}
				class="h-4"
				onerror={() => {
					logoUrl = null;
				}}
			/>
		{:else if storeName}
			<span class="text-sm uppercase">{storeName}</span>
		{/if}
	</button>
{/if}
