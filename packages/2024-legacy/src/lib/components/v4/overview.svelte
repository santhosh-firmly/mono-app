<script>
	// @ts-nocheck
	import classNames from 'classnames';
	import CardStack from './card-stack.svelte';
	import Header from './header.svelte';
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/utils.js';

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
	export let quantity;

	/**
	 * Total cost of the current cart
	 */
	export let total = null;

	let toggleExpanded;

	let showMiniOverview = false;

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
	<div class="w-full flex flex-col items-center bg-fy-primary max-md:px-3 max-md:pb-3 max-md:pt-12">
		<Header
			{merchantInfo}
			{total}
			skeleton={!images}
			on:back-click
			bind:toggleExpanded
			{showMiniOverview}
		>
			<div
				slot="smallSummary"
				class="w-7 h-7 relative rounded bg-cover shadow mx-2 bg-gray-300"
				style={`background-image: url(${images?.[0]});`}
			>
				<span
					class={classNames(
						'bg-fy-alert',
						'text-fy-on-alert',
						'shadow',
						'absolute',
						'rounded-full',
						'w-4',
						'h-4',
						'text-xs',
						'right-[-5px]',
						'bottom-[-5px]',
						'flex',
						'items-center',
						'justify-center',
						'font-bold'
					)}
				>
					{quantity || '?'}
				</span>
			</div>
			<div class="px-4 h-full overflow-scroll">
				<slot />
			</div>
		</Header>
		<div
			bind:this={overviewElement}
			class="w-full flex flex-col max-md:items-center md:items-start p-4"
		>
			<div class="md:hidden py-7">
				<CardStack {images} />
			</div>
			{#if !images}
				<div class="w-20 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse" />
				<div class="w-20 bg-fy-on-primary-subtle2 rounded h-6 m-1 animate-pulse" />
			{:else}
				<span class="text-fy-on-primary-subtle pt-1"
					>Order Total ({quantity} item{quantity > 1 ? 's' : ''})</span
				>
				<span class="text-fy-on-primary text-4xl leading-normal font-semibold"
					>{formatCurrency(total)}</span
				>
			{/if}
			<div class="max-md:hidden py-2 w-full">
				<slot />
			</div>
		</div>
	</div>
	<button
		class="absolute top-0 left-0 bg-transparent border-0 w-full h-full md:hidden"
		on:click={toggleExpanded}
	></button>
</div>
