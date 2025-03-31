<script>
	// @ts-nocheck

	import BackButton from './back-button.svelte';
	import { fade, slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { formatCurrency } from '../../utils.js';
	import { isPrimaryDark } from './theme-context.js';

	export let doNotExpand = false;

	/**
	 * Merchant information to be used in the back button.
	 */
	export let merchantInfo = {};

	/**
	 * Merchant name to be used in the header.
	 */
	export let merchantName = '';

	/**
	 * Total cost of the current cart
	 */
	export let total = null;

	/**
	 * Controls whether or not the contents are expanded
	 */
	export let expanded = false;

	/**
	 * Controls whether or not to show the small overview
	 */
	export let showMiniOverview = false;

	/**
	 * Number of items in cart
	 */
	export let itemCount = 0;

	/**
	 * Wheter or not to show the skeleton
	 */
	export let skeleton = false;

	let headerOffset;

	export function toggleExpanded(ev) {
		if (doNotExpand) {
			return;
		}

		ev.stopPropagation();
		expanded = !expanded;
		if (expanded) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	}
</script>

<header class="w-full flex flex-col top-0 z-[120] shadow-sm @md:shadow-none @md:relative sticky">
	<button
		bind:offsetHeight={headerOffset}
		class="w-full flex flex-row justify-between items-center bg-fy-primary z-[101] @md:z-[1]"
		on:click={toggleExpanded}
		type="button"
	>
		<div class="@md:w-full w-1/2 flex items-center">
			<BackButton {...merchantInfo} showBackButton={!expanded} {skeleton} on:back-click />
			<div
				class="h-full relative flex flex-row gap-2 items-center transition duration-300"
				class:-translate-x-6={expanded}
			>
				{#if skeleton}
					<div
						class="inline h-8 rounded-full duration-300 w-8 bg-fy-on-primary-subtle2 animate-pulse group-hover:-translate-x-1 group-hover:animate-none shrink-0"
					/>
					<div
						class="inline leading-[normal] transition duration-300 group-hover:-translate-x-1 shrink w-32 h-8 rounded-lg bg-fy-on-primary-subtle2 animate-pulse group-hover:animate-none"
					/>
				{:else if merchantInfo.largeLogo}
					<img
						class="inline h-4 transition duration-300 group-hover:-translate-x-1 {$isPrimaryDark
							? 'grayscale invert'
							: ''}"
						src={merchantInfo.largeLogo}
						alt="{merchantInfo.displayName} logo"
					/>
				{:else}
					{#if merchantInfo.smallLogo}
						<img
							class="inline h-8 transition duration-300 group-hover:-translate-x-1 rounded-full"
							src={merchantInfo.smallLogo}
							alt="{merchantInfo.displayName} logo"
						/>
					{/if}
					<span
						class="inline uppercase align-middle leading-[normal] transition duration-300 group-hover:-translate-x-1 text-ellipsis overflow-hidden whitespace-nowrap"
					>
						{merchantInfo.displayName || merchantName}
					</span>
				{/if}
			</div>
		</div>
		<div
			class="text-fy-on-primary-subtle text-xs p-1 flex flex-row items-center justify-end h-full w-1/2"
		>
			{#if !doNotExpand}
				<div
					class="text-right flex flex-row gap-1 relative items-center"
					style={`min-width: max-content;`}
				>
					{#if expanded}
						<span class="min-w-max" style="min-width: max-content;">&nbsp;&nbsp;</span>
						<span
							class="absolute right-0 min-w-max"
							style="min-width: max-content;"
							transition:fade={{ duration: 150 }}
						>
							Close
						</span>
					{:else if showMiniOverview}
						<div
							class="absolute flex flex-row items-center right-0"
							transition:fade={{ duration: 150 }}
						>
							<slot name="smallSummary" />
							<span
								class="min-w-max"
								style="min-width: max-content;"
								transition:fade={{ duration: 150 }}
							>
								{total ? formatCurrency(total) : 'Details'}
							</span>
						</div>
					{:else}
						<span
							class="min-w-max"
							style="min-width: max-content;"
							transition:fade={{ duration: 150 }}
						>
							{total ? formatCurrency(total) : 'Details'}
						</span>
						{#if itemCount}
							<span
								class="min-w-max max-[380px]:hidden"
								style="min-width: max-content;"
								transition:fade={{ duration: 150 }}
							>
								({itemCount} items)
							</span>
						{/if}
					{/if}
				</div>
				<svg
					class="inline m-2 transition duration-300 fill-fy-on-primary-subtle"
					class:rotate-180={!expanded}
					xmlns="http://www.w3.org/2000/svg"
					width="10"
					height="6"
					viewBox="0 0 10 6"
				>
					<path
						d="M1.6125 5.74287C1.41993 5.8873 1.18172 5.95742 0.941609 5.94035C0.7015 5.92329 0.475602 5.82019 0.305391 5.64998C0.13518 5.47977 0.0320787 5.25387 0.0150146 5.01376C-0.00204945 4.77365 0.0680685 4.53544 0.212498 4.34287L4.2125 0.34287C4.39943 0.159643 4.65075 0.057013 4.9125 0.057013C5.17425 0.057013 5.42557 0.159643 5.6125 0.34287L9.6125 4.34287C9.75693 4.53544 9.82705 4.77365 9.80998 5.01376C9.79292 5.25387 9.68982 5.47977 9.51961 5.64998C9.34939 5.82019 9.1235 5.92329 8.88339 5.94035C8.64328 5.95742 8.40507 5.8873 8.2125 5.74287L4.9125 2.45287L1.6125 5.75287V5.74287Z"
					/>
				</svg>
			{/if}
		</div>
	</button>
	{#if expanded}
		<div
			transition:slide={{ duration: 300, easing: cubicInOut }}
			class="absolute left-0 top-0 w-full z-[100] bg-fy-primary max-h-screen ov-gradient-y-primary flex flex-col"
			style="padding-top: {headerOffset}px;"
		>
			<slot />
		</div>
	{/if}
</header>

{#if expanded}
	<button
		class="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-2xl bg-black opacity-30 z-[110]"
		on:click={toggleExpanded}
	/>
{/if}
