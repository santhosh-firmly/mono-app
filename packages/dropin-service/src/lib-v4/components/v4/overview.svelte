<script>
	// @ts-nocheck
	import CardStack from './card-stack.svelte';
	import Header from './header.svelte';
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib-v4/utils.js';

	/**
	 * Merchant information to be used in the back button.
	 */
	export let merchantInfo = {};

	/**
	 * Images to show in product card stack.
	 */
	export let images = null;

	/**
	 * Total items in cart.
	 */
	export let itemQuantity;

	/**
	 * Total cost of the current cart
	 */
	export let total = null;

	/**
	 * Function to toggle the expanded state of the header
	 */
	export let toggleExpanded;

	export let showMiniOverview = false;

	let overviewElement;

	onMount(() => {
		let options = {
			root: null,
			rootMargin: '0px',
			threshold: [0]
		};
		const observer = new IntersectionObserver((entries) => {
			showMiniOverview = !entries[0].isIntersecting;
		}, options);

		observer.observe(overviewElement);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div class="relative w-full">
	<div
		class="bg-fy-primary flex w-full flex-col items-center px-3 pb-3 @md:px-0 @md:pt-0 @md:pb-0"
	>
		<div class="hidden w-full @md:block">
			<Header
				{merchantInfo}
				{total}
				itemCount={itemQuantity}
				skeleton={!images}
				on:back-click
				{showMiniOverview}
				doNotExpand={true}
			></Header>
		</div>
		<div
			bind:this={overviewElement}
			class="flex w-full flex-col items-center p-4 @md:items-start"
		>
			<div class="py-7 @md:hidden">
				<CardStack {images} />
			</div>
			{#if !images}
				<div class="bg-fy-on-primary-subtle2 m-1 h-4 w-20 animate-pulse rounded"></div>
				<div class="bg-fy-on-primary-subtle2 m-1 h-6 w-20 animate-pulse rounded"></div>
			{:else}
				<span class="text-fy-on-primary-subtle pt-1">
					Order Total ({itemQuantity} item{itemQuantity > 1 ? 's' : ''})
				</span>
				<span class="text-fy-on-primary text-4xl leading-normal font-semibold"
					>{formatCurrency(total)}</span
				>
			{/if}
			<div class="hidden w-full py-2 @md:block">
				<slot />
			</div>
		</div>
	</div>
	<button
		class="absolute top-0 left-0 h-full w-full border-0 bg-transparent @md:hidden"
		type="button"
		on:click={toggleExpanded}
		aria-label="View order details"
	></button>
</div>
