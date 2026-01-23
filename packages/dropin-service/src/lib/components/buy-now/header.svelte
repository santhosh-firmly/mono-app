<script>
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} BuyNowHeaderProps
	 * @property {Object} partnerPresentation - Partner branding (displayName, largeLogo)
	 * @property {Function} onBackClick - Handler for back button
	 */

	/** @type {BuyNowHeaderProps} */
	let { partnerPresentation, onBackClick } = $props();

	let displayName = $derived(partnerPresentation?.displayName || 'FIRMLY');
	let largeLogo = $derived(partnerPresentation?.largeLogo);
</script>

<header class="bg-background z-10 flex h-12 w-full shrink-0 items-center px-4 shadow">
	<button
		onclick={onBackClick}
		class="group text-muted hover:text-foreground flex items-center transition-colors"
		aria-label={m.go_back()}
	>
		<svg
			class="fill-muted group-hover:fill-foreground inline transition duration-300 group-hover:-translate-x-1"
			xmlns="http://www.w3.org/2000/svg"
			width="17"
			height="16"
			viewBox="0 0 17 16"
			fill="none"
		>
			<path
				d="M16 9C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7V9ZM0.292892 7.29289C-0.0976315 7.68342 -0.0976315 8.31658 0.292892 8.70711L6.65685 15.0711C7.04738 15.4616 7.68054 15.4616 8.07107 15.0711C8.46159 14.6805 8.46159 14.0474 8.07107 13.6569L2.41421 8L8.07107 2.34315C8.46159 1.95262 8.46159 1.31946 8.07107 0.928932C7.68054 0.538408 7.04738 0.538408 6.65685 0.928932L0.292892 7.29289ZM16 7L0.999999 7V9L16 9V7Z"
			/>
		</svg>
	</button>

	<div class="ml-2 flex flex-col items-start justify-center">
		{#if largeLogo}
			<img src={largeLogo} alt={displayName} class="h-4" />
		{:else}
			<span class="text-sm font-semibold uppercase">{displayName}</span>
		{/if}
		<span class="text-muted text-[10px]">{m.powered_by()} firmly</span>
	</div>
</header>
