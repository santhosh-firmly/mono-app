<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import { isPrimaryDark } from './theme-context.js';

	/**
	 * URL for the small logo displayed before the merchant name.
	 */
	export let smallLogo = '';

	/**
	 * Large logo URL.
	 */
	export let largeLogo = '';

	/**
	 * Display name
	 */
	export let displayName = '';

	/**
	 * Whether or not to show back button
	 */
	export let showBackButton = true;

	/**
	 * Whether or not to show skeleton structure
	 */
	export let skeleton = false;

	const dispatch = createEventDispatcher();
	function onBackClicked(ev) {
		ev.stopPropagation();
		dispatch('back-click');
	}
</script>

<button
	on:click={onBackClicked}
	type="button"
	disabled={!showBackButton}
	class="flex flex-row items-center p-3 gap-2 text-fy-on-primary w-full"
	class:group={showBackButton}
	class:cursor-default={!showBackButton}
>
	<svg
		class="inline fill-fy-on-primary-subtle transition duration-300 group-hover:-translate-x-1 group-hover:fill-fy-on-primary"
		class:invisible={!showBackButton}
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
	<div
		class="h-full relative flex flex-row gap-2 items-center transition duration-300"
		class:-translate-x-6={!showBackButton}
	>
		{#if skeleton}
			<div
				class="inline h-8 rounded-full duration-300 w-8 bg-fy-on-primary-subtle2 animate-pulse group-hover:-translate-x-1 group-hover:animate-none shrink-0"
			/>
			<div
				class="inline leading-[normal] transition duration-300 group-hover:-translate-x-1 shrink w-32 h-8 rounded-lg bg-fy-on-primary-subtle2 animate-pulse group-hover:animate-none"
			/>
		{:else if largeLogo}
			<img
				class="inline h-4 transition duration-300 group-hover:-translate-x-1 {$isPrimaryDark
					? 'grayscale invert'
					: ''}"
				src={largeLogo}
				alt="${displayName} logo"
			/>
		{:else}
			{#if smallLogo}
				<img
					class="inline h-8 transition duration-300 group-hover:-translate-x-1 rounded-full"
					src={smallLogo}
					alt="${displayName} logo"
				/>
			{/if}
			<span
				class="inline uppercase align-middle leading-[normal] transition duration-300 group-hover:-translate-x-1 text-ellipsis overflow-hidden whitespace-nowrap"
			>
				{displayName}
			</span>
		{/if}
	</div>
</button>
