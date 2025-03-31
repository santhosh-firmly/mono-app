<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { getCurrency } from '$lib-v4/utils.js';
	import QuantityController from './quantity-controller.svelte';

	export let item;
	export let allowModification = true;
</script>

<div
	class="product flex w-full flex-row px-4 py-2"
	class:items-center={!allowModification}
	transition:slide={{
		delay: 250,
		duration: 300,
		x: 100,
		y: 500,
		opacity: 0.5,
		easing: quintOut
	}}
>
	<div class="relative overflow-visible">
		<div class="product-image relative h-fit overflow-hidden rounded">
			<img
				src={item.image.url}
				class="aspect-square h-fit w-20 rounded object-cover"
				alt="line Item"
			/>
		</div>
		{#if !allowModification}
			<div
				class="absolute top-0 right-0 flex h-6 w-6 translate-x-1/4 -translate-y-2/4 items-center justify-center rounded-full bg-gray-600 shadow-lg"
			>
				<span class="p-1 text-center font-semibold text-white">{item.quantity}</span>
			</div>
		{/if}
	</div>
	<div class="flex flex-auto grow flex-col pl-2">
		<span class="product-middle-section text-sm font-medium">{item.description}</span>
		{#if item.variant_description && item.variant_description !== item.description}
			<span class="product-middle-section text-secondary text-xs">{item.variant_description}</span>
		{/if}
		{#if allowModification}
			<QuantityController {item} />
		{/if}
		<span class="font-bold">{@html getCurrency(item.line_price)}</span>
	</div>
</div>

<style>
	.product-middle-section {
		max-width: 180px;
	}

	.product-image {
		/* border: 1px solid black; */
		box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, 0.08);
	}

	.product-image:hover img {
		transition:
			transform 0.5s cubic-bezier(0.19, 1, 0.22, 1),
			box-shadow 0.5s cubic-bezier(0.19, 1, 0.22, 1);
		transform: scale(1.05);
	}
</style>
