<script>
	// @ts-nocheck
	import CardImage from './card-image.svelte';
	import { formatCurrency } from '../../utils.js';
	import QuantityController from './quantity-controller.svelte';

	/**
	 * Title or description of the product
	 */
	export let description = '';

	/**
	 * Description of the product variant
	 */
	export let variantDescription = '';

	/**
	 * Product quantity
	 * @type {number}
	 */
	export let quantity;

	export let updateQuantity;
	export let disabled;

	/**
	 * Total line item price
	 * @type {object}
	 * @property {string} currency - The 3 letter currency code.
	 * @property {float} amount - The price value.
	 */
	export let price;

	/**
	 * MSRP for a single line item if any
	 */
	export let msrp = '';

	/**
	 * Product/variant image
	 */
	export let image;

	/**
	 * Recurring period if any
	 */
	export let recurringPeriod;

	/**
	 * Allow change quantity
	 */
	export let allowChangeQuantity = true;

	/**
	 * Show image border on the line items
	 */
	export let showImageBorder = true;

	function getRecurringPeriodDisplay(period) {
		switch (period) {
			case 'monthly':
				return '/mo';
			case 'yearly':
				return '/yr';
			case 'weekly':
				return '/wk';
			default:
				return `/${period}`;
		}
	}
</script>

<div class="flex flex-row w-full gap-2">
	<div class="w-[5rem] min-w-[5rem]">
		<CardImage src={image} {showImageBorder} alt="Product" />
	</div>
	<div class="flex flex-col py-1 text-left grow">
		{#if !description}
			<div
				class="text-sm text-fy-on-primary font-semibold w-20 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse"
			/>
			<div
				class="text-xs text-fy-on-primary-subtle w-28 bg-fy-on-primary-subtle2 rounded h-4 m-1 animate-pulse"
			/>
		{:else}
			<span class="text-sm text-fy-on-primary font-semibold" data-testid="line-item-description"
				>{description}</span
			>
			<span class="text-xs text-fy-on-primary-subtle">{variantDescription || ''}</span>
			{#if allowChangeQuantity}
				<QuantityController {quantity} {disabled} updateItemQuantityImmediately={updateQuantity} />
			{/if}
		{/if}
	</div>
	<div class="flex flex-col py-1">
		{#if !price}
			<div
				class="text-sm text-fy-on-primary font-semibold text-right w-12 bg-fy-on-primary-subtle2 rounded h-4 my-1 animate-pulse"
			/>
		{:else if recurringPeriod}
			<span class="text-sm text-fy-on-primary font-semibold text-right whitespace-nowrap"
				>$0 today</span
			>
		{:else}
			<span
				class="text-sm text-fy-on-primary font-semibold text-right"
				data-testid="line-item-price">{formatCurrency(price)}</span
			>
		{/if}
		{#if msrp?.amount && price.amount !== msrp?.amount * quantity}
			<span class="text-xs text-fy-on-primary-subtle line-through text-right"
				>{formatCurrency({ ...msrp, amount: msrp.amount * quantity })}</span
			>
		{/if}
		{#if recurringPeriod}
			<span class="text-xs text-fy-on-primary-subtle text-right"
				>{formatCurrency(price) + getRecurringPeriodDisplay(recurringPeriod)}</span
			>
		{/if}
	</div>
</div>
